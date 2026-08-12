// ログインスタンプ演出。ログイン後、その日まだ押していなければ表示する
// (判定はサーバー側 fn_record_login_stamp。AppState.loginStampResultがisNewのときだけ
// HomeMapがこれをマウントする)。
import { useEffect, useState } from 'react'
import { stampImageForDay } from '@/lib/stampArt'

export function LoginStampPopup({ dayNumber }: { dayNumber: number }) {
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
        <img className="stamp-popup-image" src={stampImageForDay(dayNumber)} alt="" />
        <div className="stamp-popup-caption">{dayNumber}日目のスタンプを押しました！</div>
      </div>
    </div>
  )
}
