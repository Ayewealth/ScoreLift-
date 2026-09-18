import { useState, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useDisputeTemplates, useDisputeLetters, useGenerateDispute, useUpdateDisputeStatus } from '../../hooks/useDisputes'
import { useSession } from '../../hooks/useSession'
import { updateMeta } from '../../lib/seo'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Card } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'
import { ScrollText, Download, ArrowLeft, ArrowRight, CheckCircle2, FileText, ExternalLink, Sparkles } from 'lucide-react'

gsap.registerPlugin(useGSAP)

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  sent: 'Sent',
  response_received: 'Response Received',
  resolved: 'Resolved',
}

const statusColors: Record<string, string> = {
  draft: 'bg-[#f5f0e0] text-[#d4a843]',
  sent: 'bg-[#eaf0e8] text-primary',
  response_received: 'bg-blue-50 text-blue-700',
  resolved: 'bg-green-50 text-green-700',
}

export default function DisputesPage() {
  const { data: session } = useSession()
  const { data: templatesData, isLoading: templatesLoading } = useDisputeTemplates()
  const { data: lettersData } = useDisputeLetters()
  const generateDispute = useGenerateDispute()
  const updateStatus = useUpdateDisputeStatus()
  const pageRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const [step, setStep] = useState(0)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [userName, setUserName] = useState(session?.user?.name ?? '')
  const [userAddress, setUserAddress] = useState('')
  const [bureauId, setBureauId] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generatedLetter, setGeneratedLetter] = useState<any>(null)

  useGSAP(() => {
    if (pageRef.current) {
      gsap.from(pageRef.current.children, { y: 20, duration: 0.5, stagger: 0.08, ease: 'power2.out' })
    }
  }, { scope: pageRef })

  useGSAP(() => {
    if (contentRef.current) {
      gsap.from(contentRef.current.children, { opacity: 0, y: 10, duration: 0.4, stagger: 0.06, ease: 'power2.out' })
    }
  }, { dependencies: [step], scope: contentRef })

  updateMeta({ title: 'Dispute Letters — ScoreLift', description: 'Generate professional credit dispute letters.' })

  const templates = templatesData?.templates ?? []
  const letters = lettersData?.disputes ?? []
  const currentTemplate = templates.find(t => t.id === selectedTemplate)

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const res = await generateDispute.mutateAsync({
        templateId: selectedTemplate!,
        formData,
        userName,
        userAddress,
        bureauId: bureauId || undefined,
      })
      setGeneratedLetter(res.dispute)
      setStep(3)
      if (contentRef.current) {
        gsap.from(contentRef.current.children, { opacity: 0, y: 20, duration: 0.5, stagger: 0.1, ease: 'power2.out' })
      }
    } catch {
      /* handled */
    } finally {
      setGenerating(false)
    }
  }

  if (templatesLoading) {
    return (
      <div ref={pageRef} className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  return (
    <div ref={pageRef} className="space-y-6">
      <div className="flex items-center gap-3">
        {step > 0 && (
          <button onClick={() => { setStep(s => s - 1); setGeneratedLetter(null) }} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="size-5" />
          </button>
        )}
        <h1 className="font-heading text-3xl text-foreground">
          {step === 0 ? 'Dispute Letters' : step === 3 ? 'Letter Generated' : 'New Dispute Letter'}
        </h1>
      </div>

      {step > 0 && step < 3 && (
        <div className="flex gap-2 mb-4">
          {[1, 2].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? 'bg-primary' : 'bg-border'}`} />
          ))}
        </div>
      )}

      <div ref={contentRef}>
        {step === 0 && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              {templates.map((t) => (
                <Card
                  key={t.id}
                  className="cursor-pointer p-6 transition-all hover:shadow-md hover:border-primary/50"
                  onClick={() => { setSelectedTemplate(t.id); setStep(1); setFormData({}) }}
                >
                  <div className="flex size-10 items-center justify-center rounded-lg bg-moss">
                    <ScrollText className="size-5 text-primary" />
                  </div>
                  <h3 className="mt-3 font-heading text-sm text-foreground">{t.title}</h3>
                  <p className="mt-1 font-body text-xs text-muted-foreground leading-relaxed">{t.description}</p>
                </Card>
              ))}
            </div>

            {letters.length > 0 && (
              <div className="space-y-3">
                <h2 className="font-heading text-lg text-foreground">Letter History</h2>
                {letters.map((l) => (
                  <Card key={l.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="size-5 text-primary" />
                      <div>
                        <p className="font-body text-sm text-foreground">{l.bureauName ?? 'Credit Bureau'}</p>
                        <p className="font-body text-xs text-muted-foreground">
                          {new Date(l.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 font-body text-[10px] font-medium ${statusColors[l.status]}`}>
                        {statusLabels[l.status] ?? l.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={l.status} onValueChange={(v) => v && updateStatus.mutate({ id: l.id, status: v })}>
                        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="sent">Sent</SelectItem>
                          <SelectItem value="response_received">Response</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                      {l.r2Key && (
                        <Button variant="ghost" size="sm" onClick={() => window.open(`/api/disputes/${l.id}/download`, '_blank')}>
                          <Download className="size-4" />
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 1 && currentTemplate && (
          <Card className="p-6 space-y-4">
            <h2 className="font-heading text-lg text-foreground">{currentTemplate.title}</h2>
            <p className="font-body text-sm text-muted-foreground">{currentTemplate.description}</p>
            <div className="space-y-2">
              <Label htmlFor="userName">Your full name</Label>
              <Input id="userName" value={userName} onChange={(e) => setUserName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userAddress">Your street address</Label>
              <Textarea id="userAddress" value={userAddress} onChange={(e) => setUserAddress(e.target.value)} rows={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bureau">Send to credit bureau (optional)</Label>
              <Select value={bureauId} onValueChange={(v) => v !== null && setBureauId(v)}>
                <SelectTrigger id="bureau" className="w-full"><SelectValue placeholder="No specific bureau" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No specific bureau</SelectItem>
                  <SelectItem value="equifax">Equifax</SelectItem>
                  <SelectItem value="experian">Experian</SelectItem>
                  <SelectItem value="transunion">TransUnion</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setStep(2)} className="w-full">
              Next: Fill Details
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </Card>
        )}

        {step === 2 && currentTemplate && (
          <Card className="p-6 space-y-4">
            <h2 className="font-heading text-lg text-foreground">Letter Details</h2>
            {currentTemplate.fields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                {field.type === 'textarea' ? (
                  <Textarea
                    id={field.key}
                    value={formData[field.key] ?? ''}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    rows={3}
                  />
                ) : (
                  <Input
                    id={field.key}
                    value={formData[field.key] ?? ''}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  />
                )}
              </div>
            ))}
            <Button onClick={handleGenerate} disabled={generating || generateDispute.isPending} className="w-full">
              {generating ? 'Generating PDF...' : 'Generate Letter'}
              <Sparkles className="ml-2 size-4" />
            </Button>
          </Card>
        )}

        {step === 3 && generatedLetter && (
          <div className="space-y-6">
            <Card className="p-8 text-center">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-moss">
                <CheckCircle2 className="size-8 text-primary" />
              </div>
              <h2 className="mt-4 font-heading text-2xl text-foreground">Letter generated!</h2>
              <p className="mt-2 font-body text-sm text-muted-foreground">
                Your dispute letter is ready. Download it as a PDF and send it to the credit bureau.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Button
                  onClick={() => window.open(`/api/disputes/${generatedLetter.id}/download`, '_blank')}
                >
                  <Download className="mr-2 size-4" />
                  Download PDF
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-heading text-lg text-foreground">Bureau Addresses</h3>
              <p className="mt-1 font-body text-sm text-muted-foreground">
                Mail your letter to the appropriate bureau. Use certified mail with return receipt for tracking.
              </p>
              <div className="mt-4 space-y-3">
                <div className="rounded-lg border border-border p-3">
                  <p className="font-body text-sm font-medium text-foreground">Equifax</p>
                  <p className="font-body text-xs text-muted-foreground whitespace-pre-line">Equifax Information Services LLC\nP.O. Box 740256\nAtlanta, GA 30374</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="font-body text-sm font-medium text-foreground">Experian</p>
                  <p className="font-body text-xs text-muted-foreground whitespace-pre-line">Experian\nP.O. Box 4500\nAllen, TX 75013</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="font-body text-sm font-medium text-foreground">TransUnion</p>
                  <p className="font-body text-xs text-muted-foreground whitespace-pre-line">TransUnion LLC\nConsumer Dispute Center\nP.O. Box 2000\nChester, PA 19016</p>
                </div>
              </div>
            </Card>

            <Button variant="outline" onClick={() => { setStep(0); setGeneratedLetter(null); setSelectedTemplate(null) }} className="w-full">
              Create Another Letter
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}