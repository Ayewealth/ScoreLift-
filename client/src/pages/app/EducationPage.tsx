import { useState, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useEducationTracks, useEducationTrack, useCompleteLesson } from '../../hooks/useEducation'
import { updateMeta } from '../../lib/seo'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'
import { BookOpen, CheckCircle2, ArrowLeft, ArrowRight, GraduationCap, Clock, Sparkles } from 'lucide-react'

gsap.registerPlugin(useGSAP)

const iconMap: Record<string, typeof BookOpen> = {
  'bar-chart': BookOpen,
  'credit-card': BookOpen,
  'alert-triangle': BookOpen,
  'sprout': GraduationCap,
  'home': BookOpen,
}

const quizQuestions: Record<string, { question: string; options: string[]; correct: number }> = {}

export default function EducationPage() {
  const { data: tracksData, isLoading } = useEducationTracks()
  const completeLesson = useCompleteLesson()
  const pageRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const [view, setView] = useState<'tracks' | 'track' | 'lesson'>('tracks')
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null)
  const [quizAnswers, setQuizAnswers] = useState<number[]>([])
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizScore, setQuizScore] = useState(0)

  useGSAP(() => {
    if (pageRef.current) {
      gsap.from(pageRef.current.children, { y: 20, duration: 0.5, stagger: 0.08, ease: 'power2.out' })
    }
  }, { scope: pageRef })

  useGSAP(() => {
    if (contentRef.current) {
      gsap.from(contentRef.current.children, { opacity: 0, y: 10, duration: 0.4, stagger: 0.06, ease: 'power2.out' })
    }
  }, { dependencies: [view, selectedLesson], scope: contentRef })

  updateMeta({ title: 'Education — ScoreLift', description: 'Learn about credit scores, utilisation, and building better credit.' })

  const trackDetail = useEducationTrack(selectedTrack ?? undefined)
  const tracks = tracksData?.tracks ?? []

  const hasTracks = tracks.length > 0

  useGSAP(() => {
    if (contentRef.current && hasTracks) {
      gsap.from(contentRef.current.children, { opacity: 0, y: 10, duration: 0.4, stagger: 0.06, ease: 'power2.out' })
    }
  }, { dependencies: [view, selectedLesson, hasTracks], scope: contentRef })

  const currentTrack = trackDetail.data?.track
  const lessons = trackDetail.data?.lessons ?? []

  const currentLesson = selectedLesson ? lessons.find(l => l.id === selectedLesson) : null
  const currentLessonIndex = selectedLesson ? lessons.findIndex(l => l.id === selectedLesson) : -1

  const lessonQuiz: { question: string; options: string[]; correct: number } | null = selectedLesson
    ? (quizQuestions[selectedLesson] ?? {
        question: 'What is the most important factor in your FICO credit score?',
        options: ['Credit utilisation', 'Payment history', 'Account age', 'Credit mix'],
        correct: 1,
      })
    : null

  const handleStartLesson = (lessonId: string) => {
    setSelectedLesson(lessonId)
    setQuizAnswers([])
    setQuizSubmitted(false)
    setQuizScore(0)
    setView('lesson')
  }

  const handleQuizSubmit = () => {
    let correct = 0
    if (lessonQuiz) {
      quizAnswers.forEach((answer, i) => {
        if (answer === lessonQuiz.correct) correct++
      })
    }
    const score = Math.round((correct / (lessonQuiz ? 1 : 1)) * 100)
    setQuizScore(score)
    setQuizSubmitted(true)

    completeLesson.mutate({ lessonId: selectedLesson!, quizScore: score })
  }

  const handleNextLesson = () => {
    const nextIndex = currentLessonIndex + 1
    if (nextIndex < lessons.length) {
      handleStartLesson(lessons[nextIndex].id)
    } else {
      setView('track')
      setSelectedLesson(null)
    }
  }

  if (isLoading) {
    return (
      <div ref={pageRef} className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div ref={pageRef} className="space-y-6">
      <div className="flex items-center gap-3">
        {view !== 'tracks' && (
          <button
            onClick={() => { setView(view === 'lesson' ? 'track' : 'tracks'); setSelectedLesson(null) }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-5" />
          </button>
        )}
        <h1 className="font-heading text-3xl text-foreground">
          {view === 'tracks' ? 'Education Centre' : view === 'track' ? (currentTrack?.title ?? 'Track') : (currentLesson?.title ?? 'Lesson')}
        </h1>
      </div>

      <div ref={contentRef}>
        {view === 'tracks' && (
          hasTracks ? (
          <div className="grid gap-4 md:grid-cols-3">
            {tracks.map((track) => {
              const Icon = iconMap[track.icon] ?? BookOpen
              return (
                <Card
                  key={track.id}
                  className="cursor-pointer p-6 transition-all hover:shadow-md hover:border-primary/50"
                  onClick={() => { setSelectedTrack(track.id); setView('track') }}
                >
                  <div className="flex size-10 items-center justify-center rounded-lg bg-moss">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <h3 className="mt-3 font-heading text-sm text-foreground">{track.title}</h3>
                  <p className="mt-1 font-body text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {track.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-body text-xs text-muted-foreground">
                      {track.completedCount}/{track.lessonCount} lessons
                    </span>
                    <span className="font-body text-xs font-medium text-primary">
                      {track.progress}%
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-moss">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-700"
                      style={{ width: `${track.progress}%` }}
                    />
                  </div>
                </Card>
              )
            })}
          </div>
          ) : (
            <div className="rounded-xl border border-[#e8e6dd] bg-white p-12 text-center shadow-[0_2px_24px_rgba(74,124,89,0.08)]">
              <BookOpen className="mx-auto size-10 text-[#6a7a65]" />
              <h3 className="mt-4 font-heading text-lg text-[#2d3a2a]">Education Centre Coming Soon</h3>
              <p className="mx-auto mt-2 max-w-md font-body text-sm text-[#6a7a65]">
                Our credit education tracks are being prepared. Check back soon for lessons on credit scores, utilisation, debt management, and more.
              </p>
            </div>
          )
        )}

        {view === 'track' && (
          <div className="space-y-3">
            {trackDetail.isLoading ? (
              <Skeleton className="h-64 rounded-xl" />
            ) : (
              lessons.map((lesson, i) => (
                <Card
                  key={lesson.id}
                  className={`cursor-pointer p-5 transition-all hover:shadow-md ${lesson.completed ? 'border-primary/30' : ''}`}
                  onClick={() => handleStartLesson(lesson.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex size-9 items-center justify-center rounded-full ${lesson.completed ? 'bg-moss' : 'bg-[#f5f0e0]'}`}>
                      {lesson.completed ? (
                        <CheckCircle2 className="size-5 text-primary" />
                      ) : (
                        <span className="font-body text-xs font-medium text-amber">{i + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-body text-sm font-medium text-foreground">{lesson.title}</p>
                      <p className="font-body text-xs text-muted-foreground">
                        <Clock className="inline size-3 mr-1" />
                        {lesson.readTimeMinutes} min read
                      </p>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {view === 'lesson' && currentLesson && (
          <div className="max-w-3xl space-y-6">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="size-3" />
              {currentLesson.readTimeMinutes} min read
              {currentLesson.completed && (
                <span className="flex items-center gap-1 text-primary ml-2">
                  <CheckCircle2 className="size-3" /> Completed
                </span>
              )}
            </div>

            <div
              className="prose prose-sm max-w-none font-body text-foreground"
              dangerouslySetInnerHTML={{ __html: currentLesson.contentHtml }}
            />

            {!currentLesson.completed && !quizSubmitted && lessonQuiz && (
              <Card className="p-6 space-y-4">
                <h3 className="font-heading text-lg text-foreground">Quick Quiz</h3>
                <p className="font-body text-sm text-foreground">{lessonQuiz.question}</p>
                <div className="space-y-2">
                  {lessonQuiz.options.map((option, i) => (
                    <button
                      key={i}
                      className={`w-full rounded-lg border p-3 text-left font-body text-sm transition-colors ${
                        quizAnswers[0] === i
                          ? 'border-primary bg-moss text-foreground'
                          : 'border-border text-foreground hover:bg-moss/50'
                      }`}
                      onClick={() => {
                        const next = [...quizAnswers]
                        next[0] = i
                        setQuizAnswers(next)
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <Button onClick={handleQuizSubmit} disabled={quizAnswers.length === 0}>
                  Submit Answer
                </Button>
              </Card>
            )}

            {quizSubmitted && (
              <Card className="p-6 text-center">
                <div className={`mx-auto flex size-12 items-center justify-center rounded-full ${quizScore >= 100 ? 'bg-moss' : 'bg-[#f5f0e0]'}`}>
                  {quizScore >= 100 ? (
                    <CheckCircle2 className="size-6 text-primary" />
                  ) : (
                    <Sparkles className="size-6 text-amber" />
                  )}
                </div>
                <p className="mt-3 font-heading text-lg text-foreground">
                  {quizScore >= 100 ? 'Correct!' : 'Keep learning'}
                </p>
                <p className="font-body text-sm text-muted-foreground">
                  {quizScore >= 100
                    ? 'Great job! You understood the key concepts.'
                    : 'Review the lesson and try again when you\'re ready.'}
                </p>
                <div className="mt-4 flex justify-center gap-3">
                  {quizScore < 100 && (
                    <Button variant="outline" onClick={() => { setQuizSubmitted(false); setQuizAnswers([]) }}>
                      Try Again
                    </Button>
                  )}
                  <Button onClick={handleNextLesson}>
                    {currentLessonIndex < lessons.length - 1 ? (
                      <>Next Lesson <ArrowRight className="ml-2 size-4" /></>
                    ) : (
                      'Complete Track'
                    )}
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}