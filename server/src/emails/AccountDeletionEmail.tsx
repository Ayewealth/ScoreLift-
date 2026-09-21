import React from 'react'
import { Section, Text, Link } from '@react-email/components'
import { BaseEmail } from './BaseEmail'

interface AccountDeletionEmailProps {
  restoreUrl: string
}

export function AccountDeletionEmail({ restoreUrl }: AccountDeletionEmailProps) {
  return (
    <BaseEmail previewText="Your ScoreLift account deletion has been scheduled">
      <Text style={headingStyle}>Account Deletion Scheduled</Text>
      <Text style={paragraphStyle}>
        We've received your request to delete your ScoreLift account. Your data will be permanently
        removed in <strong style={strongStyle}>30 days</strong>.
      </Text>

      <Section style={infoBoxStyle}>
        <Text style={infoHeadingStyle}>What happens next:</Text>
        <Text style={infoItemStyle}>
          • Your subscription has been cancelled
        </Text>
        <Text style={infoItemStyle}>
          • You have 30 days to change your mind
        </Text>
        <Text style={infoItemStyle}>
          • After 30 days, all your data is permanently erased
        </Text>
      </Section>

      <Section style={ctaSectionStyle}>
        <Link href={restoreUrl} style={ctaStyle}>
          Restore My Account
        </Link>
      </Section>

      <Text style={paragraphStyle}>
        If you did not request this, please restore your account immediately using the link above
        and contact us if you have any concerns.
      </Text>
      <Text style={signOffStyle}>— The ScoreLift Team</Text>
    </BaseEmail>
  )
}

const headingStyle = {
  fontFamily: "'Space Grotesk', Arial, sans-serif",
  fontSize: '26px',
  fontWeight: 700,
  color: '#2d3a2a',
  margin: '0 0 16px',
}

const paragraphStyle = {
  fontSize: '15px',
  color: '#2d3a2a',
  lineHeight: '1.6',
  margin: '0 0 12px',
}

const strongStyle = {
  color: '#4a7c59',
}

const infoBoxStyle = {
  backgroundColor: '#fae8e8',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0',
}

const infoHeadingStyle = {
  fontSize: '14px',
  fontWeight: 600,
  color: '#2d3a2a',
  margin: '0 0 8px',
}

const infoItemStyle = {
  fontSize: '14px',
  color: '#2d3a2a',
  lineHeight: '1.6',
  margin: '0 0 4px',
}

const ctaSectionStyle = {
  textAlign: 'center' as const,
  margin: '24px 0',
}

const ctaStyle = {
  display: 'inline-block',
  backgroundColor: '#4a7c59',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 500,
  padding: '12px 28px',
  borderRadius: '6px',
  textDecoration: 'none',
}

const signOffStyle = {
  fontSize: '15px',
  color: '#6a7a65',
  margin: '0',
}