import { useState } from 'react'
import type { ClueDef } from '@/mocks/learning'
import { createClueApi } from '@/lib/contentAdminApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { JP } from '@/pages/Admin/strings'

/**
 * 「＋新規作成」ボタン+その場作成ダイアログ。CluePicker(単一選択)とResolveForm
 * (複数選択のチェックリスト)の両方から使う共有部品。
 */
export function CreateClueButton({
  stageId,
  token,
  onCreated,
}: {
  stageId: string
  token: string
  onCreated: (clue: ClueDef) => void
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [summary, setSummary] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    if (!name.trim()) return
    setPending(true)
    setError(null)
    try {
      const { clue } = await createClueApi(token, { stageId, name: name.trim(), summary: summary.trim() })
      onCreated(clue)
      setOpen(false)
      setName('')
      setSummary('')
    } catch (err) {
      setError(err instanceof Error ? err.message : '作成に失敗しました')
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        {JP.newClue}
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{JP.newClue}</DialogTitle>
        </DialogHeader>
        <div className="field">
          <Label>{JP.clueName}</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </div>
        <div className="field">
          <Label>{JP.clueSummary}</Label>
          <Input value={summary} onChange={(e) => setSummary(e.target.value)} />
        </div>
        {error && <p className="banner warn">{error}</p>}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            {JP.cancel}
          </Button>
          <Button type="button" disabled={pending || !name.trim()} onClick={submit}>
            {JP.create}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
