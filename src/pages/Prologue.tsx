import { useState, type ReactElement } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAppState } from '@/context/AppState'
import { getDialogueBackground } from '@/lib/dialogueBackgrounds'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

/**
 * プロローグ画面(§1.1、docs/adventure-book/HANDOFF-見習い主人公設定と調査ギミック拡張.md)。
 * 同意画面の直後、ホーム(/app)へ行く前に一度だけ挟む導入シーン。見習い主人公「アスピア」と
 * プレイヤー(協力者)の関係性を紹介し、途中でプレイヤー自身のニックネームを登録させる。
 *
 * 通常のカリキュラム(Beat/investigate等)とは無関係の一度きりの専用画面なので、
 * 既存のBeat型を拡張せず、この画面専用の素朴なステップ配列で組んでいる。
 * 完了判定はcurrentStudent.nicknameの有無(サーバー側 students.nickname)で行う
 * (StudentShellの/prologueゲートと同じ判定)。
 */

type Line = { speaker: string; text: string; voiceFont?: 'display' }

const LINES_BEFORE_NICKNAME: Line[] = [
  {
    speaker: 'アスピア',
    text: 'ここは、KMD医療センター。わたしは臨床検査技師の見習いとして、先輩技師と一緒に、来る日も来る日も臨床からの依頼に応えている。',
  },
]

function linesAfterNickname(nickname: string): Line[] {
  return [
    { speaker: '？？？', text: `……${nickname}……` },
    { speaker: 'アスピア', text: 'ん? 今、何か聞こえた……? 空耳、かな。' },
    {
      speaker: 'アスピア',
      text: '……いや、たしかに聞こえた。頭の中に直接語りかけてくるみたい。だ、誰なの? そこにいるんでしょう?',
    },
    {
      speaker: 'アスピア',
      text: '姿は見えないわね……。ま、まさか、妖精? この医療センターには見習いの子たちを助けてくれる妖精がいるってうわさ話は聞いていたけれど……',
    },
    // 先輩技師の呼びかけはアスピアの独白と対比させるため、あえて表示フォントを変える
    // (ユーザー指摘、2026-08-27)。
    {
      speaker: '先輩技師',
      text: 'アスピア! 新しい依頼が来てるわよ、手が空いてるなら早く!',
      voiceFont: 'display',
    },
    {
      speaker: 'アスピア',
      text: 'わっ、は、はい! ……ねえ、あなた。何者かわからないけど——もしよかったら、手伝ってくれない……?',
    },
  ]
}

// 姿が見えない相手(プレイヤー)の選択肢なので、アスピア側から見える仕草(頷く等)は
// 選べない。声/気配としてアスピアに伝わる反応にする(ユーザー指摘、2026-08-27)。
const CHOICE_OPTIONS = ['もちろん、力になるよ', '……(小さく「うん」とだけ)', 'まかせて!']

function linesAfterChoice(nickname: string): Line[] {
  return [
    {
      speaker: 'アスピア',
      text: 'そう言ってもらえると思ってた! なんとなくだけど、あなたの気配、悪いものじゃない気がしてたから。',
    },
    {
      speaker: 'アスピア',
      text: 'わたし、アスピア。この臨床検査室の見習い。至らないところだらけだけど、あなたが知識を貸してくれるなら、きっとやっていける。',
    },
    {
      speaker: 'アスピア',
      text: `${nickname}……って呼んでいい? なんだか、もうずっと前からの相棒みたいな気がしてきた。`,
    },
    {
      speaker: 'アスピア',
      text: 'というわけで、こまかい自己紹介はあとにして——さっそく行こう! 依頼、待たせちゃってるし!',
    },
  ]
}

/** 「会話→ニックネーム入力→会話→選択→会話→終了」の一本道を表す内部フェーズ。 */
type Phase = 'before-input' | 'nickname-form' | 'after-input' | 'choice' | 'after-choice'

export function Prologue() {
  const { currentStudent, setNickname } = useAppState()
  const navigate = useNavigate()

  const [phase, setPhase] = useState<Phase>('before-input')
  const [lineIndex, setLineIndex] = useState(0)
  const [nicknameDraft, setNicknameDraft] = useState('')
  const [nickname, setNicknameLocal] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // マウント時点のニックネーム有無だけを覚えておく(currentStudent.nicknameを毎レンダー
  // 見てしまうと、このページ自身の setNickname 成功でnicknameが真になった瞬間に
  // 「もう終わってる」と誤判定して/appへ弾いてしまい、以降の会話・選択肢が
  // 一切表示できなくなる)。
  const [hadNicknameOnMount] = useState(() => !!currentStudent?.nickname)

  if (!currentStudent) return <Navigate to="/" replace />
  if (!currentStudent.consentAt) return <Navigate to="/consent" replace />
  if (hadNicknameOnMount) return <Navigate to="/app" replace />


  async function submitNickname() {
    const trimmed = nicknameDraft.trim()
    if (!trimmed) {
      setError('ニックネームを入力してください')
      return
    }
    if (trimmed.length > 20) {
      setError('ニックネームは20文字以内で入力してください')
      return
    }
    setPending(true)
    setError(null)
    try {
      await setNickname(trimmed)
      setNicknameLocal(trimmed)
      setPhase('after-input')
      setLineIndex(0)
    } catch (err) {
      setError(err instanceof Error ? err.message : '通信エラーが発生しました')
    } finally {
      setPending(false)
    }
  }

  function advanceLine(lines: Line[], onDone: () => void) {
    if (lineIndex >= lines.length - 1) {
      onDone()
      return
    }
    setLineIndex((i) => i + 1)
  }

  function renderLineBox(lines: Line[], onDone: () => void) {
    const current = lines[Math.min(lineIndex, lines.length - 1)]
    const isLast = lineIndex >= lines.length - 1
    return (
      <button
        type="button"
        className="dialogue-textbox"
        onClick={() => advanceLine(lines, onDone)}
      >
        <span className="dialogue-textbox-speaker">{current.speaker}</span>
        <span
          className={`dialogue-textbox-text${current.voiceFont === 'display' ? ' dialogue-textbox-text--display' : ''}`}
        >
          {current.text}
        </span>
        <span className="dialogue-textbox-hint">{isLast ? '▶ つづける' : '▼ クリックで続ける'}</span>
      </button>
    )
  }

  let body: ReactElement
  if (phase === 'before-input') {
    body = renderLineBox(LINES_BEFORE_NICKNAME, () => {
      setPhase('nickname-form')
    })
  } else if (phase === 'nickname-form') {
    body = (
      <div className="consent-paper rounded-xl p-6 shadow-xl sm:p-8">
        <p className="prologue-prompt">あなたのニックネームを入れてください</p>
        <p className="text-muted-foreground" style={{ fontSize: '0.85rem', marginTop: 4 }}>
          アスピアがこれからあなたを呼ぶときの名前になります。あとから変更はできません。
        </p>
        <Input
          value={nicknameDraft}
          onChange={(e) => setNicknameDraft(e.target.value)}
          placeholder="例: しろ"
          maxLength={20}
          disabled={pending}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void submitNickname()
          }}
          // consent-paper(羊皮紙调の明るいカード)の上に乗るため、Inputの既定色
          // (アプリ全体の暗色テーマ由来)のままだと文字が読めなくなる
          // (ユーザー指摘、2026-08)。この場面専用に明色の見た目へ上書きする。
          className="border-[rgba(90,55,20,0.35)] bg-white/90 text-[#2a1a0a] placeholder:text-[#8a7256] focus-visible:ring-[#8b6914]/40"
          style={{ marginTop: 10 }}
        />
        {error && (
          <p style={{ color: '#b91c1c', fontSize: '0.85rem', marginTop: 6 }}>{error}</p>
        )}
        <div style={{ marginTop: 12 }}>
          <Button type="button" variant="quest" disabled={pending} onClick={() => void submitNickname()}>
            {pending ? '確認中…' : '決める'}
          </Button>
        </div>
      </div>
    )
  } else if (phase === 'after-input') {
    body = renderLineBox(linesAfterNickname(nickname), () => {
      setPhase('choice')
    })
  } else if (phase === 'choice') {
    body = (
      <div className="consent-paper rounded-xl p-6 shadow-xl sm:p-8">
        <p className="prologue-prompt">アスピアに何と返す?</p>
        <div className="prologue-choices">
          {CHOICE_OPTIONS.map((label) => (
            <button
              key={label}
              type="button"
              className="prologue-choice-btn"
              onClick={() => {
                setPhase('after-choice')
                setLineIndex(0)
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    )
  } else {
    body = renderLineBox(linesAfterChoice(nickname), () => {
      navigate('/app')
    })
  }

  const bg = getDialogueBackground('prologue')

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="w-full max-w-2xl">
        <div
          className="dialogue-stage story-stage prologue-stage"
          style={{ backgroundImage: `url(${bg.src})` }}
        >
          {phase === 'before-input' || phase === 'after-input' || phase === 'after-choice'
            ? body
            : null}
        </div>
        {(phase === 'nickname-form' || phase === 'choice') && (
          <div className="prologue-overlay-wrap">{body}</div>
        )}
      </div>
    </div>
  )
}
