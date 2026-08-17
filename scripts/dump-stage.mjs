// 開発用ユーティリティ: 指定stageIdの現在のDB内容(下書き含む全件)をJSONで標準出力に表示する。
// 読み取り専用(service_roleキーを使うが書き込みは一切しない)。
//
// 使い方: node scripts/dump-stage.mjs <stageId>
import { config } from 'dotenv'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
config({ path: path.resolve(__dirname, '../.env.local') })

const url = process.env.VITE_SUPABASE_URL
// get_curriculum() は anon/authenticated にしかEXECUTE権限が無い(service_roleには未付与)ため、
// 読み取り専用のこのスクリプトでは anon key を使う。
const key = process.env.VITE_SUPABASE_ANON_KEY
if (!url || !key) {
  console.error('VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY が未設定です(.env.local)')
  process.exit(1)
}

const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

const stageId = process.argv[2]
if (!stageId) {
  console.error('使い方: node scripts/dump-stage.mjs <stageId>')
  process.exit(1)
}

const { data, error } = await db.rpc('get_curriculum', { published_only: false })
if (error) {
  console.error(error)
  process.exit(1)
}
const stage = data.find((s) => s.id === stageId)
if (!stage) {
  console.error(`stage not found: ${stageId}`)
  console.error('存在するstage id一覧:', data.map((s) => s.id).join(', '))
  process.exit(1)
}
console.log(JSON.stringify(stage, null, 2))
