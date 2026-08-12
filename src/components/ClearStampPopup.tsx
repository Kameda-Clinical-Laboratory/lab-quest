// ボス戦(最終確認テスト)提出直後に出す、ねぎらいのスタンプ演出。
// CbtResultが location.state.justSubmitted のときだけマウントする(再訪では出さない)。
import { useEffect, useState } from 'react'
import { CLEAR_STAMP_IMAGE } from '@/lib/stampArt'

export function ClearStampPopup() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (!visible) return
    const t = setTimeout(() => setVisible(false), 2600)
    return () => clearTimeout(t)
  }, [visible])

  if (!visible) return null

  return (
    <div className="stamp-popup-overlay" role="status" onClick={() => setVisible(false)}>
      <div className="stamp-popup-card">
        <img className="stamp-popup-image" src={CLEAR_STAMP_IMAGE} alt="" />
        <div className="stamp-popup-caption">
          ここまでよく頑張りました！
          <br />
          最終確認テストの提出、お疲れさまでした。
        </div>
      </div>
    </div>
  )
}
