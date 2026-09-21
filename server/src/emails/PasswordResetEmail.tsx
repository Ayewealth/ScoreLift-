import React from 'react'
import { Section, Text, Link } from '@react-email/components'
import { BaseEmail } from './BaseEmail'

interface PasswordResetEmailProps {
  resetUrl: string
}

export function PasswordResetEmail({ resetUrl }: PasswordResetEmailProps) {
  return (
    <BaseEmail previewText="Reset your ScoreLift password">
      <Text style={headingStyle}>Reset your password</Text>
      <Text style={paragraphStyle}>
        We received a request to reset your ScoreLift password. Click the button below to set a new
        one.
      </Text>

      <Section style={ctaSectionStyle}>
        <Link href={resetUrl} style={ctaStyle}>
          Reset password
        </Link>
      </Section>

      <Text style={paragraphStyle}>
        If the button doesn't work, copy and paste this link into your browser:
      </Text>
      <Text style={linkTextStyle}>{resetUrl}</Text>

      <Text style={mutedStyle}>
        This link expires in 1 hour. If you didn't request a password reset, you can safely ignore
        this email.
      </Text>
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

const linkTextStyle = {
  fontSize: '13px',
  color: '#6a7a65',
  lineHeight: '1.5',
  wordBreak: 'break-all' as const,
  margin: '0 0 16px',
}

const mutedStyle = {
  fontSize: '13px',
  color: '#6a7a65',
  lineHeight: '1.5',
  margin: '0',
}