import { BaseEmail } from './BaseEmail'

interface MilestoneEmailProps {
  badgeName: string
  badgeDescription: string
  milestonesUrl: string
}

export function MilestoneEmail({ badgeName, badgeDescription, milestonesUrl }: MilestoneEmailProps) {
  return (
    <BaseEmail
      previewText={`You earned the "${badgeName}" badge!`}
    >
      <h1 style={headingStyle}>Congratulations!</h1>
      <p style={paragraphStyle}>
        You've unlocked a new milestone:
      </p>
      <div style={badgeStyle}>
        <p style={badgeNameStyle}>{badgeName}</p>
        <p style={badgeDescStyle}>{badgeDescription}</p>
      </div>
      <p style={paragraphStyle}>
        Keep up the great work — every step brings you closer to your credit goals.
      </p>
      <div style={buttonContainerStyle}>
        <a href={milestonesUrl} style={buttonStyle}>
          View your milestones
        </a>
      </div>
    </BaseEmail>
  )
}

const headingStyle: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', Georgia, serif",
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

const badgeStyle: React.CSSProperties = {
  backgroundColor: '#eaf0e8',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center',
  margin: '16px 0',
}

const badgeNameStyle: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  fontSize: '20px',
  fontWeight: 700,
  color: '#4a7c59',
  margin: '0 0 8px',
}

const badgeDescStyle: React.CSSProperties = {
  fontFamily: "'Outfit', Arial, sans-serif",
  fontSize: '14px',
  color: '#6a7a65',
  margin: 0,
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