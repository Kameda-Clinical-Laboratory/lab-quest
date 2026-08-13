import { useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import type { Beat } from '@/mocks/learning'
import { uploadLecturePdfApi } from '@/lib/contentAdminApi'
import { JP } from '@/pages/Admin/strings'

type LectureBeat = Extract<Beat, { type: 'lecture' }>

const MAX_PDF_BYTES = 20 * 1024 * 1024 // 20MB。Edge Function/Storageバケット側の上限と合わせる。

/** FileをEdge Functionへ渡せる素のbase64文字列(data:...prefixなし)に変換する。 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.slice(result.indexOf(',') + 1))
    }
    reader.onerror = () => reject(reader.error ?? new Error('読み込みに失敗しました'))
    reader.readAsDataURL(file)
  })
}

export function LectureForm({
  beat,
  onChange,
  unitId,
  token,
}: {
  beat: LectureBeat
  onChange: (next: LectureBeat) => void
  unitId: string
  token: string
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFilePicked(file: File | undefined) {
    if (!file) return
    setError(null)
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('PDFファイルを選択してください')
      return
    }
    if (file.size > MAX_PDF_BYTES) {
      setError(`ファイルサイズが大きすぎます（上限${MAX_PDF_BYTES / 1024 / 1024}MB）`)
      return
    }
    setUploading(true)
    try {
      const fileBase64 = await fileToBase64(file)
      const { url } = await uploadLecturePdfApi(token, {
        unitId,
        beatId: beat.id,
        fileName: file.name,
        fileBase64,
      })
      onChange({ ...beat, pdfUrl: url, pdfName: file.name })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'アップロードに失敗しました')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="stack">
      <div className="field">
        <Label>{JP.lectureBody}</Label>
        <RichTextEditor value={beat.body} onChange={(body) => onChange({ ...beat, body })} rows={6} />
      </div>
      <div className="field">
        <Label>{JP.lectureBridge}</Label>
        <textarea
          className="rounded-md border border-input bg-white px-3 py-2"
          rows={2}
          value={beat.bridge ?? ''}
          onChange={(e) => onChange({ ...beat, bridge: e.target.value || undefined })}
        />
      </div>

      <div className="field">
        <Label>{JP.lecturePdf}</Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          style={{ display: 'none' }}
          onChange={(e) => void handleFilePicked(e.target.files?.[0])}
        />
        <div className="inline" style={{ gap: 8, alignItems: 'center' }}>
          {beat.pdfUrl ? (
            <>
              <a href={beat.pdfUrl} target="_blank" rel="noreferrer">
                {beat.pdfName ?? beat.pdfUrl}
              </a>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? JP.lecturePdfUploading : JP.lecturePdfReplace}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onChange({ ...beat, pdfUrl: undefined, pdfName: undefined })}
              >
                {JP.lecturePdfRemove}
              </Button>
            </>
          ) : (
            <>
              <span className="muted">{JP.lecturePdfNone}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? JP.lecturePdfUploading : JP.lecturePdfAdd}
              </Button>
            </>
          )}
        </div>
        {error && <p className="banner warn">{error}</p>}
      </div>

      <div className="field">
        <Label>{JP.lectureVideo}</Label>
        <Input
          value={beat.videoUrl ?? ''}
          placeholder={JP.lectureVideoHint}
          onChange={(e) => onChange({ ...beat, videoUrl: e.target.value || undefined })}
        />
      </div>

      <div className="field" style={{ width: 120 }}>
        <Label>{JP.xp}</Label>
        <Input
          type="number"
          value={beat.xp ?? 0}
          onChange={(e) => onChange({ ...beat, xp: Number(e.target.value) })}
        />
      </div>
    </div>
  )
}
