import React from 'react'
import { Section, Text, Link } from '@react-email/components'
import { BaseEmail } from './BaseEmail'

interface WelcomeEmailProps {
  dashboardUrl: string
}

export function WelcomeEmail({ dashboardUrl }: WelcomeEmailProps) {
  return (
    <BaseEmail previewText="Your credit journey starts here — check your personalised roadmap">
      <Text style={headingStyle}>Welcome to ScoreLift!</Text>
      <Text style={paragraphStyle}>
        Your credit profile is set up and your personalised roadmap is ready. Here's what to do
        next:
      </Text>

      <Section style={listStyle}>
        <Text style={listItemStyle}>
          <strong style={strongStyle}>1. Check your dashboard</strong> — see your estimated score
          and top actions at a glance.
        </Text>
        <Text style={listItemStyle}>
          <strong style={strongStyle}>2. Review your roadmap</strong> — prioritised steps ranked by
          score impact, effort, and time horizon.
        </Text>
        <Text style={listItemStyle}>
          <strong style={strongStyle}>3. Set a goal</strong> — choose a target score and date, and
          track your progress with a visual progress ring.
        </Text>
      </Section>

      <Section style={ctaSectionStyle}>
        <Link href={dashboardUrl} style={ctaStyle}>
          Go to your dashboard →
        </Link>
      </Section>

      <Text style={paragraphStyle}>
        Welcome aboard — we're glad you're here.
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

const listStyle = {
  margin: '16px 0',
}

const listItemStyle = {
  fontSize: '15px',
  color: '#2d3a2a',
  lineHeight: '1.6',
  margin: '0 0 8px',
  paddingLeft: '8px',
}

const strongStyle = {
  color: '#4a7c59',
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