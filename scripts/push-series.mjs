// シリーズ投入スクリプト。
//
// content/series/*.mjs に書いたユニット原稿を、staffログイン→admin-content Edge Function
// (create_clue / create_unit / save_unit_draft / publish_unit)経由でSupabaseへ流し込む。
// UIのstaff content editorが叩くのと全く同じAPI・同じ検証・同じ監査ログを通るので、
// テーブルへの直接INSERTより安全(supabase/seed/seed.tsのtruncate全消しとは別物・
// 本番でも安全に追記できる)。
//
// 使い方:
//   STAFF_FULL_PASSWORD=xxxx node scripts/push-series.mjs content/series/bio-hemolysis.mjs [--publish] [--dry-run]
//
// content ファイルの形(default export):
//   {
//     stageId: 'bio-hemolysis',
//     clues: [{ key: 'hemolysis-impact', name: '...', summary: '...' }, ...],
//     units: [
//       {
//         unitId: 'bio-hemolysis-u1',   // 省略時は新規ユニットとしてcreate_unitする
//         title: '...',
//         requestLine: '...',
//         beats: [
//           // investigate beatは clueId の代わりに clueKey を書く
//           // resolve beatは requiredClueIds の代わりに requiredClueKeys を書く
//           // (このスクリプトが実際のclue idへ解決してから送信する)
//         ],
//       },
//     ],
//   }
//
// 冪等性の注意:
//   - clue: content内のclue名が既存clueと一致すれば再利用(重複作成しない)。一致しなければ新規作成。
//   - unit: unitId を書かずに実行すると毎回新規ユニットを作る(create_unitは常に新規行)。
//     一度実行してunitIdが払い出されたら、そのidを content ファイルに書き戻してから
//     再実行すると、以後は上書き保存(save_unit_draft)になる。

import { config } from 'dotenv'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
config({ path: path.resolve(__dirname, '../.env.local') })

const url = process.env.VITE_SUPABASE_URL
const anonKey = process.env.VITE_SUPABASE_ANON_KEY
if (!url || !anonKey) {
  console.error('[push-series] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY が未設定です(.env.local)')
  process.exit(1)
}

const args = process.argv.slice(2)
const contentPath = args.find((a) => !a.startsWith('--'))
const doPublish = args.includes('--publish')
const dryRun = args.includes('--dry-run')

if (!contentPath) {
  console.error('使い方: node scripts/push-series.mjs <content-file> [--publish] [--dry-run]')
  process.exit(1)
}

const password = process.env.STAFF_FULL_PASSWORD
if (!password && !dryRun) {
  console.error('[push-series] 環境変数 STAFF_FULL_PASSWORD にフル権限スタッフのパスワードを設定してください。')
  process.exit(1)
}

const absContentPath = path.resolve(process.cwd(), contentPath)
const mod = await import(pathToFileURL(absContentPath).href)
const content = mod.default
if (!content?.stageId || !Array.isArray(content.units)) {
  console.error('[push-series] content ファイルの形が不正です(stageId / units が必要)')
  process.exit(1)
}

const supabase = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })

async function callAdminContent(token, action, payload) {
  const { data, error } = await supabase.functions.invoke('admin-content', {
    body: { token, action, payload },
  })
  if (error) {
    const body = await extractErrorBody(error)
    const msg = body.validationErrors ? body.validationErrors.join(' / ') : body.error ?? error.message
    throw new Error(`${action} 失敗: ${msg}`)
  }
  return data
}

async function extractErrorBody(error) {
  const context = error?.context
  if (context && typeof context.json === 'function') {
    try {
      return await context.json()
    } catch {
      /* ignore */
    }
  }
  return {}
}

/** investigate/resolve beatの clueKey / requiredClueKeys を実idへ解決する */
function resolveBeat(beat, keyToId) {
  const b = { ...beat }
  if (b.type === 'investigate' && b.clueKey) {
    const id = keyToId.get(b.clueKey)
    if (!id) throw new Error(`未定義のclueKey: ${b.clueKey}`)
    b.clueId = id
    delete b.clueKey
  }
  if (b.type === 'resolve' && b.requiredClueKeys) {
    b.requiredClueIds = b.requiredClueKeys.map((k) => {
      const id = keyToId.get(k)
      if (!id) throw new Error(`未定義のclueKey: ${k}`)
      return id
    })
    delete b.requiredClueKeys
  }
  return b
}

async function main() {
  console.log(`[push-series] content: ${contentPath}`)
  console.log(`[push-series] stage: ${content.stageId}  publish: ${doPublish}  dryRun: ${dryRun}`)

  // 既存カリキュラムを取得(下書き含む)。clueの重複作成回避と、update対象unitの存在確認に使う。
  const { data: curriculum, error: curErr } = await supabase.rpc('get_curriculum', { published_only: false })
  if (curErr) throw new Error(`get_curriculum失敗: ${curErr.message}`)
  const stage = curriculum.find((s) => s.id === content.stageId)
  if (!stage) throw new Error(`stage not found: ${content.stageId}(先にstage自体を作る必要があります)`)

  const keyToId = new Map()
  const existingByName = new Map((stage.clues ?? []).map((c) => [c.name, c.id]))
  for (const c of content.clues ?? []) {
    const existingId = existingByName.get(c.name)
    if (existingId) {
      console.log(`[clue] 既存を再利用: ${c.name} -> ${existingId}`)
      keyToId.set(c.key, existingId)
    } else {
      keyToId.set(c.key, `__CREATE__:${c.name}`) // dry-run表示用のプレースホルダ
    }
  }

  if (dryRun) {
    for (const u of content.units) {
      const beats = u.beats.map((b) => resolveDryRun(b, keyToId))
      console.log(`\n[dry-run] unit: ${u.unitId ?? '(新規)'} ${u.title}`)
      console.log(JSON.stringify({ title: u.title, requestLine: u.requestLine, beats }, null, 2))
    }
    console.log('\n[dry-run] 実際の送信は行っていません。')
    return
  }

  const { token } = await callLogin()

  // clue作成(未存在分のみ)
  for (const c of content.clues ?? []) {
    if (!keyToId.get(c.key)?.startsWith?.('__CREATE__')) continue
    const { clue } = await callAdminContent(token, 'create_clue', {
      stageId: content.stageId,
      name: c.name,
      summary: c.summary,
    })
    console.log(`[clue] 新規作成: ${c.name} -> ${clue.id}`)
    keyToId.set(c.key, clue.id)
  }

  for (const u of content.units) {
    const beats = u.beats.map((b) => resolveBeat(b, keyToId))
    let unitId = u.unitId
    if (!unitId) {
      const { unit } = await callAdminContent(token, 'create_unit', {
        stageId: content.stageId,
        title: u.title,
        requestLine: u.requestLine,
      })
      unitId = unit.id
      console.log(`[unit] 新規作成: ${u.title} -> ${unitId}(content fileに書き戻して再実行に備えてください)`)
    }

    await callAdminContent(token, 'save_unit_draft', {
      unitId,
      title: u.title,
      requestLine: u.requestLine,
      beats,
    })
    console.log(`[unit] 下書き保存: ${unitId}(beats: ${beats.length})`)

    if (doPublish) {
      await callAdminContent(token, 'publish_unit', { unitId })
      console.log(`[unit] 公開しました: ${unitId}`)
    }
  }

  console.log('\n[push-series] 完了')

  async function callLogin() {
    const { data, error } = await supabase.functions.invoke('auth-staff-login', {
      body: { password },
    })
    if (error) throw new Error(`staffログイン失敗: ${(await extractErrorBody(error)).error ?? error.message}`)
    return data
  }
}

function resolveDryRun(beat, keyToId) {
  const b = { ...beat }
  if (b.type === 'investigate' && b.clueKey) {
    b.clueId = keyToId.get(b.clueKey) ?? `(未定義: ${b.clueKey})`
    delete b.clueKey
  }
  if (b.type === 'resolve' && b.requiredClueKeys) {
    b.requiredClueIds = b.requiredClueKeys.map((k) => keyToId.get(k) ?? `(未定義: ${k})`)
    delete b.requiredClueKeys
  }
  return b
}

main().catch((err) => {
  console.error('[push-series] 失敗:', err.message)
  process.exit(1)
})
