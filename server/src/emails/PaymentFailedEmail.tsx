import React from 'react'
import { Section, Text, Link } from '@react-email/components'
import { BaseEmail } from './BaseEmail'

interface PaymentFailedEmailProps {
  portalUrl: string
}

export function PaymentFailedEmail({ portalUrl }: PaymentFailedEmailProps) {
  return (
    <BaseEmail previewText="Payment failed — update your billing information">
      <Text style={headingStyle}>Payment failed</Text>
      <Text style={paragraphStyle}>
        Your most recent payment could not be processed. Please update your payment method to keep
        your subscription active and avoid any interruption in service.
      </Text>

      <Section style={ctaSectionStyle}>
        <Link href={portalUrl} style={ctaStyle}>
          Update payment method →
        </Link>
      </Section>

      <Text style={mutedStyle}>
        If you have questions, please contact our support team.
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

const mutedStyle = {
  fontSize: '13px',
  color: '#6a7a65',
  lineHeight: '1.5',
  margin: '0 0 12px',
}

const signOffStyle = {
  fontSize: '15px',
  color: '#6a7a65',
  margin: '0',
}