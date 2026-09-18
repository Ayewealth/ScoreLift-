export interface CreditProfileInput {
  scoreBand: ScoreBand
  missedPaymentCount: number
  missedPaymentRecency: MissedPaymentRecency
  overallUtilisation: number
  oldestAccountAge: AccountAge
  totalAccounts: number
  hardInquiries12m: number
  derogatoryMarks: DerogatoryMark[]
  creditMix: CreditMixType[]
}

export type ScoreBand = 'poor' | 'fair' | 'good' | 'very_good' | 'exceptional'
export type MissedPaymentRecency = 'none' | 'within_6_months' | '6_12_months' | '1_2_years' | '2_plus_years'
export type AccountAge = 'under_1_year' | '1_3_years' | '3_7_years' | '7_plus_years'
export type DerogatoryMark = 'collections' | 'bankruptcy' | 'foreclosure'
export type CreditMixType = 'credit_cards' | 'auto_loan' | 'mortgage' | 'personal_loan' | 'student_loan'

export type FactorName = 'payment_history' | 'credit_utilisation' | 'account_age' | 'credit_mix' | 'new_inquiries'
export type HealthStatus = 'excellent' | 'good' | 'needs_work' | 'critical'

export interface FactorHealth {
  factor: FactorName
  label: string
  weight: number
  status: HealthStatus
  score: number
  maxScore: number
}

export interface RoadmapAction {
  factor: FactorName
  actionTitle: string
  description: string
  estimatedImpactMin: number
  estimatedImpactMax: number
  effortLevel: 'low' | 'medium' | 'high'
  timeHorizon: 'immediate' | '1_3_months' | '3_6_months' | '6_12_months'
}

export interface ScoringResult {
  estimatedScore: number
  factorHealth: FactorHealth[]
  roadmapActions: RoadmapAction[]
}

const SCORE_BAND_MAP: Record<ScoreBand, number> = {
  poor: -40,
  fair: 0,
  good: 30,
  very_good: 60,
  exceptional: 80,
}

const MISSED_PAYMENT_MAP: Record<MissedPaymentRecency, number> = {
  none: 0,
  '2_plus_years': -20,
  '1_2_years': -40,
  '6_12_months': -60,
  within_6_months: -60,
}

const ACCOUNT_AGE_MAP: Record<AccountAge, number> = {
  '7_plus_years': 30,
  '3_7_years': 15,
  '1_3_years': 0,
  under_1_year: -20,
}

const INQUIRY_MAP: Record<string, number> = {
  '0': 10,
  '1-2': 0,
  '3-4': -15,
  '5+': -30,
}

const DEROGATORY_MAP: Record<DerogatoryMark, number> = {
  collections: -60,
  bankruptcy: -150,
  foreclosure: -100,
}

function clampScore(score: number): number {
  return Math.max(300, Math.min(850, Math.round(score)))
}

function getInquiryKey(count: number): string {
  if (count === 0) return '0'
  if (count <= 2) return '1-2'
  if (count <= 4) return '3-4'
  return '5+'
}

function getHealthStatus(rawScore: number, maxScore: number): HealthStatus {
  const ratio = maxScore > 0 ? rawScore / maxScore : 0
  if (ratio >= 0.85) return 'excellent'
  if (ratio >= 0.6) return 'good'
  if (ratio >= 0.3) return 'needs_work'
  return 'critical'
}

function generatePaymentHistoryActions(
  missedCount: number,
  recency: MissedPaymentRecency,
  derogatoryMarks: DerogatoryMark[],
): RoadmapAction[] {
  const actions: RoadmapAction[] = []

  if (missedCount > 0 && recency !== 'none') {
    const isRecent = recency === 'within_6_months' || recency === '6_12_months'
    const impact = missedCount >= 2 ? (isRecent ? 30 : 20) : (isRecent ? 25 : 15)
    actions.push({
      factor: 'payment_history',
      actionTitle: 'Pay all outstanding late fees and bring accounts current',
      description: isRecent
        ? 'Recent missed payments have a significant negative impact on your score. Contact each creditor, pay any outstanding late fees, and bring all accounts to current status. Set up autopay to prevent future missed payments.'
        : 'Older missed payments still affect your score but less severely. Pay any outstanding fees and ensure all accounts are current. Consider setting up automatic payments.',
      estimatedImpactMin: impact,
      estimatedImpactMax: impact + 10,
      effortLevel: 'medium',
      timeHorizon: isRecent ? 'immediate' : '1_3_months',
    })
  }

  if (derogatoryMarks.includes('collections')) {
    actions.push({
      factor: 'payment_history',
      actionTitle: 'Pay or settle collection accounts',
      description: 'Collection accounts severely damage your payment history. Contact the collection agency to negotiate a pay-for-delete agreement where the account is removed after payment. Get any agreement in writing before paying.',
      estimatedImpactMin: 40,
      estimatedImpactMax: 70,
      effortLevel: 'high',
      timeHorizon: '3_6_months',
    })
  }

  if (derogatoryMarks.includes('bankruptcy')) {
    actions.push({
      factor: 'payment_history',
      actionTitle: 'Rebuild credit after bankruptcy',
      description: 'Bankruptcy stays on your report for 7-10 years but its impact lessens over time. Focus on building positive payment history with secured credit cards and making all payments on time going forward.',
      estimatedImpactMin: 30,
      estimatedImpactMax: 80,
      effortLevel: 'high',
      timeHorizon: '6_12_months',
    })
  }

  if (derogatoryMarks.includes('foreclosure')) {
    actions.push({
      factor: 'payment_history',
      actionTitle: 'Recover from foreclosure',
      description: 'A foreclosure significantly impacts your credit. Focus on rebuilding with secured credit products, making all payments on time, and waiting for the foreclosure to age. Most lenders require 3-7 years after foreclosure for a new mortgage.',
      estimatedImpactMin: 30,
      estimatedImpactMax: 60,
      effortLevel: 'high',
      timeHorizon: '6_12_months',
    })
  }

  if (missedCount === 0 && derogatoryMarks.length === 0) {
    actions.push({
      factor: 'payment_history',
      actionTitle: 'Maintain your perfect payment history',
      description: 'Set up autopay on all accounts and review your monthly statements to catch any unexpected charges. Payment history is the most important factor in your credit score.',
      estimatedImpactMin: 5,
      estimatedImpactMax: 10,
      effortLevel: 'low',
      timeHorizon: '1_3_months',
    })
  }

  return actions
}

function generateUtilisationActions(
  overallUtilisation: number,
  creditMix: CreditMixType[],
): RoadmapAction[] {
  const actions: RoadmapAction[] = []

  if (overallUtilisation > 30) {
    const impact = overallUtilisation >= 75 ? 50 : overallUtilisation >= 50 ? 35 : 20
    actions.push({
      factor: 'credit_utilisation',
      actionTitle: overallUtilisation >= 50
        ? 'Reduce total credit utilisation below 30%'
        : 'Reduce credit utilisation to under 30%',
      description: `Your current utilisation is ${overallUtilisation}%. Aim to bring it below 30% by paying down balances. Focus on the cards with the highest utilisation first. A good target is under 10% for maximum score benefit.`,
      estimatedImpactMin: impact,
      estimatedImpactMax: impact + 15,
      effortLevel: overallUtilisation >= 75 ? 'high' : 'medium',
      timeHorizon: overallUtilisation >= 50 ? '3_6_months' : '1_3_months',
    })
  }

  if (overallUtilisation <= 30) {
    actions.push({
      factor: 'credit_utilisation',
      actionTitle: overallUtilisation <= 10
        ? 'Keep utilisation low for maximum benefit'
        : 'Maintain utilisation under 30% — target under 10% for best results',
      description: overallUtilisation <= 10
        ? 'Your utilisation is in excellent shape. Continue keeping balances low and consider requesting credit limit increases to further improve your ratio.'
        : 'Your utilisation is at a healthy level. Try to pay down balances further to reach under 10% for the maximum score benefit.',
      estimatedImpactMin: 5,
      estimatedImpactMax: 15,
      effortLevel: 'low',
      timeHorizon: '1_3_months',
    })
  }

  if (creditMix.length > 0) {
    actions.push({
      factor: 'credit_utilisation',
      actionTitle: 'Request a credit limit increase',
      description: 'A higher credit limit can instantly lower your utilisation ratio. Request a limit increase from your existing card issuers — most offer this online and many do not require a hard pull. Ask for a "soft pull" increase specifically.',
      estimatedImpactMin: 8,
      estimatedImpactMax: 15,
      effortLevel: 'low',
      timeHorizon: 'immediate',
    })
  }

  return actions
}

function generateAccountAgeActions(oldestAge: AccountAge): RoadmapAction[] {
  const actions: RoadmapAction[] = []

  if (oldestAge === 'under_1_year') {
    actions.push({
      factor: 'account_age',
      actionTitle: 'Let your accounts age naturally',
      description: 'Account age improves with time. Keep your oldest accounts open and active. Avoid closing your first credit card even if you no longer use it — its age contributes to your score.',
      estimatedImpactMin: 10,
      estimatedImpactMax: 20,
      effortLevel: 'low',
      timeHorizon: '6_12_months',
    })
  }

  if (oldestAge === '1_3_years') {
    actions.push({
      factor: 'account_age',
      actionTitle: 'Continue building account history',
      description: 'Your oldest account is between 1-3 years old. Keep accounts open and in good standing. As they age past the 3-year mark, this factor will improve. Avoid opening too many new accounts at once.',
      estimatedImpactMin: 5,
      estimatedImpactMax: 15,
      effortLevel: 'low',
      timeHorizon: '3_6_months',
    })
  }

  if (oldestAge === '3_7_years' || oldestAge === '7_plus_years') {
    actions.push({
      factor: 'account_age',
      actionTitle: 'Protect your established account history',
      description: 'You have a solid account age foundation. Keep your oldest accounts open and active. Avoid closing long-standing accounts as this can shorten your average account age.',
      estimatedImpactMin: 3,
      estimatedImpactMax: 8,
      effortLevel: 'low',
      timeHorizon: 'immediate',
    })
  }

  return actions
}

function generateCreditMixActions(creditMix: CreditMixType[]): RoadmapAction[] {
  const actions: RoadmapAction[] = []
  const typeCount = creditMix.length

  if (typeCount < 2) {
    actions.push({
      factor: 'credit_mix',
      actionTitle: typeCount === 0
        ? 'Diversify your credit mix'
        : 'Add a different type of credit account',
      description: 'Having only one type of credit limits your score potential. Consider adding a different type of account — for example, if you only have credit cards, a small personal loan could help diversify your credit mix.',
      estimatedImpactMin: 10,
      estimatedImpactMax: 15,
      effortLevel: 'medium',
      timeHorizon: '3_6_months',
    })
  }

  if (typeCount >= 3) {
    actions.push({
      factor: 'credit_mix',
      actionTitle: 'Maintain your diverse credit portfolio',
      description: 'You have a good mix of credit types, which positively impacts your score. Continue managing all account types responsibly and avoid closing accounts unnecessarily.',
      estimatedImpactMin: 3,
      estimatedImpactMax: 5,
      effortLevel: 'low',
      timeHorizon: 'immediate',
    })
  }

  if (typeCount >= 2 && typeCount < 3) {
    actions.push({
      factor: 'credit_mix',
      actionTitle: 'Consider adding one more account type',
      description: 'You have a decent mix with two types of credit. Adding a third type could provide a small boost. Only do this if it makes financial sense — do not take on unnecessary debt.',
      estimatedImpactMin: 5,
      estimatedImpactMax: 10,
      effortLevel: 'medium',
      timeHorizon: '3_6_months',
    })
  }

  return actions
}

function generateInquiryActions(hardInquiries: number): RoadmapAction[] {
  const actions: RoadmapAction[] = []

  if (hardInquiries >= 3) {
    actions.push({
      factor: 'new_inquiries',
      actionTitle: hardInquiries >= 5
        ? 'Stop applying for new credit — let inquiries age'
        : 'Limit new credit applications',
      description: hardInquiries >= 5
        ? `You have ${hardInquiries} hard inquiries in the last 12 months. Each inquiry slightly lowers your score. Avoid applying for any new credit for at least 6 months to let these inquiries age and have less impact.`
        : `You have ${hardInquiries} inquiries. Try to avoid applying for new credit for 3-6 months. Inquiries typically stop affecting your score after 12 months.`,
      estimatedImpactMin: 8,
      estimatedImpactMax: 15,
      effortLevel: 'low',
      timeHorizon: hardInquiries >= 5 ? '6_12_months' : '3_6_months',
    })
  }

  if (hardInquiries === 0) {
    actions.push({
      factor: 'new_inquiries',
      actionTitle: 'Continue avoiding unnecessary hard inquiries',
      description: 'You have no hard inquiries in the last 12 months, which is ideal. Continue to only apply for credit when necessary. When rate shopping for loans or mortgages, try to do it within a 14-45 day window so it counts as a single inquiry.',
      estimatedImpactMin: 3,
      estimatedImpactMax: 5,
      effortLevel: 'low',
      timeHorizon: 'immediate',
    })
  }

  if (hardInquiries >= 1 && hardInquiries < 3) {
    actions.push({
      factor: 'new_inquiries',
      actionTitle: 'Avoid additional hard inquiries',
      description: `You have ${hardInquiries} hard inquiry on your report. While the impact is small, avoid applying for more credit until this inquiry passes the 12-month mark.`,
      estimatedImpactMin: 3,
      estimatedImpactMax: 8,
      effortLevel: 'low',
      timeHorizon: '3_6_months',
    })
  }

  return actions
}

function scorePaymentHistory(
  missedCount: number,
  recency: MissedPaymentRecency,
  derogatoryMarks: DerogatoryMark[],
): { rawScore: number; maxScore: number } {
  let raw = 0
  const maxScore = 60

  if (missedCount === 0) raw += 60
  else if (missedCount >= 1) {
    raw += MISSED_PAYMENT_MAP[recency] ?? -40
    if (missedCount >= 2) raw -= 20
    if (missedCount >= 4) raw -= 20
  }

  for (const mark of derogatoryMarks) {
    raw += DEROGATORY_MAP[mark] ?? 0
  }

  return { rawScore: Math.max(raw, -60), maxScore }
}

function scoreUtilisation(overallUtilisation: number): { rawScore: number; maxScore: number } {
  const maxScore = 50
  let raw = 0

  if (overallUtilisation < 10) raw += 50
  else if (overallUtilisation < 30) raw += 20
  else if (overallUtilisation < 50) raw += 0
  else if (overallUtilisation < 75) raw -= 30
  else raw -= 60

  return { rawScore: raw, maxScore }
}

function scoreAccountAge(oldestAge: AccountAge): { rawScore: number; maxScore: number } {
  const maxScore = 30
  const raw = ACCOUNT_AGE_MAP[oldestAge] ?? 0
  return { rawScore: raw, maxScore }
}

function scoreCreditMix(creditMix: CreditMixType[]): { rawScore: number; maxScore: number } {
  const maxScore = 20
  const typeCount = creditMix.length
  let raw = 0

  if (typeCount >= 3) raw += 20
  else if (typeCount >= 2) raw += 10
  else raw += 0

  return { rawScore: raw, maxScore }
}

function scoreInquiries(hardInquiries: number): { rawScore: number; maxScore: number } {
  const maxScore = 10
  const raw = INQUIRY_MAP[getInquiryKey(hardInquiries)] ?? 0
  return { rawScore: raw, maxScore }
}

export function calculateScore(input: CreditProfileInput): ScoringResult {
  const bandAdjustment = SCORE_BAND_MAP[input.scoreBand] ?? 0

  const paymentHistory = scorePaymentHistory(input.missedPaymentCount, input.missedPaymentRecency, input.derogatoryMarks)
  const utilisation = scoreUtilisation(input.overallUtilisation)
  const accountAge = scoreAccountAge(input.oldestAccountAge)
  const creditMix = scoreCreditMix(input.creditMix)
  const inquiries = scoreInquiries(input.hardInquiries12m)

  const rawTotal =
    bandAdjustment +
    paymentHistory.rawScore +
    utilisation.rawScore +
    accountAge.rawScore +
    creditMix.rawScore +
    inquiries.rawScore

  const estimatedScore = clampScore(680 + rawTotal)

  const factorHealth: FactorHealth[] = [
    { factor: 'payment_history', label: 'Payment History', weight: 35, status: getHealthStatus(paymentHistory.rawScore, paymentHistory.maxScore), score: paymentHistory.rawScore, maxScore: paymentHistory.maxScore },
    { factor: 'credit_utilisation', label: 'Credit Utilisation', weight: 30, status: getHealthStatus(utilisation.rawScore, utilisation.maxScore), score: utilisation.rawScore, maxScore: utilisation.maxScore },
    { factor: 'account_age', label: 'Account Age', weight: 15, status: getHealthStatus(accountAge.rawScore, accountAge.maxScore), score: accountAge.rawScore, maxScore: accountAge.maxScore },
    { factor: 'credit_mix', label: 'Credit Mix', weight: 10, status: getHealthStatus(creditMix.rawScore, creditMix.maxScore), score: creditMix.rawScore, maxScore: creditMix.maxScore },
    { factor: 'new_inquiries', label: 'New Inquiries', weight: 10, status: getHealthStatus(inquiries.rawScore, inquiries.maxScore), score: inquiries.rawScore, maxScore: inquiries.maxScore },
  ]

  const roadmapActions: RoadmapAction[] = [
    ...generatePaymentHistoryActions(input.missedPaymentCount, input.missedPaymentRecency, input.derogatoryMarks),
    ...generateUtilisationActions(input.overallUtilisation, input.creditMix),
    ...generateAccountAgeActions(input.oldestAccountAge),
    ...generateCreditMixActions(input.creditMix),
    ...generateInquiryActions(input.hardInquiries12m),
  ]

  roadmapActions.sort((a, b) => b.estimatedImpactMax - a.estimatedImpactMax)

  return { estimatedScore, factorHealth, roadmapActions }
}

export function getScoreBand(score: number): ScoreBand {
  if (score < 580) return 'poor'
  if (score < 670) return 'fair'
  if (score < 740) return 'good'
  if (score < 800) return 'very_good'
  return 'exceptional'
}

export function getScoreBandLabel(band: ScoreBand): string {
  const labels: Record<ScoreBand, string> = {
    poor: 'Poor (<580)',
    fair: 'Fair (580–669)',
    good: 'Good (670–739)',
    very_good: 'Very Good (740–799)',
    exceptional: 'Exceptional (800+)',
  }
  return labels[band]
}

export function getScoreBandRange(band: ScoreBand): string {
  const ranges: Record<ScoreBand, string> = {
    poor: '300 – 579',
    fair: '580 – 669',
    good: '670 – 739',
    very_good: '740 – 799',
    exceptional: '800 – 850',
  }
  return ranges[band]
}