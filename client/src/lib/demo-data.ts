export const DEMO_DATA = {
  dashboard: {
    profile: {
      id: 'demo-profile',
      estimatedScore: 642,
      scoreBand: 'fair',
      overallUtilisation: 45,
    },
    scoreEstimate: 642,
    scoreBand: 'fair',
    scoreDelta: 18,
    topActions: [
      { id: 'demo-action-1', actionTitle: 'Reduce credit card utilisation to below 30%', estimatedImpactMin: 18, estimatedImpactMax: 25, effortLevel: 'medium', timeHorizon: '1_3_months', factor: 'credit_utilisation', status: 'todo' },
      { id: 'demo-action-2', actionTitle: 'Set up autopay on all accounts', estimatedImpactMin: 10, estimatedImpactMax: 15, effortLevel: 'low', timeHorizon: 'immediate', factor: 'payment_history', status: 'in_progress' },
      { id: 'demo-action-3', actionTitle: 'Wait 6 months for recent missed payment to age', estimatedImpactMin: 12, estimatedImpactMax: 20, effortLevel: 'low', timeHorizon: '3_6_months', factor: 'payment_history', status: 'todo' },
    ],
    progress: { total: 11, completed: 4, percent: 36 },
    checkin: {
      streak: 3,
      lastCheckin: { completedAt: new Date(Date.now() - 25 * 86400000).toISOString(), scoreEstimate: 642, deltaFromPrevious: 18 },
      totalCheckins: 4,
    },
    milestones: [
      { type: 'first_checkin', name: 'First Check-In', icon: 'calendar-check', unlockedAt: new Date(Date.now() - 330 * 86400000).toISOString() },
      { type: 'streak_3', name: '3-Month Streak', icon: 'flame', unlockedAt: new Date(Date.now() - 240 * 86400000).toISOString() },
    ],
    activeGoal: { id: 'demo-goal', targetScoreBand: 'good', targetDate: new Date(Date.now() + 180 * 86400000).toISOString(), purpose: 'mortgage' },
    scoreTimeline: [
      { date: new Date(Date.now() - 360 * 86400000).toISOString(), score: 580, delta: null },
      { date: new Date(Date.now() - 300 * 86400000).toISOString(), score: 595, delta: 15 },
      { date: new Date(Date.now() - 240 * 86400000).toISOString(), score: 610, delta: 15 },
      { date: new Date(Date.now() - 180 * 86400000).toISOString(), score: 618, delta: 8 },
      { date: new Date(Date.now() - 90 * 86400000).toISOString(), score: 624, delta: 6 },
      { date: new Date(Date.now() - 25 * 86400000).toISOString(), score: 642, delta: 18 },
    ],
  },
  roadmap: {
    items: [
      { id: 'demo-rm-1', userId: 'demo-user', actionTitle: 'Reduce credit card utilisation to below 30%', description: 'Pay down balances on cards above 30% utilisation. Start with the highest-utilisation card first.', factor: 'credit_utilisation', estimatedImpactMin: 18, estimatedImpactMax: 25, effortLevel: 'medium', timeHorizon: '1_3_months', status: 'todo', sortOrder: 0, completedAt: null, createdAt: new Date(Date.now() - 360 * 86400000).toISOString() },
      { id: 'demo-rm-2', userId: 'demo-user', actionTitle: 'Set up autopay on all accounts', description: 'Automate minimum payments on every credit account to prevent accidental late payments.', factor: 'payment_history', estimatedImpactMin: 10, estimatedImpactMax: 15, effortLevel: 'low', timeHorizon: 'immediate', status: 'in_progress', sortOrder: 1, completedAt: null, createdAt: new Date(Date.now() - 360 * 86400000).toISOString() },
      { id: 'demo-rm-3', userId: 'demo-user', actionTitle: 'Wait 6 months for recent missed payment to age', description: 'The impact of missed payments diminishes over time. Letting it age naturally is the only remedy.', factor: 'payment_history', estimatedImpactMin: 12, estimatedImpactMax: 20, effortLevel: 'low', timeHorizon: '3_6_months', status: 'todo', sortOrder: 2, completedAt: null, createdAt: new Date(Date.now() - 360 * 86400000).toISOString() },
      { id: 'demo-rm-4', userId: 'demo-user', actionTitle: 'Request a credit limit increase without a hard pull', description: 'Ask your card issuer for a CLI. Request a "soft pull" to avoid a hard inquiry on your report.', factor: 'credit_utilisation', estimatedImpactMin: 8, estimatedImpactMax: 12, effortLevel: 'low', timeHorizon: '1_3_months', status: 'todo', sortOrder: 3, completedAt: null, createdAt: new Date(Date.now() - 360 * 86400000).toISOString() },
      { id: 'demo-rm-5', userId: 'demo-user', actionTitle: 'Do not open any new credit accounts for 6 months', description: 'Each new account generates a hard inquiry and reduces average account age. Let your profile stabilise.', factor: 'new_inquiries', estimatedImpactMin: 5, estimatedImpactMax: 10, effortLevel: 'low', timeHorizon: '3_6_months', status: 'todo', sortOrder: 4, completedAt: null, createdAt: new Date(Date.now() - 360 * 86400000).toISOString() },
    ]
  },
  milestones: {
    milestones: [
      { type: 'first_checkin', name: 'First Check-In', description: 'Completed your very first monthly check-in', icon: 'calendar-check', unlocked: true, unlockedAt: new Date(Date.now() - 330 * 86400000).toISOString() },
      { type: 'streak_3', name: '3-Month Streak', description: 'Completed 3 consecutive monthly check-ins', icon: 'flame', unlocked: true, unlockedAt: new Date(Date.now() - 240 * 86400000).toISOString() },
      { type: 'streak_6', name: '6-Month Streak', description: 'Completed 6 consecutive monthly check-ins', icon: 'flame', unlocked: true, unlockedAt: new Date(Date.now() - 150 * 86400000).toISOString() },
      { type: 'score_band_improvement', name: 'Score Climber', description: 'Moved up at least one credit score band', icon: 'trending-up', unlocked: true, unlockedAt: new Date(Date.now() - 210 * 86400000).toISOString() },
      { type: 'roadmap_completions_5', name: 'Action Taker', description: 'Completed 5 roadmap actions', icon: 'check-circle', unlocked: true, unlockedAt: new Date(Date.now() - 120 * 86400000).toISOString() },
      { type: 'education_track_complete', name: 'Credit IQ', description: 'Completed an entire education track', icon: 'graduation-cap', unlocked: true, unlockedAt: new Date(Date.now() - 90 * 86400000).toISOString() },
      { type: 'first_dispute', name: 'Defender', description: 'Generated your first dispute letter', icon: 'scroll-text', unlocked: true, unlockedAt: new Date(Date.now() - 60 * 86400000).toISOString() },
      { type: 'streak_12', name: '1-Year Streak', description: 'Completed 12 consecutive monthly check-ins', icon: 'award', unlocked: false, unlockedAt: null },
    ]
  },
  education: {
    tracks: [
      { id: 'demo-track-1', title: 'Credit Score Fundamentals', slug: 'credit-score-fundamentals', description: 'Learn what a credit score is, how it\'s calculated, and why it matters.', icon: 'bar-chart', sortOrder: 0, lessonCount: 5, completedCount: 2, progress: 40 },
      { id: 'demo-track-2', title: 'Credit Cards & Utilisation', slug: 'credit-cards-utilisation', description: 'Master credit card management and understand utilisation.', icon: 'credit-card', sortOrder: 1, lessonCount: 5, completedCount: 1, progress: 20 },
      { id: 'demo-track-3', title: 'Debt & Collections', slug: 'debt-collections', description: 'Understand how different types of debt affect your credit.', icon: 'alert-triangle', sortOrder: 2, lessonCount: 4, completedCount: 0, progress: 0 },
      { id: 'demo-track-4', title: 'Building Credit from Scratch', slug: 'building-credit-scratch', description: 'Start your credit journey with proven strategies.', icon: 'sprout', sortOrder: 3, lessonCount: 5, completedCount: 0, progress: 0 },
      { id: 'demo-track-5', title: 'Mortgage & Loan Readiness', slug: 'mortgage-loan-readiness', description: 'Prepare for major financial commitments.', icon: 'home', sortOrder: 4, lessonCount: 4, completedCount: 0, progress: 0 },
    ]
  },
  goals: {
    goals: [
      { id: 'demo-goal-1', targetScoreBand: 'good', targetDate: new Date(Date.now() + 180 * 86400000).toISOString(), purpose: 'mortgage', isActive: true, createdAt: new Date(Date.now() - 90 * 86400000).toISOString() },
    ]
  },
  simulator: {
    scenarios: [
      { id: 'demo-scenario-1', name: 'Pay off all cards', inputOverrides: { overallUtilisation: 10 }, estimatedDelta: 22, createdAt: new Date(Date.now() - 30 * 86400000).toISOString() },
      { id: 'demo-scenario-2', name: 'Miss a payment', inputOverrides: { missedPaymentCount: 1, missedPaymentRecency: 'within_6_months' }, estimatedDelta: -35, createdAt: new Date(Date.now() - 15 * 86400000).toISOString() },
    ]
  },
  subscription: {
    local: { status: 'free', plan: null },
    direct: null,
  },
  documents: {
    documents: [
      { id: 'demo-doc-1', filename: 'Credit_Report_TransUnion.pdf', fileSize: 245760, fileType: 'application/pdf', category: 'reports', notes: null, linkedDisputeId: null, createdAt: new Date(Date.now() - 180 * 86400000).toISOString() },
      { id: 'demo-doc-2', filename: 'Bank_Statement_Q2.pdf', fileSize: 184320, fileType: 'application/pdf', category: 'financial', notes: null, linkedDisputeId: null, createdAt: new Date(Date.now() - 90 * 86400000).toISOString() },
      { id: 'demo-doc-3', filename: 'ID_Proof_Drivers_License.jpg', fileSize: 460800, fileType: 'image/jpeg', category: 'identification', notes: 'Drivers license for verification', linkedDisputeId: 'demo-dispute-1', createdAt: new Date(Date.now() - 30 * 86400000).toISOString() },
    ]
  },
  disputes: {
    disputes: [
      { id: 'demo-dispute-1', templateId: 'late-payment', formData: { accountName: 'Capital One', accountNumber: '****1234', explanation: 'This was a bank processing error, not a missed payment.' }, renderedHtml: '', r2Key: 'disputes/demo/dispute-1.pdf', status: 'in_progress', bureauName: 'Equifax', createdAt: new Date(Date.now() - 120 * 86400000).toISOString() },
      { id: 'demo-dispute-2', templateId: 'incorrect-balance', formData: { accountName: 'Chase', accountNumber: '****5678', explanation: 'Balance reported does not match my records.' }, renderedHtml: '', r2Key: 'disputes/demo/dispute-2.pdf', status: 'sent', bureauName: 'TransUnion', createdAt: new Date(Date.now() - 60 * 86400000).toISOString() },
    ]
  },
  checkin: {
    status: {
      streak: 3,
      lastCheckin: { completedAt: new Date(Date.now() - 25 * 86400000).toISOString(), scoreEstimate: 642, deltaFromPrevious: 18 },
      daysSinceLastCheckin: 25,
      dueForCheckin: true,
      totalCheckins: 4,
    },
    history: [
      { id: 'demo-ch-1', scoreEstimate: 580, deltaFromPrevious: null, completedAt: new Date(Date.now() - 330 * 86400000).toISOString(), notes: 'First check-in. Score starting at 580.' },
      { id: 'demo-ch-2', scoreEstimate: 610, deltaFromPrevious: 30, completedAt: new Date(Date.now() - 240 * 86400000).toISOString(), notes: 'Reduced utilisation from 65% to 45%.' },
      { id: 'demo-ch-3', scoreEstimate: 624, deltaFromPrevious: 14, completedAt: new Date(Date.now() - 150 * 86400000).toISOString(), notes: 'Missed payment aging well. Opened no new accounts.' },
      { id: 'demo-ch-4', scoreEstimate: 642, deltaFromPrevious: 18, completedAt: new Date(Date.now() - 25 * 86400000).toISOString(), notes: 'Set up autopay on all accounts.' },
    ]
  },
}