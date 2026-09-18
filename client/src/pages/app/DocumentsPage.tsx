import { useState, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useDocuments, useUploadDocument, useDeleteDocument } from '../../hooks/useDocuments'
import { updateMeta } from '../../lib/seo'
import { Button } from '../../components/ui/button'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Card } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'
import { FileText, Upload, Download, Trash2, FolderOpen, AlertCircle } from 'lucide-react'

gsap.registerPlugin(useGSAP)

const categories = [
  { value: 'dispute_evidence', label: 'Dispute Evidence' },
  { value: 'bank_statements', label: 'Bank Statements' },
  { value: 'identity_documents', label: 'Identity Documents' },
  { value: 'correspondence', label: 'Correspondence' },
  { value: 'other', label: 'Other' },
]

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DocumentsPage() {
  const { data, isLoading } = useDocuments()
  const uploadDoc = useUploadDocument()
  const deleteDoc = useDeleteDocument()
  const pageRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)
  const [category, setCategory] = useState('other')
  const [uploading, setUploading] = useState(false)
  const [filterCategory, setFilterCategory] = useState('all')
  const [dragOver, setDragOver] = useState(false)

  useGSAP(() => {
    if (pageRef.current) {
      gsap.from(pageRef.current.children, { y: 20, duration: 0.5, stagger: 0.08, ease: 'power2.out' })
    }
  }, { scope: pageRef })

  useGSAP(() => {
    if (gridRef.current) {
      gsap.from(gridRef.current.children, { opacity: 0, y: 10, duration: 0.4, stagger: 0.06, ease: 'power2.out' })
    }
  }, { dependencies: [data], scope: gridRef })

  updateMeta({ title: 'Documents — ScoreLift', description: 'Upload and manage your credit-related documents.' })

  const doUpload = async (file: File) => {
    if (!file) return
    setUploading(true)
    try {
      await uploadDoc.mutateAsync({ file, category })
    } catch {
      /* handled */
    } finally {
      setUploading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await doUpload(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) await doUpload(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document?')) return
    await deleteDoc.mutateAsync(id)
  }

  const docs = data?.documents ?? []
  const filtered = filterCategory === 'all' ? docs : docs.filter(d => d.category === filterCategory)
  const docCount = docs.length

  if (isLoading) {
    return (
      <div ref={pageRef} className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    )
  }

  return (
    <div ref={pageRef} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl text-foreground">Document Vault</h1>
          <p className="mt-1 font-body text-sm text-muted-foreground">
            {docCount} document{docCount !== 1 ? 's' : ''} stored
            {docCount < 5 ? ` (${5 - docCount} free slots remaining)` : docCount >= 5 ? ' (free limit reached)' : ''}
          </p>
        </div>
      </div>

      {docCount < 5 && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Label className="font-body text-sm text-muted-foreground">Category</Label>
              <Select value={category} onValueChange={(v) => v && setCategory(v)}>
                <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div
              ref={dropRef}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
                dragOver
                  ? 'border-primary bg-primary/5'
                  : 'border-[#d4d2c9] hover:border-primary/50 hover:bg-[#faf8f2]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.docx"
                className="hidden"
                onChange={handleUpload}
              />
              <Upload className={`mx-auto size-8 ${dragOver ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className="mt-2 font-body text-sm font-medium text-foreground">
                {uploading ? 'Uploading...' : dragOver ? 'Drop file here' : 'Drag & drop or click to upload'}
              </p>
              <p className="mt-1 font-body text-xs text-muted-foreground">
                PDF, JPG, PNG, or DOCX &middot; Max 10MB
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={filterCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterCategory('all')}
        >
          All
        </Button>
        {categories.map((c) => (
          <Button
            key={c.value}
            variant={filterCategory === c.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterCategory(c.value)}
          >
            {c.label}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <FolderOpen className="mx-auto size-10 text-muted-foreground" />
          <h2 className="mt-3 font-heading text-lg text-foreground">No documents yet</h2>
          <p className="mt-1 font-body text-sm text-muted-foreground">
            Upload documents to support your dispute letters — evidence, statements, and more.
          </p>
        </Card>
      ) : (
        <div ref={gridRef} className="space-y-3">
          {filtered.map((doc) => (
            <Card key={doc.id} className="flex items-center justify-between p-4 transition-colors hover:bg-moss/30">
              <div className="flex items-center gap-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-moss">
                  <FileText className="size-5 text-primary" />
                </div>
                <div>
                  <p className="font-body text-sm font-medium text-foreground">{doc.filename}</p>
                  <p className="font-body text-xs text-muted-foreground">
                    {formatFileSize(doc.fileSize)} &middot; {categories.find(c => c.value === doc.category)?.label ?? doc.category}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`/api/documents/${doc.id}/download`, '_blank')}
                >
                  <Download className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(doc.id)}
                  disabled={deleteDoc.isPending}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}