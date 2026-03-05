import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service - Vouch',
  description: 'Terms of Service for Vouch.',
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-10">Last updated: March 5, 2026</p>

      <div className="prose prose-gray max-w-none space-y-8 text-sm leading-relaxed text-foreground/80">

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">1. Acceptance of terms</h2>
          <p>
            By creating an account or using Vouch (&ldquo;the Service&rdquo;), you agree to be bound
            by these Terms of Service. If you do not agree, do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">2. Description of service</h2>
          <p>
            Vouch is a testimonial collection and display platform. We provide tools to collect,
            manage, and embed customer testimonials on your website.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">3. Your account</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and
            for all activity that occurs under your account. You must provide accurate information
            when creating your account.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">4. Acceptable use</h2>
          <p>You agree not to use the Service to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Post false, misleading, or fabricated testimonials</li>
            <li>Violate any applicable law or regulation</li>
            <li>Infringe on the intellectual property rights of others</li>
            <li>Transmit spam or unsolicited communications</li>
            <li>Attempt to gain unauthorised access to our systems</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">5. Subscription and billing</h2>
          <p>
            Vouch offers a free plan and paid plans (Pro, Studio) billed monthly or annually. By
            subscribing to a paid plan, you authorise us to charge your payment method on a recurring
            basis. Subscriptions can be cancelled at any time via the billing portal. No refunds are
            provided for partial billing periods.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">6. Your content</h2>
          <p>
            You retain ownership of all testimonials and content collected through the Service. By
            using Vouch, you grant us a limited licence to store and display your content solely for
            the purpose of providing the Service.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">7. Fair use</h2>
          <p>
            &ldquo;Unlimited&rdquo; features (projects, testimonials, video uploads, widgets) are
            intended for reasonable business use. We reserve the right to contact you if your usage
            significantly exceeds typical patterns for your plan tier. Examples of reasonable use
            include collecting testimonials from your customers and displaying them on your websites.
            Examples of usage that may exceed fair use include automated bulk uploads, using the
            Service primarily as a general-purpose video hosting platform, or sharing account
            credentials to circumvent plan limits.
          </p>
          <p className="mt-2">
            We will always notify you and provide an opportunity to reduce usage before taking any
            action on your account.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">8. Termination</h2>
          <p>
            We reserve the right to suspend or terminate your account if you violate these Terms. You
            may delete your account at any time. Upon termination, your data will be deleted within
            30 days.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">9. Disclaimers</h2>
          <p>
            The Service is provided &ldquo;as is&rdquo; without warranty of any kind. We do not
            guarantee uninterrupted or error-free operation of the Service.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">10. Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, Vouch shall not be liable for any indirect,
            incidental, or consequential damages arising from your use of the Service.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">11. Changes to these terms</h2>
          <p>
            We may update these Terms from time to time. We will notify you of material changes via
            email or a notice in the dashboard. Continued use of the Service after changes
            constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">12. Contact</h2>
          <p>
            Questions about these Terms? Email us at{' '}
            <a href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'hello@example.com'}`} className="text-primary underline underline-offset-4">
              {process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'hello@example.com'}
            </a>
            .
          </p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t border-border text-sm text-muted-foreground">
        <Link href="/privacy" className="text-primary hover:underline underline-offset-4">
          Privacy Policy
        </Link>
        {' '}·{' '}
        <Link href="/" className="hover:text-foreground transition-colors">
          Back to home
        </Link>
      </div>
    </div>
  );
}
