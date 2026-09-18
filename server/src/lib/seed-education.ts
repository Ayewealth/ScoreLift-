import { db } from '../db/client'
import { educationTracks, educationLessons } from '@shared/schema'
import { eq } from 'drizzle-orm'

interface LessonSeed {
  title: string
  slug: string
  contentHtml: string
  readTimeMinutes: number
  sortOrder: number
}

interface TrackSeed {
  title: string
  slug: string
  description: string
  icon: string
  sortOrder: number
  lessons: LessonSeed[]
}

const TRACKS: TrackSeed[] = [
  {
    title: 'Credit Score Fundamentals',
    slug: 'credit-score-fundamentals',
    description: 'Learn what a credit score is, how it\'s calculated, and why it matters for your financial life.',
    icon: 'bar-chart',
    sortOrder: 0,
    lessons: [
      {
        title: 'What Is a Credit Score?',
        slug: 'what-is-a-credit-score',
        readTimeMinutes: 5,
        sortOrder: 0,
        contentHtml: `<p>A credit score is a three-digit number that lenders use to evaluate how likely you are to repay borrowed money. Scores range from 300 to 850, with higher scores indicating lower risk to lenders.</p>
<p>Your credit score affects many areas of your financial life—not just whether you get approved for loans or credit cards. Landlords may check your score before renting an apartment. Insurance companies use it to set premiums. Some employers even review credit history during background checks.</p>
<p>The most widely used scoring model is FICO, created by the Fair Isaac Corporation. FICO scores are used by 90% of top lenders. The second most common is VantageScore, developed by the three major credit bureaus—Equifax, Experian, and TransUnion.</p>
<p>Understanding how credit scores work is the first step to improving yours. ScoreLift uses the same five-factor FICO methodology as the official model, powered by a transparent, deterministic scoring engine that explains exactly why each factor affects your score.</p>`,
      },
      {
        title: 'The Five FICO Factors Explained',
        slug: 'five-fico-factors',
        readTimeMinutes: 7,
        sortOrder: 1,
        contentHtml: `<p>Your FICO score is built from five weighted factors. Understanding each one helps you prioritise which areas to improve first.</p>
<p><strong>1. Payment History (35%)</strong> — The most important factor. Lenders want to see that you pay your bills on time. A single missed payment can drop your score significantly, especially if it's recent.</p>
<p><strong>2. Credit Utilisation (30%)</strong> — This measures how much of your available credit you're using. If you have a $10,000 total credit limit and carry $3,000 in balances, your utilisation is 30%. Lower is better—under 30% is good, under 10% is excellent.</p>
<p><strong>3. Account Age (15%)</strong> — Longer credit history generally means lower risk. This factor considers the age of your oldest account, your newest account, and the average age of all accounts.</p>
<p><strong>4. Credit Mix (10%)</strong> — Having different types of credit—credit cards, auto loans, mortgages, personal loans—shows lenders you can manage various types of debt responsibly.</p>
<p><strong>5. New Inquiries (10%)</strong> — Each time you apply for credit, a hard inquiry appears on your report. Multiple inquiries in a short period can signal financial distress and lower your score.</p>`,
      },
      {
        title: 'How Credit Scores Are Calculated',
        slug: 'how-credit-scores-calculated',
        readTimeMinutes: 6,
        sortOrder: 2,
        contentHtml: `<p>Credit scores are calculated using complex algorithms, but the core logic is straightforward. The FICO model starts with a baseline score of 680 (for the general population) or 700 (for established borrowers) and applies adjustments based on the five factors.</p>
<p><strong>Payment History adjustments:</strong> No missed payments can add up to +60 points. One missed payment in the last year might subtract 60 points, while one from two years ago might subtract only 20 points. Derogatory marks like collections can subtract 50–150 points.</p>
<p><strong>Utilisation adjustments:</strong> Keeping utilisation under 10% can add +50 points. Between 30-49% adds zero. Above 75% can subtract 60 points. Per-card spikes matter too—even if overall utilisation is low, maxing out one card hurts.</p>
<p><strong>Account Age adjustments:</strong> An oldest account over 7 years adds +30 points. Between 3-7 years adds +15. Under 1 year subtracts 20 points. This is why keeping old accounts open matters.</p>
<p><strong>Credit Mix adjustments:</strong> Having 3+ credit types adds +20 points. Two types add +10. Only one type adds zero.</p>
<p><strong>Inquiry adjustments:</strong> Zero hard inquiries in 12 months adds +10 points. 3-4 inquiries subtract 15. 5+ subtract 30.</p>`,
      },
      {
        title: 'Credit Reports vs. Credit Scores',
        slug: 'credit-reports-vs-scores',
        readTimeMinutes: 4,
        sortOrder: 3,
        contentHtml: `<p>A credit report and a credit score are not the same thing, though they're closely related.</p>
<p><strong>Your credit report</strong> is a detailed record of your credit history. It includes personal information (name, address, Social Security number), account history (credit cards, loans, mortgages with payment records), public records (bankruptcies, foreclosures, tax liens), and inquiries (who has accessed your report). You're entitled to one free copy of your report from each bureau every 12 months at AnnualCreditReport.com.</p>
<p><strong>Your credit score</strong> is a numerical summary of the information in your credit report. It's calculated using a scoring model (FICO or VantageScore) that applies weights to different factors in your report.</p>
<p>ScoreLift differs from traditional services because we don't connect to credit bureaus. Instead, you self-report your credit data, and our deterministic scoring engine applies the same FICO methodology to give you an accurate estimated score. This means you can simulate changes and track progress without pulling your official report every time.</p>`,
      },
      {
        title: 'Why Your Score Changes',
        slug: 'why-score-changes',
        readTimeMinutes: 5,
        sortOrder: 4,
        contentHtml: `<p>Credit scores are dynamic—they change as new information is reported to the credit bureaus. Here are the most common reasons your score might go up or down.</p>
<p><strong>Score increases:</strong> Making all payments on time over several months, paying down credit card balances (lowering utilisation), negative items aging past 2+ years, hard inquiries falling off after 12 months, and errors being corrected on your report.</p>
<p><strong>Score decreases:</strong> Missing a payment (the more recent and severe, the bigger the drop), maxing out credit cards (high utilisation), opening several new accounts in a short period, closing old accounts (reduces average account age), and new collections or derogatory marks.</p>
<p><strong>Normal fluctuations:</strong> It's normal to see small changes (5-15 points) month to month even without major events, as credit card balances fluctuate with regular spending.</p>`,
      },
      {
        title: 'Self-Reported vs. Bureau Scores',
        slug: 'self-reported-vs-bureau',
        readTimeMinutes: 4,
        sortOrder: 5,
        contentHtml: `<p>ScoreLift uses a self-reported model. You provide your credit information, and we apply the same FICO methodology to estimate your score. This approach has several advantages.</p>
<p><strong>Why self-report?</strong> Traditional credit reports can contain errors—studies by the Federal Trade Commission found that one in five consumers had an error on at least one report. By self-reporting, you get a transparent, accurate picture based on what you know to be true about your finances.</p>
<p><strong>The ScoreLift difference:</strong> Our scoring engine is fully deterministic—there's no black box. Every point adjustment is explained, every factor is transparent. You can see exactly why your score is what it is and what specific actions will improve it.</p>
<p><strong>Limitations:</strong> Your ScoreLift estimated score may differ from your official FICO score, since official scores are calculated by the bureaus using their own data. However, because our methodology mirrors FICO weighting, your ScoreLift score provides a reliable benchmark for tracking improvement over time.</p>`,
      },
    ],
  },
  {
    title: 'Credit Cards & Utilisation',
    slug: 'credit-cards-utilisation',
    description: 'Master credit card management and understand how utilisation impacts your score.',
    icon: 'credit-card',
    sortOrder: 1,
    lessons: [
      {
        title: 'How Credit Cards Affect Your Score',
        slug: 'how-credit-cards-affect-score',
        readTimeMinutes: 5,
        sortOrder: 0,
        contentHtml: `<p>Credit cards are one of the most accessible tools for building credit—but they can also hurt your score if not managed carefully.</p>
<p><strong>Positive impacts:</strong> On-time payments build a strong payment history. Responsible utilisation demonstrates you can manage revolving credit. Having credit cards contributes to your credit mix. Each card adds to your total available credit, which can lower overall utilisation.</p>
<p><strong>Negative impacts:</strong> Late payments are reported after 30 days and stay on your report for 7 years. High balances increase utilisation—the second most important factor. Opening many cards in a short period generates hard inquiries. Closing old cards reduces your available credit and average account age.</p>
<p>The key to using credit cards effectively is simple: pay your balance in full each month, keep utilisation low, and avoid opening more cards than you need.</p>`,
      },
      {
        title: 'Understanding Credit Utilisation',
        slug: 'understanding-utilisation',
        readTimeMinutes: 6,
        sortOrder: 1,
        contentHtml: `<p>Credit utilisation is the ratio of your credit card balances to your credit limits, expressed as a percentage. It's the second most important factor in your FICO score, accounting for 30% of the total.</p>
<p><strong>How to calculate it:</strong> Add up all your credit card balances, add up all your credit limits, divide total balance by total limit, and multiply by 100. For example, if you have $3,000 in balances and $10,000 in total limits, your utilisation is 30%.</p>
<p><strong>Per-card matters too:</strong> Even if your overall utilisation is low, maxing out a single card can still hurt your score. The FICO model looks at both overall and per-card utilisation.</p>
<p><strong>The thresholds:</strong> Under 10% = excellent (best for your score). 10-29% = good. 30-49% = fair (no penalty, no benefit). 50-74% = poor (starts to hurt). 75%+ = critical (significantly negative impact).</p>
<p>ScoreLift's scoring engine applies these exact thresholds when calculating your estimated score, so you can see exactly where you stand and what improving your utilisation would do.</p>`,
      },
      {
        title: 'Strategies to Lower Utilisation',
        slug: 'strategies-lower-utilisation',
        readTimeMinutes: 6,
        sortOrder: 2,
        contentHtml: `<p>Lowering your credit utilisation is one of the fastest ways to improve your credit score. Here are proven strategies.</p>
<p><strong>1. Pay down balances strategically.</strong> Focus on cards with the highest utilisation first—they're doing the most damage. Even paying a card from 90% to 70% can help.</p>
<p><strong>2. Request a credit limit increase.</strong> If you've had a card for 6+ months with a good payment history, your issuer may grant a limit increase. Ask specifically for a "soft pull" to avoid a hard inquiry. A higher limit with the same balance instantly lowers utilisation.</p>
<p><strong>3. Make multiple payments per month.</strong> Credit card balances are typically reported to bureaus on your statement date. By making a payment before that date, you lower the reported balance—even if you spend more later.</p>
<p><strong>4. Keep old cards open.</strong> Closing a credit card removes its limit from your available credit, which increases your utilisation ratio. Unless there's an annual fee you can't justify, keep old cards open with small, occasional purchases.</p>
<p><strong>5. Use the avalanche method.</strong> List all your cards by utilisation percentage (highest to lowest) and focus extra payments on the top card while making minimums on the rest.</p>`,
      },
      {
        title: 'Authorized Users and Trade Lines',
        slug: 'authorized-users-tradelines',
        readTimeMinutes: 4,
        sortOrder: 3,
        contentHtml: `<p>Becoming an authorized user on someone else's credit card can help you build credit—but it comes with risks.</p>
<p><strong>How it works:</strong> As an authorized user, you receive a card in your name linked to the primary cardholder's account. The account's payment history and credit limit appear on your credit report, potentially boosting your score.</p>
<p><strong>Benefits:</strong> If the primary cardholder has a long history of on-time payments and low utilisation, you inherit that positive history. This is especially useful for young adults building credit for the first time.</p>
<p><strong>Risks:</strong> If the primary cardholder misses payments or runs up high balances, those negatives also appear on your report. You have no control over their spending. Some lenders limit how many authorised user accounts they'll consider.</p>`,
      },
      {
        title: 'Secured Cards for Building Credit',
        slug: 'secured-cards-building-credit',
        readTimeMinutes: 4,
        sortOrder: 4,
        contentHtml: `<p>Secured credit cards are an excellent tool for building credit from scratch or rebuilding after financial difficulties.</p>
<p><strong>How they work:</strong> You make a refundable security deposit (typically $200-$500), which becomes your credit limit. You use the card like a regular credit card and make monthly payments. After 6-12 months of on-time payments, many issuers graduate you to an unsecured card and return your deposit.</p>
<p><strong>Best practices:</strong> Keep utilisation below 30% even on a secured card. Pay the balance in full each month (interest rates on secured cards are often high). Choose a card that reports to all three bureaus and offers a clear graduation path.</p>`,
      },
    ],
  },
  {
    title: 'Debt & Collections',
    slug: 'debt-collections',
    description: 'Understand how different types of debt affect your credit and how to handle collections.',
    icon: 'alert-triangle',
    sortOrder: 2,
    lessons: [
      {
        title: 'Types of Debt and Their Impact',
        slug: 'types-debt-impact',
        readTimeMinutes: 5,
        sortOrder: 0,
        contentHtml: `<p>Not all debt is created equal in the eyes of credit scoring models. Understanding the different types helps you make smarter borrowing decisions.</p>
<p><strong>Revolving debt:</strong> Credit cards and lines of credit. You have a credit limit and can borrow up to that amount, paying it back flexibly. This type of debt directly affects your utilisation ratio—the second most important scoring factor.</p>
<p><strong>Instalment debt:</strong> Loans with fixed payments over a set term—auto loans, mortgages, student loans, personal loans. These don't affect utilisation but do contribute to your credit mix and payment history.</p>
<p><strong>Secured vs. unsecured:</strong> Secured debt (mortgages, auto loans) is backed by collateral. Unsecured debt (credit cards, personal loans) is not. Defaulting on secured debt can result in losing the asset, while unsecured debt typically goes to collections.</p>`,
      },
      {
        title: 'How Late Payments Affect Your Score',
        slug: 'late-payments-affect-score',
        readTimeMinutes: 6,
        sortOrder: 1,
        contentHtml: `<p>Late payments are one of the most damaging events for your credit score. Understanding the timeline helps you take action quickly.</p>
<p><strong>The 30/60/90 day window:</strong> Lenders don't report a payment as late until it's 30 days past due. At 30 days, it appears on your credit report and starts affecting your score. At 60 days, the impact increases. At 90+ days, the account may be charged off or sent to collections, causing severe damage.</p>
<p><strong>Impact severity:</strong> A single 30-day late payment can drop a good score by 60-110 points. The more recent the late payment, the greater the impact. Late payments stay on your report for 7 years, but their impact lessens over time.</p>
<p><strong>What you can do:</strong> If you're within 30 days of the due date, make the payment immediately—it won't be reported. If it's already reported, consider a goodwill letter asking the creditor to remove it (especially if you have a good history). Focus on building positive payment history going forward.</p>`,
      },
      {
        title: 'Collections and Charge-Offs',
        slug: 'collections-charge-offs',
        readTimeMinutes: 5,
        sortOrder: 2,
        contentHtml: `<p>When a debt goes unpaid for too long, the original creditor may sell it to a collection agency. This is one of the most damaging items on a credit report.</p>
<p><strong>What happens:</strong> After 90-180 days of non-payment, most creditors "charge off" the debt as a loss and may sell it to a collection agency. The collection account appears as a separate negative item on your report, in addition to the original late payments.</p>
<p><strong>Pay-for-delete:</strong> Some collection agencies agree to remove the collection from your report if you pay. Get any agreement in writing before paying. Not all agencies offer this, but it's worth asking.</p>
<p><strong>Statute of limitations vs. reporting period:</strong> Collection accounts stay on your report for 7 years from the original delinquency date. The statute of limitations (how long they can sue you) varies by state—typically 3-10 years.</p>`,
      },
      {
        title: 'Bankruptcy and Foreclosure',
        slug: 'bankruptcy-foreclosure',
        readTimeMinutes: 5,
        sortOrder: 3,
        contentHtml: `<p>Bankruptcy and foreclosure are the most severe negative items on a credit report, but their impact diminishes over time—and recovery is possible.</p>
<p><strong>Bankruptcy:</strong> Chapter 7 bankruptcy stays on your report for 10 years. Chapter 13 (repayment plan) stays for 7 years. The score impact is severe—typically 150-240 points initially—but diminishes over time. Many people see significant score improvement within 2-3 years by rebuilding with secured cards and on-time payments.</p>
<p><strong>Foreclosure:</strong> Stays on your report for 7 years. The typical score impact is 100-160 points. Most mortgage lenders require a 3-7 year wait after foreclosure before you can qualify for a new home loan.</p>
<p><strong>Rebuilding after:</strong> Start with secured credit cards. Make every payment on time without exception. Keep utilisation very low. Consider a credit-builder loan from a credit union. Monitor your progress—ScoreLift's monthly check-ins are designed for exactly this journey.</p>`,
      },
    ],
  },
  {
    title: 'Building Credit from Scratch',
    slug: 'building-credit-scratch',
    description: 'Start your credit journey with proven strategies for establishing a strong credit history.',
    icon: 'sprout',
    sortOrder: 3,
    lessons: [
      {
        title: 'Where to Start When You Have No Credit',
        slug: 'where-to-start-no-credit',
        readTimeMinutes: 5,
        sortOrder: 0,
        contentHtml: `<p>Having no credit history (often called being "credit invisible") can be as challenging as having bad credit. Lenders have no way to assess your risk, which means you may be denied for credit products you could easily handle.</p>
<p><strong>Why no credit is a problem:</strong> Without a credit score, you may struggle to rent an apartment, get a phone plan, finance a car, or qualify for a mortgage. Some employers even check credit during hiring.</p>
<p><strong>The good news:</strong> Credit invisibility is solvable—and you can build a strong score from nothing in 6-12 months. The key is starting with products designed for beginners and being consistent.</p>`,
      },
      {
        title: 'Secured Credit Cards',
        slug: 'secured-credit-cards-detailed',
        readTimeMinutes: 5,
        sortOrder: 1,
        contentHtml: `<p>Secured credit cards are the most common starting point for building credit. Here's how to choose and use one effectively.</p>
<p><strong>Choosing a card:</strong> Look for a card with a low minimum deposit ($200 or less), no annual fee, reports to all three bureaus, and offers a clear graduation path to an unsecured card. Avoid cards with excessive fees.</p>
<p><strong>Using it effectively:</strong> Charge only 10-30% of your limit each month (if your limit is $300, spend $30-90). Pay the statement balance in full by the due date—never carry a balance. Set up autopay to avoid accidental late payments.</p>
<p><strong>Graduation:</strong> After 6-12 months of responsible use, most issuers will return your deposit and convert your card to an unsecured line of credit. Your credit limit may increase, and you'll have established a positive credit history.</p>`,
      },
      {
        title: 'Credit-Builder Loans',
        slug: 'credit-builder-loans',
        readTimeMinutes: 4,
        sortOrder: 2,
        contentHtml: `<p>Credit-builder loans are designed specifically for building credit. Unlike traditional loans, the money you borrow is held in an account while you make payments—you receive it only after the loan is paid off.</p>
<p><strong>How they work:</strong> You apply for a small loan (typically $300-$1,000) at a credit union or community bank. The lender puts the money in a savings account that you can't access. You make monthly payments (usually 6-24 months). After the final payment, you receive the money. The lender reports your on-time payments to the credit bureaus.</p>
<p><strong>Why they work:</strong> Each on-time payment builds positive payment history, which is 35% of your FICO score. You also add an instalment loan to your credit mix, which helps the mix factor (10%). And you build a savings habit.</p>`,
      },
      {
        title: 'Becoming an Authorized User',
        slug: 'becoming-authorized-user',
        readTimeMinutes: 4,
        sortOrder: 3,
        contentHtml: `<p>Becoming an authorized user on a trusted person's credit card is one of the fastest ways to establish credit—but it requires careful planning.</p>
<p><strong>Finding the right person:</strong> Ask a family member or close friend with excellent credit habits. The ideal person has a long history of on-time payments, low utilisation (under 30%), and several years of account age.</p>
<p><strong>Setting expectations:</strong> Have an honest conversation about responsible spending. The primary cardholder doesn't need to give you physical access to the card for it to help your credit—just being added as an authorised user is enough for most credit scoring models.</p>
<p><strong>Timeline:</strong> The account history appears on your credit report within 1-2 billing cycles. If the primary cardholder has 10 years of positive history, you'll show 10 years of history too—instantly boosting your account age factor.</p>`,
      },
      {
        title: 'Rent and Utility Reporting',
        slug: 'rent-utility-reporting',
        readTimeMinutes: 4,
        sortOrder: 4,
        contentHtml: `<p>Your largest monthly expense—rent—may not be reflected in your credit score. But that's changing, and you can take advantage of it.</p>
<p><strong>How it works:</strong> Traditional credit scoring models don't include rent payments because they aren't automatically reported to credit bureaus. However, several services now allow you to add rent and utility payments to your credit report.</p>
<p><strong>Services to consider:</strong> Experian Boost, TransUnion's rental bureau, and services like Rental Kharma or PayYourRent let you add positive payment history for rent and utilities. Some are free, others charge a small fee.</p>
<p><strong>Impact:</strong> Adding 12-24 months of on-time rent payments can add positive history to your payment history factor. This is especially valuable if you have limited credit history.</p>`,
      },
      {
        title: 'Avoiding Common Pitfalls',
        slug: 'avoiding-common-pitfalls',
        readTimeMinutes: 4,
        sortOrder: 5,
        contentHtml: `<p>Building credit is a marathon, not a sprint. Avoid these common mistakes that can derail your progress.</p>
<p><strong>1. Applying for too much credit at once.</strong> Each application generates a hard inquiry. Multiple inquiries in a short period make you look risky. Space applications 6+ months apart.</p>
<p><strong>2. Closing old accounts.</strong> Your oldest account's age is a scoring factor. Closing it shortens your credit history. Leave old accounts open even if you don't use them.</p>
<p><strong>3. Carrying balances unnecessarily.</strong> You don't need to carry a balance to build credit—paying in full each month builds the same positive history without costing you interest.</p>
<p><strong>4. Ignoring your credit report.</strong> Check your credit report annually for errors. Dispute inaccuracies through the credit bureau's dispute process.</p>`,
      },
    ],
  },
  {
    title: 'Mortgage & Loan Readiness',
    slug: 'mortgage-loan-readiness',
    description: 'Prepare for major financial commitments with the right credit foundation.',
    icon: 'home',
    sortOrder: 4,
    lessons: [
      {
        title: 'Minimum Credit Scores by Loan Type',
        slug: 'minimum-scores-loan-type',
        readTimeMinutes: 5,
        sortOrder: 0,
        contentHtml: `<p>Different loan types have different credit score requirements. Knowing the thresholds helps you set realistic goals.</p>
<p><strong>Conventional mortgages:</strong> Minimum 620-640 score with 3-5% down payment. A score below 700 typically requires private mortgage insurance (PMI) and may come with higher interest rates.</p>
<p><strong>FHA loans:</strong> Minimum 580 with 3.5% down, or 500-579 with 10% down. FHA loans are government-insured and more flexible with credit requirements.</p>
<p><strong>VA loans:</strong> No official minimum, but most lenders require 620+. Zero down payment option for eligible veterans and active-duty military.</p>
<p><strong>USDA loans:</strong> Typically 640+ for automated approval. Zero down payment for rural and suburban properties.</p>
<p><strong>Auto loans:</strong> Prime rates start around 660-680. Below 620, you may face subprime rates that significantly increase monthly payments.</p>`,
      },
      {
        title: 'What Lenders Look For',
        slug: 'what-lenders-look-for',
        readTimeMinutes: 5,
        sortOrder: 1,
        contentHtml: `<p>Lenders evaluate more than just your credit score. Understanding the full picture helps you prepare for a loan application.</p>
<p><strong>Debt-to-Income (DTI) Ratio:</strong> This measures your monthly debt payments against your gross monthly income. Most lenders want a DTI under 43%, and ideally under 36%. Include credit cards, auto loans, student loans, and the proposed mortgage payment.</p>
<p><strong>Employment history:</strong> Lenders prefer 2+ years of stable employment. Frequent job changes or gaps may raise concerns, though they can be explained.</p>
<p><strong>Down payment:</strong> Larger down payments reduce lender risk and may help you qualify with a lower score. A 20% down payment eliminates PMI on conventional loans.</p>`,
      },
      {
        title: 'How to Prepare for a Mortgage Application',
        slug: 'prepare-mortgage-application',
        readTimeMinutes: 6,
        sortOrder: 2,
        contentHtml: `<p>Preparing for a mortgage application should start 6-12 months before you plan to buy. Here's a timeline to follow.</p>
<p><strong>6-12 months before:</strong> Check your credit scores from all three bureaus. Dispute any errors. Pay down credit card balances to below 30% utilisation—ideally under 10%. Avoid opening any new credit accounts. Save for your down payment and closing costs (typically 3-6% of the purchase price).</p>
<p><strong>3-6 months before:</strong> Get pre-approved by a lender to understand your price range. Review your DTI ratio and pay down any small debts. Gather documentation (tax returns, W-2s, bank statements, pay stubs).</p>
<p><strong>1-3 months before:</strong> Don't make any large purchases or open new credit. Continue making all payments on time. Avoid changing jobs if possible. Respond quickly to any document requests from your lender.</p>`,
      },
      {
        title: 'Improving Your Score for a Car Loan or Personal Loan',
        slug: 'improving-score-loan',
        readTimeMinutes: 4,
        sortOrder: 3,
        contentHtml: `<p>Whether you're financing a car or taking out a personal loan, the same principles apply—and the better your score, the better your interest rate.</p>
<p><strong>Rate differences:</strong> A 720 score might qualify for a 6% auto loan rate, while a 620 score might face 12% or higher. On a $30,000, 5-year loan, that's over $4,500 in extra interest.</p>
<p><strong>Specific strategies:</strong> Pay down revolving balances aggressively—utilisation is the fastest lever to pull. Make all payments on time for at least 3-6 months before applying. Consider paying off small collection accounts if they're recent. Don't apply for new credit in the 3 months before your loan application.</p>`,
      },
    ],
  },
]

export async function seedEducation() {
  const existing = await db.select().from(educationTracks).limit(1)
  if (existing.length > 0) {
    console.log('[Education] Already seeded — skipping')
    return
  }

  for (const track of TRACKS) {
    const [insertedTrack] = await db.insert(educationTracks).values({
      id: crypto.randomUUID(),
      title: track.title,
      slug: track.slug,
      description: track.description,
      icon: track.icon,
      sortOrder: track.sortOrder,
    }).returning()

    for (const lesson of track.lessons) {
      await db.insert(educationLessons).values({
        id: crypto.randomUUID(),
        trackId: insertedTrack.id,
        title: lesson.title,
        slug: lesson.slug,
        contentHtml: lesson.contentHtml,
        readTimeMinutes: lesson.readTimeMinutes,
        sortOrder: lesson.sortOrder,
      })
    }
  }

  console.log(`[Education] Seeded ${TRACKS.length} tracks with ${TRACKS.reduce((s, t) => s + t.lessons.length, 0)} lessons`)
}