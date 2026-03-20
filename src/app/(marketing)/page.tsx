import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Star, ArrowRight, Check, Zap, MessageSquare, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
// Dynamic imports for client components with Framer Motion (code-split for smaller main bundle)
const HeroVisual = dynamic(() => import('./_components/HeroVisual'));
const CollectVisual = dynamic(() => import('./_components/CollectVisual'));
const FAQAccordion = dynamic(() => import('./_components/FAQAccordion').then(m => ({ default: m.FAQAccordion })));
import { MotionCTA } from './_components/MotionCTA';

// Dynamic imports for below-fold components (defers framer-motion + heavy JS until scroll)
const EmbedVisual = dynamic(() => import('./_components/EmbedVisual'));
const PricingCards = dynamic(() => import('./_components/PricingCards').then(m => ({ default: m.PricingCards })));
const VouchWidget = dynamic(() => import('./_components/VouchWidget'));

/* ---------------------------------------------------------
   Data constants
--------------------------------------------------------- */

const PLATFORM_LOGOS: { name: string; svg: string }[] = [
  { name: "Framer", svg: '<path d="M4 0h16v8h-8zM4 8h8l8 8H4zM4 16h8v8z"/>' },
  { name: "Webflow", svg: '<path d="M17.802 8.56s-1.946 6.025-2.093 6.53c-.047-.373-1.121-6.53-1.121-6.53s-2.26 0-3.353.004c0 0 2.205 6.79 2.4 7.4C13.19 17.18 11.603 20 11.603 20s2.634-.01 3.725-.01l1.327-3.97s1.283 3.97 1.327 3.97h3.593S24 8.56 24 8.56zm-11.252.004s-2.05 6.291-2.168 6.65C4.335 14.84 4.348 8.56 4.348 8.56H0v11.44h3.6s2.095-6.455 2.228-6.87c.05.36 1.143 6.87 1.143 6.87h2.558L12.6 8.564z"/>' },
  { name: "WordPress", svg: '<path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zM3.891 12c0-1.266.303-2.461.835-3.52l4.6 12.604A8.126 8.126 0 013.891 12zm8.109 8.12a8.09 8.09 0 01-2.594-.426l2.755-8.004 2.822 7.734c.019.045.041.088.065.13A8.086 8.086 0 0112 20.12zm1.095-11.847c.553-.029 1.052-.087 1.052-.087.495-.059.437-.787-.058-.758 0 0-1.489.117-2.449.117-.903 0-2.42-.117-2.42-.117-.496-.029-.553.728-.058.758 0 0 .47.058.965.087l1.434 3.93-2.015 6.044-3.352-9.974c.554-.029 1.052-.087 1.052-.087.496-.059.437-.787-.057-.758 0 0-1.49.117-2.45.117a5.2 5.2 0 01-.395-.013A8.1 8.1 0 0112 3.88c2.148 0 4.103.835 5.558 2.196-.035-.002-.07-.007-.106-.007-1.078 0-1.842.937-1.842 1.943 0 .758.437 1.4.904 2.158.35.612.758 1.4.758 2.535 0 .787-.302 1.7-.7 2.974l-.917 3.063zm3.928 8.473l2.774-8.016c.519-1.297.691-2.333.691-3.254 0-.334-.021-.645-.065-.934A8.094 8.094 0 0120.109 12a8.11 8.11 0 01-3.086 6.373z"/>' },
  { name: "Next.js", svg: '<path d="M12 1.5C6.202 1.5 1.5 6.202 1.5 12S6.202 22.5 12 22.5 22.5 17.798 22.5 12 17.798 1.5 12 1.5zm5.25 15.75L9.5 7.875V16.5H8.25V6.375l7.875 9.75V7.5h1.125v9.75z"/>' },
  { name: "Squarespace", svg: '<path d="M22.655 7.696c-1.793-1.794-4.699-1.794-6.493 0l-7.468 7.469c-1.793 1.793-1.793 4.698 0 6.492 1.794 1.793 4.7 1.793 6.493 0l7.468-7.469c1.793-1.793 1.793-4.698 0-6.492zm-1.39 5.102l-7.468 7.469a2.786 2.786 0 01-3.712 0 2.786 2.786 0 010-3.713l7.468-7.468a2.786 2.786 0 013.712 0 2.786 2.786 0 010 3.712z"/><path d="M18.541 3.903c-1.793-1.793-4.699-1.793-6.492 0L4.58 11.372c-1.793 1.793-1.793 4.699 0 6.492l.695.695c-.234-.938-.073-1.956.568-2.791l7.468-7.468c1.793-1.794 4.699-1.794 6.492 0 1.794 1.793 1.794 4.698 0 6.492l-.695-.695c.938.233 1.957.073 2.792-.568l.035-.035c1.793-1.793 1.793-4.699 0-6.492z"/>' },
  { name: "Wix", svg: '<path d="M22.207 4.05c-.404.317-.659.798-.78 1.47l-1.724 9.78h-.015L17.803 4.91c-.22-.787-.597-1.364-1.07-1.746-.503-.406-1.106-.548-1.706-.548-.602 0-1.204.142-1.707.548-.474.382-.85.959-1.07 1.746L10.365 15.3h-.015L8.626 5.52c-.12-.672-.376-1.153-.78-1.47-.396-.312-.96-.428-1.48-.428-.726 0-1.273.193-1.669.577-.397.385-.597.96-.597 1.72L6.296 20h3.35l1.89-10.853h.015L13.555 20h.945l2.004-10.853h.015L18.41 20h3.35l2.195-14.081c0-.76-.2-1.335-.596-1.72-.397-.384-.944-.577-1.67-.577-.52 0-1.085.116-1.48.428z"/>' },
  { name: "Shopify", svg: '<path d="M15.5 2.1c-.1 0-.2.1-.3.1-.1 0-1.4.4-1.4.4s-1-1-1.1-1.1c-.1-.1-.3-.1-.4-.1l-.7 16.8 5.8-1.3S15.6 2.3 15.5 2.1zM12 4.4l-.6 2s-.7-.4-1.6-.3c-1.2.1-1.2.8-1.2 1 .1.8 2.1 1 2.2 3 .1 1.5-.8 2.5-2 2.6-1.5.1-2.3-.8-2.3-.8l.3-1.3s.8.6 1.4.6c.4 0 .6-.3.5-.6-.1-1-1.7-1-1.8-2.8C7 6.5 8.2 5 10.3 4.8c.8-.1 1.2.2 1.2.2l.5-1.5V4.4z"/>' },
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
    a: "Yes. SaaS founders use Vouch to collect testimonials from users and display them on their landing page to improve conversion. The React component drops directly into any Next.js app. The script tag works on any marketing page. Your widget picks up your brand color and looks native to your product from day one.",
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
    a: "Yes. The collection form has a built-in video recording step. Clients record directly in their browser with one click. No app to download, no third-party service. Video testimonials are available on Pro and Studio plans.",
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
              No chasing clients. No design work. Real testimonials on your site, looking exactly how you want.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <MotionCTA>
                <Button
                  asChild
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-7 py-6 text-base font-semibold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all"
                >
                  <Link href="/signup">
                    Collect my first testimonial <ArrowRight className="ml-1.5 w-4 h-4" />
                  </Link>
                </Button>
              </MotionCTA>
              <MotionCTA>
                <Button
                  asChild
                  variant="ghost"
                  size="lg"
                  className="rounded-xl px-7 py-6 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200"
                >
                  <a href="#how-it-works">See how it works</a>
                </Button>
              </MotionCTA>
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
          {PLATFORM_LOGOS.map((platform) => (
            <div
              key={platform.name}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200/80 rounded-full text-sm font-medium text-gray-500 shadow-sm hover:border-indigo-200 hover:text-indigo-600 transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4 shrink-0"
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: platform.svg }}
              />
              {platform.name}
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

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
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
                Set your brand color once. The widget matches your site from day one.
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

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
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
   Social proof (live Vouch widget)
--------------------------------------------------------- */

function TestimonialsSection() {
  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Loved by freelancers and founders
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Real feedback from real users. Displayed with Vouch.
          </p>
        </div>
        <VouchWidget widgetId="6f08c057-3906-4f90-9346-f2fff0a0a440" />
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

        <FAQAccordion items={FAQS} />
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
              Your next client is reading your site right now.
              <br className="hidden sm:block" /> What will they see?
            </h2>
            <p className="text-indigo-100 text-lg mb-9 max-w-lg mx-auto">
              Every day without real testimonials is a day you are leaving trust on the table.
              Set up takes 15 minutes. No credit card, no commitment.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <MotionCTA>
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl px-8 py-6 text-base font-semibold shadow-lg"
                >
                  <Link href="/signup">
                    Collect my first testimonial <ArrowRight className="ml-1.5 w-4 h-4" />
                  </Link>
                </Button>
              </MotionCTA>
              <MotionCTA>
                <Button
                  asChild
                  variant="ghost"
                  size="lg"
                  className="text-white border border-white/25 hover:bg-white/10 rounded-xl px-8 py-6 text-base"
                >
                  <Link href="/pricing">See pricing</Link>
                </Button>
              </MotionCTA>
            </div>

            <p className="text-indigo-200 text-xs mt-6">
              Free plan included · No credit card required to start
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
        <TestimonialsSection />
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
