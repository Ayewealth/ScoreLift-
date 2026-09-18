import { resend, env } from '../env'
import { renderEmail } from '../emails/render-email'
import { WelcomeEmail } from '../emails/WelcomeEmail'
import { PaymentFailedEmail } from '../emails/PaymentFailedEmail'
import { CheckinReminderEmail } from '../emails/CheckinReminderEmail'
import { CheckinDigestEmail } from '../emails/CheckinDigestEmail'
import { MilestoneEmail } from '../emails/MilestoneEmail'
import { AccountDeletionEmail } from '../emails/AccountDeletionEmail'

export async function sendWelcomeEmail(email: string) {
  if (!resend) {
    console.log(`[Email] Welcome: SKIPPED — resend not configured for ${email}`)
    return
  }
  console.log(`[Email] Welcome: SENDING to ${email}`)
  try {
    const html = await renderEmail(WelcomeEmail, { dashboardUrl: `${env.APP_URL}/dashboard` })
    const result = await resend.emails.send({
      from: env.EMAIL_FROM,
      to: email,
      subject: 'Welcome to ScoreLift — your credit journey starts here',
      html,
    })
    console.log(`[Email] Welcome: SENT to ${email} (id: ${result.data?.id ?? 'unknown'})`)
  } catch (err) {
    console.log(`[Email] Welcome: FAILED for ${email} —`, err)
  }
}

export async function sendPaymentFailedEmail(email: string, portalUrl: string) {
  if (!resend) {
    console.log(`[Email] Payment failed: SKIPPED — resend not configured for ${email}`)
    return
  }
  console.log(`[Email] Payment failed: SENDING to ${email}`)
  try {
    const html = await renderEmail(PaymentFailedEmail, { portalUrl })
    const result = await resend.emails.send({
      from: env.EMAIL_FROM,
      to: email,
      subject: 'Payment failed — update your billing info',
      html,
    })
    console.log(`[Email] Payment failed: SENT to ${email} (id: ${result.data?.id ?? 'unknown'})`)
  } catch (err) {
    console.log(`[Email] Payment failed: FAILED for ${email} —`, err)
  }
}

export async function sendCheckinReminderEmail(email: string, streak: number) {
  if (!resend) {
    console.log(`[Email] Check-in reminder: SKIPPED — resend not configured for ${email}`)
    return
  }
  console.log(`[Email] Check-in reminder: SENDING to ${email}`)
  try {
    const html = await renderEmail(CheckinReminderEmail, {
      streak,
      checkinUrl: `${env.APP_URL}/checkin`,
    })
    const result = await resend.emails.send({
      from: env.EMAIL_FROM,
      to: email,
      subject: streak > 0 ? `Your ${streak}-month streak is waiting — check in now` : 'Time for your monthly credit check-in',
      html,
    })
    console.log(`[Email] Check-in reminder: SENT to ${email} (id: ${result.data?.id ?? 'unknown'})`)
  } catch (err) {
    console.log(`[Email] Check-in reminder: FAILED for ${email} —`, err)
  }
}

export async function sendCheckinDigestEmail(email: string, newScore: number, delta: number, streak: number) {
  if (!resend) {
    console.log(`[Email] Check-in digest: SKIPPED — resend not configured for ${email}`)
    return
  }
  console.log(`[Email] Check-in digest: SENDING to ${email}`)
  try {
    const html = await renderEmail(CheckinDigestEmail, {
      newScore,
      delta,
      streak,
      dashboardUrl: `${env.APP_URL}/dashboard`,
    })
    const result = await resend.emails.send({
      from: env.EMAIL_FROM,
      to: email,
      subject: delta >= 0
        ? `Score check-in: +${delta} points this month`
        : `Score check-in: ${delta} points this month`,
      html,
    })
    console.log(`[Email] Check-in digest: SENT to ${email} (id: ${result.data?.id ?? 'unknown'})`)
  } catch (err) {
    console.log(`[Email] Check-in digest: FAILED for ${email} —`, err)
  }
}

export async function sendMilestoneEmail(email: string, badgeName: string, badgeDescription: string) {
  if (!resend) {
    console.log(`[Email] Milestone: SKIPPED — resend not configured for ${email}`)
    return
  }
  console.log(`[Email] Milestone: SENDING to ${email}`)
  try {
    const html = await renderEmail(MilestoneEmail, {
      badgeName,
      badgeDescription,
      milestonesUrl: `${env.APP_URL}/milestones`,
    })
    const result = await resend.emails.send({
      from: env.EMAIL_FROM,
      to: email,
      subject: `🏆 Milestone unlocked: ${badgeName}`,
      html,
    })
    console.log(`[Email] Milestone: SENT to ${email} (id: ${result.data?.id ?? 'unknown'})`)
  } catch (err) {
    console.log(`[Email] Milestone: FAILED for ${email} —`, err)
  }
}

export async function sendAccountDeletionEmail(email: string, restoreUrl: string) {
  if (!resend) {
    console.log(`[Email] Account deletion: SKIPPED — resend not configured for ${email}`)
    return
  }
  console.log(`[Email] Account deletion: SENDING to ${email}`)
  try {
    const html = await renderEmail(AccountDeletionEmail, { restoreUrl })
    const result = await resend.emails.send({
      from: env.EMAIL_FROM,
      to: email,
      subject: 'Your ScoreLift account deletion has been scheduled',
      html,
    })
    console.log(`[Email] Account deletion: SENT to ${email} (id: ${result.data?.id ?? 'unknown'})`)
  } catch (err) {
    console.log(`[Email] Account deletion: FAILED for ${email} —`, err)
  }
}