import React from 'react'
import {
  Html, Head, Preview, Body, Container, Section, Text, Hr, Img, Link,
} from '@react-email/components'

interface BaseEmailProps {
  previewText: string
  children: React.ReactNode
}

const baseUrl = process.env.APP_URL || 'https://scorelift.credit'

export function BaseEmail({ previewText, children }: BaseEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section style={headerStyle}>
            <table style={logoTableStyle}>
              <tr>
                <td style={logoCellStyle}>
                  <span style={logoTextStyle}>
                    Score<span style={logoAccentStyle}>Lift</span>
                  </span>
                </td>
              </tr>
            </table>
          </Section>

          <Section style={contentStyle}>
            {children}
          </Section>

          <Hr style={hrStyle} />

          <Section style={footerStyle}>
            <Text style={footerText}>
              Build Better Credit — transparently, without a bank connection.
            </Text>
            <Text style={footerLinkStyle}>
              <Link href={`${baseUrl}/settings/notifications`} style={linkStyle}>
                Unsubscribe or manage email preferences
              </Link>
            </Text>
            <Text style={footerSmallStyle}>
              ScoreLift · {baseUrl}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const bodyStyle = {
  backgroundColor: '#faf8f2',
  fontFamily: 'Outfit, -apple-system, sans-serif',
  margin: 0,
  padding: 0,
}

const containerStyle = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '24px 16px',
}

const headerStyle = {
  padding: '24px 0',
  textAlign: 'center' as const,
}

const logoTableStyle = {
  width: '100%',
}

const logoCellStyle = {
  textAlign: 'center' as const,
}

const logoTextStyle = {
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  fontSize: '28px',
  fontStyle: 'italic',
  fontWeight: 700,
  color: '#2d3a2a',
}

const logoAccentStyle = {
  color: '#4a7c59',
}

const contentStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '32px',
  boxShadow: '0 2px 24px rgba(74,124,89,0.08)',
}

const hrStyle = {
  borderColor: '#e8e6dd',
  margin: '24px 0',
}

const footerStyle = {
  textAlign: 'center' as const,
  padding: '16px 0',
}

const footerText = {
  fontSize: '13px',
  color: '#6a7a65',
  lineHeight: '1.5',
  margin: '0 0 8px',
}

const footerLinkStyle = {
  margin: '0 0 4px',
}

const linkStyle = {
  color: '#6a7a65',
  fontSize: '12px',
  textDecoration: 'underline',
}

const footerSmallStyle = {
  fontSize: '11px',
  color: '#6a7a65',
  margin: '0',
}