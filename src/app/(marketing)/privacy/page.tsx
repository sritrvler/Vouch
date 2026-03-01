import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy - Vouch',
  description: 'Privacy Policy for Vouch.',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-10">Last updated: March 1, 2026</p>

      <div className="prose prose-gray max-w-none space-y-8 text-sm leading-relaxed text-foreground/80">

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">1. Information we collect</h2>
          <p>We collect the following information when you use Vouch:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Account information: your name and email address when you sign up</li>
            <li>Project information: business name, logo, website URL, and accent color</li>
            <li>Testimonial data: content submitted by your customers through your collection forms</li>
            <li>Payment information: processed by Stripe. We do not store card details</li>
            <li>Usage data: page views and feature usage for improving the Service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">2. How we use your information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Provide and operate the Service</li>
            <li>Process payments and manage your subscription</li>
            <li>Send transactional emails (email confirmations, password resets)</li>
            <li>Respond to support requests</li>
            <li>Improve the Service</li>
          </ul>
          <p className="mt-2">We do not sell your personal data to third parties.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">3. Testimonial data and your customers</h2>
          <p>
            When your customers submit testimonials through your collection form, their name, role,
            company, and review content are stored in our database and associated with your account.
            You are responsible for ensuring you have the right to collect and display this data, and
            for informing your customers that their submission may be published on your website.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">4. Third-party services</h2>
          <p>We use the following third-party services:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              <strong>Supabase</strong> - database and authentication. Data is stored on servers in
              the region you select during setup.
            </li>
            <li>
              <strong>Stripe</strong> - payment processing. Subject to{' '}
              <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">
                Stripe&apos;s Privacy Policy
              </a>
              .
            </li>
            <li>
              <strong>Vercel</strong> - hosting and edge infrastructure.
            </li>
            <li>
              <strong>Clearbit</strong> - company logo lookup displayed on widgets and public pages.
              Only the company domain name is sent to Clearbit.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">5. Cookies</h2>
          <p>
            We use cookies solely to maintain your authentication session. We do not use tracking or
            advertising cookies.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">6. Data retention</h2>
          <p>
            We retain your data for as long as your account is active. If you delete your account,
            your data is deleted within 30 days. Testimonial data submitted by your customers is
            deleted at the same time.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">7. Your rights</h2>
          <p>
            You have the right to access, correct, or delete your personal data at any time. To
            exercise these rights, email us at{' '}
            <a href="mailto:hello@vouch.so" className="text-primary underline underline-offset-4">
              hello@vouch.so
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">8. Security</h2>
          <p>
            We use industry-standard security measures including encrypted connections (HTTPS) and
            row-level security on our database. However, no method of transmission over the internet
            is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">9. Changes to this policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of material
            changes via email. Continued use of the Service after changes constitutes acceptance of
            the updated Policy.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">10. Contact</h2>
          <p>
            Questions about this Privacy Policy? Email us at{' '}
            <a href="mailto:hello@vouch.so" className="text-primary underline underline-offset-4">
              hello@vouch.so
            </a>
            .
          </p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t border-border text-sm text-muted-foreground">
        <Link href="/terms" className="text-primary hover:underline underline-offset-4">
          Terms of Service
        </Link>
        {' '}·{' '}
        <Link href="/" className="hover:text-foreground transition-colors">
          Back to home
        </Link>
      </div>
    </div>
  );
}
