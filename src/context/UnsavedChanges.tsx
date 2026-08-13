import { createContext, useContext, useState, type ReactNode } from 'react'

/**
 * スタッフ編集画面(コンテンツエディタ等)の「未保存の変更」状態を、ページ本体と
 * StaffShellの共通ヘッダーナビの間で共有するための最小限のコンテキスト。
 *
 * このアプリは(2026-08時点)react-router-domの素の<BrowserRouter>を使っており
 * データルーター(createBrowserRouter)ではないため、useBlockerのようなルーター
 * 標準の離脱ガードは使えない。代わりに、ページ側が isDirty をここへ反映し、
 * ヘッダー側のリンク/ボタンはクリック時に confirmLeave() を呼んで確認する、
 * という素朴な仕組みにしている。
 */
type UnsavedChangesApi = {
  isDirty: boolean
  setDirty: (dirty: boolean) => void
  /** isDirtyでなければ常にtrue(即遷移可)。isDirtyならconfirmで確認し、結果を返す。 */
  confirmLeave: (message?: string) => boolean
}

const DEFAULT_MESSAGE = '保存されていない変更があります。保存せずに移動しますか？'

const UnsavedChangesContext = createContext<UnsavedChangesApi | null>(null)

export function UnsavedChangesProvider({ children }: { children: ReactNode }) {
  const [isDirty, setIsDirty] = useState(false)

  function confirmLeave(message: string = DEFAULT_MESSAGE) {
    if (!isDirty) return true
    return window.confirm(message)
  }

  return (
    <UnsavedChangesContext.Provider value={{ isDirty, setDirty: setIsDirty, confirmLeave }}>
      {children}
    </UnsavedChangesContext.Provider>
  )
}

/** Provider外で使われた場合は「常にdirtyでない」扱いのダミーAPIを返す(呼び出し側を
 * try/catchやnullチェックだらけにしないため)。StaffShell配下では常にProviderがある想定。 */
const NOOP_API: UnsavedChangesApi = {
  isDirty: false,
  setDirty: () => {},
  confirmLeave: () => true,
}

export function useUnsavedChanges(): UnsavedChangesApi {
  return useContext(UnsavedChangesContext) ?? NOOP_API
}
