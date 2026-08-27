import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAppState } from '@/context/AppState'
import { getDialogueBackground } from '@/lib/dialogueBackgrounds'

/**
 * エピローグ画面。ボス戦(最終確認テスト/CBT)提出後、CBT結果画面から遷移してくる
 * 締めのシーン。プロローグ「小さな声」の対になる会話で、アスピアが実習を振り返って
 * プレイヤー(協力者)へ感謝を伝え、最後に「Fin.」のエンドカードへつながる。
 *
 * プロローグと違い、ニックネーム入力のような分岐要素は無く、会話→Fin.の一本道。
 * プロローグ同様、通常のBeat/investigateとは無関係の一度きりの専用画面なので、
 * 既存のBeat型は使わずこの画面専用の素朴な配列で組んでいる。
 */

type Line = { speaker: string; text: string }

function epilogueLines(nickname: string): Line[] {
  return [
    { speaker: 'アスピア', text: '……終わった。長かったような、あっという間だったような。' },
    {
      speaker: 'アスピア',
      text: '最初は右も左もわからなくて、正直めちゃくちゃ不安だったんだよね。覚えることは山ほどあるし、失敗もいっぱいしたし。',
    },
    {
      speaker: 'アスピア',
      text: 'でも、いつもあなたが隣で知識を貸してくれた。困ったときに聞こえてくるその声に、何度も助けられた。',
    },
    {
      speaker: 'アスピア',
      text: '先輩技師「アスピア、ずいぶん頼もしくなったじゃない」って言ってくれたの、実はすごく嬉しかったんだ。',
    },
    {
      speaker: 'アスピア',
      text: `${nickname}、本当にありがとう。あなたがいなかったら、ここまで来られなかったと思う。`,
    },
    {
      speaker: 'アスピア',
      text: 'これから先も、きっとまた新しい依頼が来ると思う。そのときも、また力を貸してくれる?',
    },
    { speaker: 'アスピア', text: '……なんて、気が早いよね。まずは、今日までお疲れ様。そして、ありがとう。' },
  ]
}

export function Epilogue() {
  const { currentStudent } = useAppState()
  const [lineIndex, setLineIndex] = useState(0)
  const [showFin, setShowFin] = useState(false)

  if (!currentStudent) return <Navigate to="/" replace />
  // ボス戦(最終確認テスト)を提出していない実習生がURL直打ちで来ても弾く。
  if (currentStudent.progress.cbtScore === null || !currentStudent.progress.cbtSubmitted) {
    return <Navigate to="/app" replace />
  }

  const lines = epilogueLines(currentStudent.nickname || currentStudent.name)

  if (showFin) {
    const finBg = getDialogueBackground('fin')
    return (
      <div className="flex min-h-screen items-center justify-center px-6 py-10">
        <div className="w-full max-w-2xl">
          <div
            className="dialogue-stage story-stage"
            style={{ backgroundImage: `url(${finBg.src})` }}
          />
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Link to="/app" className="story-cta">
              ホームへ戻る
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const current = lines[Math.min(lineIndex, lines.length - 1)]
  const isLast = lineIndex >= lines.length - 1
  const bg = getDialogueBackground('epilogue')

  function advance() {
    if (isLast) {
      setShowFin(true)
      return
    }
    setLineIndex((i) => i + 1)
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="w-full max-w-2xl">
        <div
          className="dialogue-stage story-stage"
          style={{ backgroundImage: `url(${bg.src})` }}
        >
          <button type="button" className="dialogue-textbox" onClick={advance}>
            <span className="dialogue-textbox-speaker">{current.speaker}</span>
            <span className="dialogue-textbox-text">{current.text}</span>
            <span className="dialogue-textbox-hint">{isLast ? '▶ おわる' : '▼ クリックで続ける'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
