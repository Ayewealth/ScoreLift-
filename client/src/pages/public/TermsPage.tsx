export default function TermsPage() {
  return (
    <div>
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl text-foreground md:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-4 font-body text-sm text-muted-foreground">
            Last updated: January 2025
          </p>

          <div className="mt-10 space-y-8 font-body text-base text-muted-foreground leading-relaxed">
            <section>
              <h2 className="font-heading text-2xl text-foreground">
                1. Acceptance of Terms
              </h2>
              <p className="mt-3">
                By accessing or using ScoreLift (&ldquo;the Platform&rdquo;), you
                agree to be bound by these Terms of Service. If you do not agree,
                do not use the Platform.
              </p>
              <p className="mt-3">
                These terms apply to all visitors, users, and others who access
                or use the Platform (&ldquo;Users&rdquo;).
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl text-foreground">
                2. Description of Service
              </h2>
              <p className="mt-3">
                ScoreLift provides a subscription-based credit-improvement
                platform that includes a self-reported credit profile builder, a
                deterministic scoring engine, a personalised roadmap, a score
                simulator, monthly check-ins, dispute letter generation, goal
                tracking, and educational content.
              </p>
              <p className="mt-3">
                The Platform does <strong className="text-foreground">not</strong>{' '}
                connect to banks, credit bureaus, or third-party financial data
                providers. All credit data displayed is based on information you
                self-report. Scores provided are estimates for educational and
                planning purposes only.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl text-foreground">
                3. Accounts & Registration
              </h2>
              <p className="mt-3">
                To access certain features, you must create an account using your
                email address and a password. You are responsible for
                maintaining the confidentiality of your account credentials and
                for all activities that occur under your account.
              </p>
              <p className="mt-3">
                You must be at least 18 years old to create an account. By
                registering, you represent that you meet this age requirement.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl text-foreground">
                4. Subscriptions & Billing
              </h2>
              <h3 className="mt-4 font-heading text-lg text-foreground">
                Free Plan
              </h3>
              <p className="mt-2">
                The Free plan provides access to basic features at no cost. No
                payment information is required.
              </p>
              <h3 className="mt-4 font-heading text-lg text-foreground">
                Pro Plans
              </h3>
              <p className="mt-2">
                Pro ($9.99/month) and Annual Pro ($89/year) subscriptions
                provide access to premium features. Payments are processed
                securely through Stripe. Subscriptions auto-renew until
                cancelled.
              </p>
              <h3 className="mt-4 font-heading text-lg text-foreground">
                Cancellation
              </h3>
              <p className="mt-2">
                You may cancel your subscription at any time from your billing
                settings. Access to Pro features continues until the end of the
                current billing period. No refunds are provided for partial
                billing periods.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl text-foreground">
                5. User Responsibilities
              </h2>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Provide accurate and truthful information in your credit profile</li>
                <li>Not misuse the Platform for fraudulent or unlawful purposes</li>
                <li>Not attempt to reverse-engineer, scrape, or disrupt the Platform</li>
                <li>Not share your account credentials with others</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-2xl text-foreground">
                6. Disclaimer of Warranties
              </h2>
              <p className="mt-3">
                The Platform is provided &ldquo;as is&rdquo; without any
                warranties, express or implied. ScoreLift does not guarantee that:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Your actual credit score will match the estimated score</li>
                <li>Following the roadmap will result in a specific score improvement</li>
                <li>The Platform will be uninterrupted or error-free</li>
              </ul>
              <p className="mt-3">
                ScoreLift is an educational and planning tool. It is not a credit
                repair service, and we do not guarantee specific credit outcomes.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl text-foreground">
                7. Limitation of Liability
              </h2>
              <p className="mt-3">
                In no event shall ScoreLift be liable for any indirect,
                incidental, special, consequential, or punitive damages arising
                out of or related to your use of the Platform. Our total
                liability for any claim shall not exceed the amount you have paid
                us in the twelve months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl text-foreground">
                8. Intellectual Property
              </h2>
              <p className="mt-3">
                The ScoreLift name, logo, design system, and platform code are
                our intellectual property. You may not reproduce, distribute, or
                create derivative works without our express written permission.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl text-foreground">
                9. Termination
              </h2>
              <p className="mt-3">
                We reserve the right to suspend or terminate your account at any
                time for violation of these terms, fraudulent activity, or
                behavior that harms the Platform or other users.
              </p>
              <p className="mt-3">
                You may delete your account at any time from your settings. Upon
                termination, your data is permanently deleted within 30 days.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl text-foreground">
                10. Changes to Terms
              </h2>
              <p className="mt-3">
                We may revise these terms from time to time. Material changes
                will be communicated via email or platform notification.
                Continued use of the Platform after changes take effect
                constitutes acceptance of the revised terms.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl text-foreground">
                11. Governing Law
              </h2>
              <p className="mt-3">
                These terms are governed by the laws of the State of California,
                without regard to its conflict of law provisions. Any disputes
                arising from these terms shall be resolved in the courts of San
                Francisco, California.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-2xl text-foreground">
                12. Contact
              </h2>
              <p className="mt-3">
                For questions about these terms, contact us at:
                <br />
                legal@scorelift.credit
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