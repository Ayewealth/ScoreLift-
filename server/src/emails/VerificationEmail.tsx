import React from 'react'
import { Section, Text, Link } from '@react-email/components'
import { BaseEmail } from './BaseEmail'

interface VerificationEmailProps {
  verificationUrl: string
}

export function VerificationEmail({ verificationUrl }: VerificationEmailProps) {
  return (
    <BaseEmail previewText="Verify your email address to activate your ScoreLift account">
      <Text style={headingStyle}>Verify your email</Text>
      <Text style={paragraphStyle}>
        Thanks for signing up for ScoreLift. Click the button below to verify your email address
        and activate your account.
      </Text>

      <Section style={ctaSectionStyle}>
        <Link href={verificationUrl} style={ctaStyle}>
          Verify email address
        </Link>
      </Section>

      <Text style={paragraphStyle}>
        If the button doesn't work, copy and paste this link into your browser:
      </Text>
      <Text style={linkTextStyle}>{verificationUrl}</Text>

      <Text style={mutedStyle}>
        This link expires in 1 hour. If you didn't create a ScoreLift account, you can safely
        ignore this email.
      </Text>
    </BaseEmail>
  )
}

const headingStyle = {
  fontFamily: "'Cormorant Garamond', Georgia, serif",
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