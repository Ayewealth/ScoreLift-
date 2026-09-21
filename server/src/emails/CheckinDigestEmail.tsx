import { BaseEmail } from './BaseEmail'

interface CheckinDigestEmailProps {
  newScore: number
  delta: number
  streak: number
  dashboardUrl: string
}

export function CheckinDigestEmail({ newScore, delta, streak, dashboardUrl }: CheckinDigestEmailProps) {
  const isPositive = delta >= 0

  return (
    <BaseEmail
      previewText={`Your score ${isPositive ? 'improved' : 'changed'} by ${Math.abs(delta)} points this month`}
    >
      <h1 style={headingStyle}>Check-in complete</h1>
      <p style={paragraphStyle}>
        Your estimated score is now{' '}
        <strong style={{ color: isPositive ? '#4a7c59' : '#c0392b' }}>
          {newScore}
        </strong>
        , a change of{' '}
        <strong>
          {isPositive ? '+' : ''}{delta} points
        </strong>{' '}
        from last month.
      </p>
      {streak > 0 && (
        <p style={paragraphStyle}>
          That's <strong>{streak} consecutive months</strong> of check-ins. Keep up
          the momentum!
        </p>
      )}
      <div style={buttonContainerStyle}>
        <a href={dashboardUrl} style={buttonStyle}>
          View your updated dashboard
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