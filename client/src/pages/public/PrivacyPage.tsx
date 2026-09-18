export default function PrivacyPage() {
  return (
    <div>
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl text-foreground md:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 font-body text-sm text-muted-foreground">
            Last updated: January 2025
          </p>

          <div className="mt-10 space-y-8 font-body text-base text-muted-foreground leading-relaxed">
            <section>
              <h2 className="font-heading text-2xl text-foreground">
                1. Introduction
              </h2>
              <p className="mt-3">
                ScoreLift (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is
                committed to protecting your privacy. This Privacy Policy
                explains how we collect, use, disclose, and safeguard your
                information when you use our platform at scorelift.credit.
              </p>
              <p className="mt-3">
                By using ScoreLift, you agree to the collection and use of
                information in accordance with this policy.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl text-foreground">
                2. Information We Collect
              </h2>
              <h3 className="mt-4 font-heading text-lg text-foreground">
                Personal Information
              </h3>
              <p className="mt-2">
                When you create an account, we collect your email address and a
                password (stored as a salted hash). You may optionally provide a
                display name.
              </p>
              <h3 className="mt-4 font-heading text-lg text-foreground">
                Credit Profile Data
              </h3>
              <p className="mt-2">
                All credit-related information&mdash;score bands, account details,
                utilisation, payment history, and similar data&mdash;is
                self-reported by you and stored on our servers. This data is
                never shared with credit bureaus, banks, or third-party
                financial institutions.
              </p>
              <h3 className="mt-4 font-heading text-lg text-foreground">
                Usage Data
              </h3>
              <p className="mt-2">
                We collect anonymous usage statistics to improve the platform,
                including page views, feature interactions, and error reports.
                This data cannot be used to identify you personally.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl text-foreground">
                3. How We Use Your Information
              </h2>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>To operate and maintain your account</li>
                <li>To calculate your estimated credit score and generate your personalised roadmap</li>
                <li>To send transactional emails (verification, password reset, billing)</li>
                <li>To improve the platform based on aggregate usage patterns</li>
                <li>To comply with legal obligations</li>
              </ul>
              <p className="mt-3">
                We do <strong className="text-foreground">not</strong> sell,
                rent, or share your personal information with third parties for
                their marketing purposes.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl text-foreground">
                4. Data Storage & Security
              </h2>
              <p className="mt-3">
                Your data is stored on secure servers using encryption at rest
                and in transit. Passwords are hashed using bcrypt. Document
                uploads are stored in Cloudflare R2 with short-lived signed URLs
                for access control.
              </p>
              <p className="mt-3">
                We retain your data for as long as your account is active. Upon
                account deletion, your data is permanently erased within 30 days.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl text-foreground">
                5. GDPR (General Data Protection Regulation)
              </h2>
              <p className="mt-3">
                If you are a resident of the European Economic Area (EEA), you
                have the following rights under GDPR:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li><strong className="text-foreground">Right to access</strong> &mdash; Request a copy of your personal data.</li>
                <li><strong className="text-foreground">Right to rectification</strong> &mdash; Correct inaccurate data.</li>
                <li><strong className="text-foreground">Right to erasure</strong> &mdash; Request deletion of your data.</li>
                <li><strong className="text-foreground">Right to restrict processing</strong> &mdash; Limit how we use your data.</li>
                <li><strong className="text-foreground">Right to data portability</strong> &mdash; Receive your data in a portable format.</li>
                <li><strong className="text-foreground">Right to object</strong> &mdash; Object to processing of your data.</li>
              </ul>
              <p className="mt-3">
                To exercise any of these rights, contact us at
                privacy@scorelift.credit.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl text-foreground">
                6. CCPA (California Consumer Privacy Act)
              </h2>
              <p className="mt-3">
                California residents have the right to:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Know what personal information we collect and how it is used</li>
                <li>Request deletion of personal information</li>
                <li>Opt out of the sale of personal information (we do not sell data)</li>
                <li>Non-discrimination for exercising your CCPA rights</li>
              </ul>
              <p className="mt-3">
                To exercise your CCPA rights, contact us at
                privacy@scorelift.credit.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl text-foreground">
                7. Cookies
              </h2>
              <p className="mt-3">
                We use essential cookies for authentication and session
                management. We do not use tracking cookies or third-party
                analytics cookies. You can disable cookies in your browser
                settings, but this may affect platform functionality.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl text-foreground">
                8. Third-Party Services
              </h2>
              <p className="mt-3">
                We use the following third-party services, each with their own
                privacy practices:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li><strong className="text-foreground">Stripe</strong> &mdash; Payment processing (see Stripe&apos;s privacy policy)</li>
                <li><strong className="text-foreground">Resend</strong> &mdash; Transactional email delivery</li>
                <li><strong className="text-foreground">Cloudflare R2</strong> &mdash; Document file storage</li>
              </ul>
              <p className="mt-3">
                We do not share your personal information with these services
                beyond what is necessary for their function.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl text-foreground">
                9. Changes to This Policy
              </h2>
              <p className="mt-3">
                We may update this Privacy Policy from time to time. We will
                notify you of material changes by email or through the platform.
                Continued use after changes constitutes acceptance of the
                updated policy.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl text-foreground">
                10. Contact
              </h2>
              <p className="mt-3">
                For privacy-related inquiries, contact us at:
                <br />
                privacy@scorelift.credit
                <br />
                ScoreLift, 1 Letterman Drive, San Francisco, CA 94129
              </p>
            </section>
          </div>
        </div>
      </section>
    </div>
  )
}