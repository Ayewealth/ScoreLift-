import { BaseEmail } from './BaseEmail'

interface CheckinReminderEmailProps {
  streak: number
  checkinUrl: string
}

export function CheckinReminderEmail({ streak, checkinUrl }: CheckinReminderEmailProps) {
  return (
    <BaseEmail
      previewText={`Your ${streak > 0 ? streak + '-month streak is waiting' : 'monthly check-in is due'} — check in now`}
    >
      <h1 style={headingStyle}>Time for your monthly check-in</h1>
      <p style={paragraphStyle}>
        Your monthly check-in is due. It only takes a few minutes to update your
        credit information and see how your score is trending.
      </p>
      {streak > 0 && (
        <p style={paragraphStyle}>
          You're on a <strong>{streak}-month streak</strong> — keep it going!
        </p>
      )}
      <div style={buttonContainerStyle}>
        <a href={checkinUrl} style={buttonStyle}>
          Start Check-In
        </a>
      </div>
    </BaseEmail>
  )
}

const headingStyle: React.CSSProperties = {
  fontFamily: "'Space Grotesk', Arial, sans-serif",
  fontSize: '24px',
  fontWeight: 700,
  color: '#2d3a2a',
  margin: '0 0 16px',
}

const paragraphStyle: React.CSSProperties = {
  fontFamily: "'Outfit', Arial, sans-serif",
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#6a7a65',
  margin: '0 0 16px',
}

const buttonContainerStyle: React.CSSProperties = {
  textAlign: 'center',
  margin: '24px 0',
}

const buttonStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '12px 32px',
  backgroundColor: '#4a7c59',
  color: '#ffffff',
  textDecoration: 'none',
  borderRadius: '6px',
  fontFamily: "'Outfit', Arial, sans-serif",
  fontSize: '15px',
  fontWeight: 500,
}