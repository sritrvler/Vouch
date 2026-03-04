import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Star, ArrowRight, Check, Zap, MessageSquare, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Dynamic imports for client components with Framer Motion (code-split for smaller main bundle)
const HeroVisual = dynamic(() => import('./_components/HeroVisual'));
const CollectVisual = dynamic(() => import('./_components/CollectVisual'));

// Regular imports for other client components (below fold, no urgency)
import EmbedVisual from './_components/EmbedVisual';
import PricingCards from './_components/PricingCards';

/* ---------------------------------------------------------
   Data constants
--------------------------------------------------------- */

const TRUST_LABELS = [
  "Framer",
  "Webflow",
  "WordPress",
  "Next.js",
  "Squarespace",
  "Wix",
  "Shopify",
  "Ghost",
  "Notion Sites",
  "Carrd",
];

const PAIN_POINTS = [
  {
    number: "01",
    title: "Your testimonial widget looks like it came from somewhere else",
    body: "You spend hours getting a site pixel-perfect, whether it is your own portfolio or a client's site. Then you paste a testimonial embed and it immediately screams third-party tool. Wrong fonts, wrong colors, wrong vibe. Your work deserves better than that.",
  },
  {
    number: "02",
    title: "Your testimonial widget tanks your Lighthouse score",
    body: "Third-party testimonial tools load heavy JavaScript, external fonts, and analytics trackers. Every point you lose on Lighthouse is lost conversion. Vouch renders testimonials as native HTML with no external requests and no cookie banners. Your Core Web Vitals stay clean.",
  },
  {
    number: "03",
    title: "The moment to ask passes fast. Most tools are not ready when it does.",
    body: "Right after a great delivery, a launch, or a five-star user interaction is when your clients and users are most willing to say something. Most tools make you set up a form, configure the embed, and fight the CMS before you can send a single link. Vouch is ready in 15 minutes and stays ready forever.",
  },
];

const FAQS = [
  {
    q: "Can one account cover multiple projects or clients?",
    a: "Yes. One account gives you unlimited projects. Create a separate form and widget for each client site, each product, or each service you offer. Each one can have its own branding, questions, and embed. There are no per-domain or per-project fees on Pro.",
  },
  {
    q: "Does this work for SaaS products and apps?",
    a: "Yes. SaaS founders use Vouch to collect testimonials from users and display them on their landing page to improve conversion. The React component drops directly into any Next.js app. The script tag works on any marketing page. Your widget reads your accent color and looks native to your product from day one.",
  },
  {
    q: "How is this different from Testimonial.to or EmbedSocial?",
    a: "Those tools charge per domain or per seat, inject third-party scripts that hurt your Lighthouse score, and lock testimonials inside their own hosted page. Vouch renders as native HTML with zero external requests. The widget matches your design instead of theirs, one account covers every project you run, and in-browser video recording is built in with no third-party SDK.",
  },
  {
    q: "Does the testimonial widget slow down my site?",
    a: "No. Vouch renders testimonials as native HTML directly in your page. There are no external JavaScript libraries, no third-party trackers, and no cookie banners added to your page. Your Lighthouse score and Core Web Vitals stay exactly where you left them.",
  },
  {
    q: "Can my clients record video testimonials?",
    a: "Yes. The collection form has a built-in video recording step. Clients record directly in their browser with one click. No app to download, no third-party service. Free accounts include 3 video testimonials per project. Pro gets unlimited.",
  },
  {
    q: "Can I remove the 'Powered by Vouch' branding?",
    a: "Yes. Pro removes the branding entirely from both the widget and the collection form. Your clients and their users see only your work.",
  },
  {
    q: "Will the widget match my site's design?",
    a: "Yes. You pick an accent color in your dashboard and the widget uses it everywhere: cards, stars, and avatars. The component renders using your page's existing font stack, so there are no visual mismatches with a site you have spent careful effort designing.",
  },
  {
    q: "Do my clients need to create an account to leave a testimonial?",
    a: "No. They click the link, fill in the form, and they are done. No signup, no login, nothing to install. The form works on any phone or laptop.",
  },
  {
    q: "How is this different from just asking clients via email?",
    a: "Email requests get ignored. Vouch gives clients a guided, 2-minute experience with a branded form. They know exactly what to write because the form walks them through it. The completion rate is meaningfully higher than unstructured email requests.",
  },
  {
    q: "Does it work on Webflow, Framer, WordPress, and Next.js?",
    a: "Yes. Vouch gives you a script tag that works anywhere you can paste HTML, and a React component for Next.js and Remix projects. Both pull from the same data source. Your testimonial section looks native to whatever stack you are using.",
  },
  {
    q: "Do I need a website to use Vouch?",
    a: "No. Every account gets a public page at /p/your-name that you can share directly with prospects via email or a DM. Your testimonials live there even without a website.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your dashboard in under a minute. No questions, no lock-in. You keep access until the end of your billing period.",
  },
];

/* ---------------------------------------------------------
   Hero section
--------------------------------------------------------- */

function HeroSection() {
  return (
    <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-20 overflow-hidden">
      {/* Dot grid texture */}
      <div className="absolute inset-0 bg-dot-grid pointer-events-none" />
      {/* Ambient background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 right-0 w-[700px] h-[600px] bg-indigo-100 rounded-full blur-3xl opacity-35 translate-x-1/4" />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-violet-50 rounded-full blur-3xl opacity-50 -translate-x-1/2" />
        <div className="absolute bottom-0 right-1/3 w-[300px] h-[300px] bg-indigo-50 rounded-full blur-3xl opacity-40" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 xl:grid-cols-[5fr_3fr] gap-12 lg:gap-20 items-center">
          {/* Copy */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 mb-5">
              <span className="size-1.5 rounded-full bg-indigo-500 animate-pulse" />
              For Freelancers, Agencies, and SaaS Founders
            </div>

            <h1 className="text-[2.1rem] sm:text-[2.5rem] md:text-[3.2rem] lg:text-[3.0rem] xl:text-[3.6rem] font-black text-gray-900 leading-[1.07] tracking-tight mb-6">
              Social proof that
              <br />
              matches your brand.
              <br />
              <span className="text-indigo-600">Live in 15 minutes.</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-500 leading-relaxed mb-9 max-w-lg">
              Branded video and text testimonials that load fast and keep your SEO intact with zero Lighthouse impact.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Button
                asChild
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-7 py-6 text-base font-semibold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all"
              >
                <Link href="/signup">
                  Start for free <ArrowRight className="ml-1.5 w-4 h-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="rounded-xl px-7 py-6 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200"
              >
                <a href="#how-it-works">See how it works</a>
              </Button>
            </div>

          </div>

          {/* Setup journey visual */}
          <div className="flex justify-center lg:justify-end">
            <HeroVisual />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------
   Trust bar
--------------------------------------------------------- */

function TrustBar() {
  return (
    <div className="border-y border-gray-100 bg-gray-50/50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-7">
          Works on every platform. Looks native to every design.
        </p>
        <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
          {TRUST_LABELS.map((label) => (
            <div
              key={label}
              className="px-4 py-2 bg-white border border-gray-200/80 rounded-full text-sm font-medium text-gray-500 shadow-sm hover:border-indigo-200 hover:text-indigo-600 transition-colors"
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Problem section
--------------------------------------------------------- */

function ProblemSection() {
  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Your brand is consistent everywhere.
            <br className="hidden sm:block" /> Your social proof should be too.
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
            Three friction points that are making great work look generic.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {PAIN_POINTS.map((pt) => (
            <div key={pt.number} className="relative pl-16">
              <div className="absolute left-0 top-0 text-5xl font-black bg-gradient-to-br from-indigo-200 to-violet-200 bg-clip-text text-transparent leading-none select-none">
                {pt.number}
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2 mt-1">
                {pt.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">{pt.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------
   Features section
--------------------------------------------------------- */

function FeaturesSection() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 lg:mb-24">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Built for the way you actually build.
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
            Drop it in. It fits. No style overrides, no design fights, no clashing third-party look.
          </p>
        </div>

        <div className="space-y-24 lg:space-y-32">
          {/* Feature 1: Collect */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                  Step 1
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-4">
                Send a link.
                <br />
                Get a testimonial. Keep moving.
              </h3>
              <p className="text-base text-gray-500 leading-relaxed mb-7">
                A mobile-first form that guides your client through rating, writing, and submitting
                in two minutes. No login, no app, no friction. The form picks up your brand colors
                and logo automatically.
              </p>
              <ul className="space-y-3">
                {[
                  "Your accent color and logo on every form",
                  "Separate forms per project, client, or product",
                  "Custom questions to get specific, useful answers",
                ].map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-3 text-sm text-gray-600"
                  >
                    <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-indigo-600" />
                    </div>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-center lg:justify-end">
              <CollectVisual />
            </div>
          </div>

          {/* Feature 2: Embed */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center lg:[&>*:first-child]:order-2">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                  Step 2 and 3
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-4">
                Approve in one click.
                <br />
                Embed or paste a React component.
              </h3>
              <p className="text-base text-gray-500 leading-relaxed mb-7">
                Testimonials arrive in your dashboard. Approve what works. Embed with a script tag
                on any platform, or drop the React component into your Next.js app or SaaS product.
                The widget reads your accent color and looks native on day one.
              </p>
              <ul className="space-y-3">
                {[
                  "Script tag works on Framer, Webflow, WordPress, or any other platform",
                  "React component for Next.js apps and SaaS landing pages",
                  "Each widget scoped to one project (portfolio, client site, or product)",
                ].map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-3 text-sm text-gray-600"
                  >
                    <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-indigo-600" />
                    </div>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-center lg:justify-start">
              <EmbedVisual />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------
   How it works (dark section)
--------------------------------------------------------- */

function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Create your form",
      body: "Add your logo and accent color. Write one optional custom question. The form looks like your brand. Ready in under five minutes.",
    },
    {
      number: "02",
      title: "Share with clients",
      body: "Paste the link in an email, a DM, or your client onboarding template. They click, fill in two minutes, done. No login, no friction.",
    },
    {
      number: "03",
      title: "Approve and display",
      body: "Submissions hit your dashboard. Approve what you love. Paste one line or drop in the React component. Your testimonial wall is live.",
    },
  ];

  return (
    <section className="relative bg-slate-950 py-20 sm:py-28 overflow-hidden">
      {/* Subtle dot pattern on dark background */}
      <div className="absolute inset-0 bg-dot-grid-white pointer-events-none" />
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-900/30 rounded-full blur-3xl pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Live on your site in 15 minutes.
            <br className="hidden sm:block" /> Branded, fast, and yours.
          </h2>
          <p className="mt-4 text-lg text-slate-400 max-w-xl mx-auto">
            The whole product is share, approve, embed. No complex setup. No integrations to configure.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {steps.map((step) => (
            <div key={step.number}>
              <div className="text-[64px] font-black leading-none mb-5 select-none bg-gradient-to-br from-indigo-400 to-violet-500 bg-clip-text text-transparent">
                {step.number}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------
   Pricing section
--------------------------------------------------------- */

function PricingSection() {
  return (
    <section id="pricing" className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            One account. Every project you build.
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Start free. Upgrade when your work grows. One account, no per-project fees.
          </p>
        </div>
        <PricingCards />
      </div>
    </section>
  );
}

/* ---------------------------------------------------------
   FAQ
--------------------------------------------------------- */

function FAQSection() {
  return (
    <section className="py-20 sm:py-28 bg-gray-50/50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Questions?
          </h2>
          <p className="mt-3 text-gray-500">
            If you are wondering, others are too.
          </p>
        </div>

        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <details key={i} className="bg-white border border-gray-100 rounded-xl overflow-hidden group">
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-medium text-gray-900 select-none list-none [&::-webkit-details-marker]:hidden">
                {faq.q}
                <svg className="w-4 h-4 text-gray-400 shrink-0 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------
   Bottom CTA
--------------------------------------------------------- */

function BottomCTA() {
  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <div
          className="relative rounded-3xl px-8 py-16 overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #312e81 0%, #4338ca 40%, #6366f1 75%, #818cf8 100%)",
          }}
        >
          {/* Dot pattern overlay */}
          <div className="absolute inset-0 bg-dot-grid-white pointer-events-none" />
          {/* Orbs */}
          <div className="absolute -top-16 -right-16 w-72 h-72 bg-violet-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-indigo-300/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative">
            {/* Star row */}
            <div className="flex justify-center gap-1 mb-6">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className="w-5 h-5 fill-amber-400 text-amber-400"
                />
              ))}
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
              Ship a testimonial section today.
              <br className="hidden sm:block" /> Branded, fast, and live in 15 minutes.
            </h2>
            <p className="text-indigo-100 text-lg mb-9 max-w-lg mx-auto">
              Free to start. Set up in 15 minutes. Upgrade when your work grows
              and it covers everything you build.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl px-8 py-6 text-base font-semibold shadow-lg"
              >
                <Link href="/signup">
                  Start for free <ArrowRight className="ml-1.5 w-4 h-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="text-white border border-white/25 hover:bg-white/10 rounded-xl px-8 py-6 text-base"
              >
                <Link href="/pricing">See pricing</Link>
              </Button>
            </div>

            <p className="text-indigo-200 text-xs mt-6">
              Free forever · No credit card required to start
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------
   Page
--------------------------------------------------------- */

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <div className="below-fold">
        <TrustBar />
      </div>
      <div className="below-fold">
        <ProblemSection />
      </div>
      <div className="below-fold">
        <FeaturesSection />
      </div>
      <div className="below-fold">
        <HowItWorksSection />
      </div>
      <div className="below-fold">
        <PricingSection />
      </div>
      <div className="below-fold">
        <FAQSection />
      </div>
      <div className="below-fold">
        <BottomCTA />
      </div>
    </>
  );
}
