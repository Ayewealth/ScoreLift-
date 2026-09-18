export interface DisputeTemplate {
  id: string
  title: string
  description: string
  fields: { key: string; label: string; type: 'text' | 'textarea' }[]
  bodyTemplate: string
}

const bureauAddresses = {
  equifax: 'Equifax Information Services LLC\nP.O. Box 740256\nAtlanta, GA 30374',
  experian: 'Experian\nP.O. Box 4500\nAllen, TX 75013',
  transunion: 'TransUnion LLC\nConsumer Dispute Center\nP.O. Box 2000\nChester, PA 19016',
}

export function getBureauAddress(bureau: string): string {
  return bureauAddresses[bureau as keyof typeof bureauAddresses] ?? bureauAddresses.equifax
}

export const DISPUTE_TEMPLATES: DisputeTemplate[] = [
  {
    id: 'late_payment',
    title: 'Incorrect Late Payment Dispute',
    description: 'Dispute a late payment that was reported in error — you made the payment on time.',
    fields: [
      { key: 'creditorName', label: 'Creditor/Company Name', type: 'text' },
      { key: 'accountNumber', label: 'Account Number (last 4 digits)', type: 'text' },
      { key: 'lateDate', label: 'Date of alleged late payment', type: 'text' },
      { key: 'reason', label: 'Why this payment was on time', type: 'textarea' },
    ],
    bodyTemplate: `I am writing to dispute a late payment that appears on my credit report. I believe this information is inaccurate and should be removed or corrected.

The item in question is:
- Creditor: {{creditorName}}
- Account Number: ****{{accountNumber}}
- Date of Alleged Late Payment: {{lateDate}}

I have reviewed my records and {{reason}}. This payment was made on time according to my records.

Please investigate this matter and remove the inaccurate late payment from my credit report as required by the Fair Credit Reporting Act (FCRA). I have enclosed copies of supporting documentation (if applicable).

Please send confirmation of the investigation results and any corrections made to my credit report to the address on file.`,
  },
  {
    id: 'not_mine',
    title: 'Account Not Mine / Identity Theft',
    description: 'Report an account that does not belong to you — possible identity theft or mixed file.',
    fields: [
      { key: 'creditorName', label: 'Creditor/Company Name', type: 'text' },
      { key: 'accountNumber', label: 'Account Number shown on report', type: 'text' },
      { key: 'reason', label: 'Why this account is not yours', type: 'textarea' },
    ],
    bodyTemplate: `I am writing to dispute an account on my credit report that does not belong to me. I believe this is the result of identity theft or a mixed credit file.

The account in question is:
- Creditor: {{creditorName}}
- Account Number: {{accountNumber}}

{{reason}}

I have never opened or authorized this account. I request that you investigate and remove this account from my credit report immediately. Please send me a copy of your investigation results and a corrected credit report.

Under the Fair Credit Reporting Act, you are required to investigate this dispute within 30 days and remove any inaccurate information.`,
  },
  {
    id: 'outdated_item',
    title: 'Outdated Negative Item (Past 7 Years)',
    description: 'Remove a negative item that is older than 7 years and should no longer appear on your report.',
    fields: [
      { key: 'creditorName', label: 'Creditor/Company Name', type: 'text' },
      { key: 'accountNumber', label: 'Account Number', type: 'text' },
      { key: 'itemType', label: 'Type of item (late payment, collection, etc.)', type: 'text' },
      { key: 'dateRemoved', label: 'Approximate date the item should be removed', type: 'text' },
    ],
    bodyTemplate: `I am writing to dispute a negative item on my credit report that exceeds the Fair Credit Reporting Act 7-year reporting time limit.

The item in question is:
- Creditor: {{creditorName}}
- Account Number: {{accountNumber}}
- Type: {{itemType}}
- Date of Event: {{dateRemoved}}

Under the FCRA Section 605, most negative information cannot be reported for more than 7 years. This item is past that time limit and should be removed immediately.

Please remove this outdated item from my credit report and send me written confirmation of the removal.`,
  },
  {
    id: 'incorrect_status',
    title: 'Incorrect Account Status',
    description: 'An account is showing an incorrect status (e.g. charged-off when it was paid).',
    fields: [
      { key: 'creditorName', label: 'Creditor/Company Name', type: 'text' },
      { key: 'accountNumber', label: 'Account Number', type: 'text' },
      { key: 'currentStatus', label: 'Current status on report', type: 'text' },
      { key: 'correctStatus', label: 'What the correct status should be', type: 'text' },
      { key: 'reason', label: 'Why the status is incorrect', type: 'textarea' },
    ],
    bodyTemplate: `I am writing to dispute the current status of an account on my credit report, which I believe is reported incorrectly.

The account in question is:
- Creditor: {{creditorName}}
- Account Number: {{accountNumber}}
- Current Reported Status: {{currentStatus}}
- Correct Status: {{correctStatus}}

{{reason}}

Please update the status of this account to reflect its accurate information. Under the FCRA, you are required to investigate and correct inaccurate information. Please send me written confirmation of any changes made.`,
  },
  {
    id: 'duplicate_account',
    title: 'Duplicate Account Listing',
    description: 'The same account appears more than once on your credit report, unfairly lowering your score.',
    fields: [
      { key: 'creditorName', label: 'Creditor/Company Name', type: 'text' },
      { key: 'accountNumber', label: 'Account Number', type: 'text' },
      { key: 'duplicateInfo', label: 'Details of the duplicate entry', type: 'textarea' },
    ],
    bodyTemplate: `I am writing to report a duplicate account listing on my credit report. The same account appears multiple times, which is inaccurate and negatively impacts my credit score.

The account in question is:
- Creditor: {{creditorName}}
- Account Number: {{accountNumber}}

{{duplicateInfo}}

This account is being reported more than once. Please remove the duplicate entry and ensure only one accurate listing remains. Kindly send me written confirmation once this has been resolved.`,
  },
  {
    id: 'incorrect_personal',
    title: 'Incorrect Personal Information',
    description: 'Your name, address, or other personal details are wrong on your credit report.',
    fields: [
      { key: 'incorrectField', label: 'Field that is incorrect', type: 'text' },
      { key: 'incorrectValue', label: 'What currently appears', type: 'text' },
      { key: 'correctValue', label: 'What should appear', type: 'text' },
      { key: 'evidence', label: 'Evidence of correct information', type: 'textarea' },
    ],
    bodyTemplate: `I am writing to request a correction to my personal information on my credit report.

The information currently on my report is:
- Field: {{incorrectField}}
- Current Value: {{incorrectValue}}
- Correct Value: {{correctValue}}

{{evidence}}

Please update my personal information to reflect the correct details as shown above. Inaccurate personal information can lead to mixed credit files and identity verification issues. Please send me written confirmation once the correction has been made.`,
  },
  {
    id: 'fraudulent_inquiry',
    title: 'Fraudulent Hard Inquiry Removal',
    description: 'Remove a hard inquiry you did not authorize — often from identity theft or error.',
    fields: [
      { key: 'companyName', label: 'Company that pulled your report', type: 'text' },
      { key: 'inquiryDate', label: 'Date of inquiry', type: 'text' },
      { key: 'reason', label: 'Why this inquiry was not authorized', type: 'textarea' },
    ],
    bodyTemplate: `I am writing to dispute a hard inquiry on my credit report that I did not authorize.

The inquiry in question is:
- Company: {{companyName}}
- Date of Inquiry: {{inquiryDate}}

{{reason}}

I did not apply for credit or authorize this company to pull my credit report. Under the FCRA, only permissible purposes allow a hard inquiry on a consumer's credit file. Please investigate and remove this unauthorized inquiry from my credit report.

Please send me written confirmation of the investigation results and any corrections made.`,
  },
]