import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, Brain, CheckCircle2, Filter, Mail,
  Moon, Search, Sparkles, Sun, TrendingUp,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { Routes } from "@/routes/routes";
import "./landing.css";

/* ─── Theme hook ──────────────────────────────────────────────────────────── */

function useLandingTheme() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try { return localStorage.getItem("theme") !== "light"; } catch { return true; }
  });

  const toggle = () =>
    setIsDark((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("theme", next ? "dark" : "light");
        document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
      } catch {}
      return next;
    });

  return { isDark, toggle };
}

/* ─── Static data ─────────────────────────────────────────────────────────── */

const MOCK_LEADS = [
  { name: "Sarah Chen",  initials: "SC", title: "CTO",             company: "DataFlow Inc",  source: "li", score: 94, ab: "rgba(69,133,255,0.22)",  ac: "#4585FF" },
  { name: "Marcus Webb", initials: "MW", title: "VP Engineering",  company: "CloudScale",    source: "li", score: 87, ab: "rgba(155,94,255,0.22)", ac: "#9B5EFF" },
  { name: "Priya Nair",  initials: "PN", title: "Head of Product", company: "Nexus AI",      source: "gm", score: 82, ab: "rgba(34,197,94,0.22)",  ac: "#22C55E" },
  { name: "Jordan Kim",  initials: "JK", title: "Founder & CEO",   company: "Streamline.io", source: "li", score: 91, ab: "rgba(251,146,60,0.22)", ac: "#FB923C" },
];

type Variant = "blue" | "violet" | "green";

const VARIANT_CSS: Record<Variant, { color: string; bg: string; bd: string; bdLg: string; wm: string; step: string }> = {
  blue:   { color: "--lf-acc",  bg: "--lf-acc-bg",  bd: "--lf-acc-bd",  bdLg: "--lf-acc-bd-lg",  wm: "--lf-acc-wm",  step: "--lf-acc-step" },
  violet: { color: "--lf-vio",  bg: "--lf-vio-bg",  bd: "--lf-vio-bd",  bdLg: "--lf-vio-bd-lg",  wm: "--lf-vio-wm",  step: "--lf-vio-step" },
  green:  { color: "--lf-grn",  bg: "--lf-grn-bg",  bd: "--lf-grn-bd",  bdLg: "--lf-grn-bd-lg",  wm: "--lf-grn-wm",  step: "--lf-grn-step" },
};

const v = (name: string) => `var(${name})`;

const FEATURES: { icon: typeof Search; variant: Variant; title: string; description: string; bullets: string[] }[] = [
  {
    icon: Search,
    variant: "blue",
    title: "Intelligent Lead Discovery",
    description: "Configure filters once and let LeadFinder automatically scrape qualified leads from LinkedIn and Google Maps on your schedule.",
    bullets: ["LinkedIn search scraping", "Google Maps business data", "Scheduled & on-demand runs"],
  },
  {
    icon: Brain,
    variant: "violet",
    title: "AI Lead Scoring",
    description: "Our AI analyses every lead against your ideal customer profile and assigns a fit score so your team focuses where it matters.",
    bullets: ["ICP-based 0–100 score", "Automated qualification", "Priority inbox for high-fit leads"],
  },
  {
    icon: Mail,
    variant: "green",
    title: "Multi-channel Outreach",
    description: "AI-drafted messages for email, SMS, and LinkedIn — personalised to each lead. Run campaigns, track opens, move deals.",
    bullets: ["Email, SMS & LinkedIn drafts", "Campaign management", "Pipeline tracking"],
  },
];

const STEPS: { num: string; icon: typeof Filter; variant: Variant; title: string; body: string }[] = [
  {
    num: "01",
    icon: Filter,
    variant: "blue",
    title: "Configure Your Filter",
    body: "Tell LeadFinder who you're looking for — job title, location, industry, company size — and which source to scrape.",
  },
  {
    num: "02",
    icon: Sparkles,
    variant: "violet",
    title: "AI Discovers & Scores",
    body: "Your filter runs on schedule. Every prospect is scraped and immediately scored with AI against your ideal customer profile.",
  },
  {
    num: "03",
    icon: TrendingUp,
    variant: "green",
    title: "Outreach & Convert",
    body: "Review scored leads, send AI-drafted messages across email, SMS and LinkedIn, and track every deal through your pipeline.",
  },
];

/* ─── Root ────────────────────────────────────────────────────────────────── */

export default function LandingPage() {
  const { isLoggedIn: rawLoggedIn } = useAuthStore();
  const isLoggedIn = Boolean(rawLoggedIn);
  const { isDark, toggle } = useLandingTheme();

  useEffect(() => {
    document.body.style.overflow = "auto";
    document.body.style.height = "auto";
    document.documentElement.style.overflow = "auto";
    document.documentElement.style.height = "auto";
    return () => {
      document.body.style.overflow = "";
      document.body.style.height = "";
      document.documentElement.style.overflow = "";
      document.documentElement.style.height = "";
    };
  }, []);

  return (
    <div
      className={`lf-root min-h-screen${isDark ? "" : " lf-light"}`}
      style={{ backgroundColor: "var(--lf-bg)", fontFamily: "'DM Sans', system-ui, sans-serif", color: "var(--lf-tx)" }}
    >
      {/* Fixed ambient layer */}
      <div className="lf-grid-bg fixed inset-0 pointer-events-none z-0" />
      <div
        className="fixed pointer-events-none z-0"
        style={{ top: "-300px", left: "-200px", width: "900px", height: "900px",
          background: `radial-gradient(ellipse, var(--lf-acc-glow) 0%, transparent 65%)` }}
      />
      <div
        className="fixed pointer-events-none z-0"
        style={{ bottom: "-300px", right: "-200px", width: "900px", height: "900px",
          background: `radial-gradient(ellipse, var(--lf-vio-glow) 0%, transparent 65%)` }}
      />

      <div className="relative z-10">
        <LandingNav isLoggedIn={isLoggedIn} isDark={isDark} toggle={toggle} />
        <HeroSection isLoggedIn={isLoggedIn} />
        <StatsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CTASection isLoggedIn={isLoggedIn} />
        <LandingFooter />
      </div>
    </div>
  );
}

/* ─── Nav ─────────────────────────────────────────────────────────────────── */

function LandingNav({ isLoggedIn, isDark, toggle }: { isLoggedIn: boolean; isDark: boolean; toggle: () => void }) {
  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{
        backgroundColor: "var(--lf-nav-bg)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderColor: "var(--lf-nav-bd)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2.5 shrink-0" style={{ textDecoration: "none" }}>
          <img src="/leadfinder-logo.png" alt="" className="h-7 w-7 object-contain" />
          <span style={{ fontFamily: "'Syne', system-ui, sans-serif", fontWeight: 700, fontSize: "17px",
            color: "var(--lf-tx)", letterSpacing: "-0.01em" }}>
            LeadFinder
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-7">
          {["Features", "How it works"].map((label) => (
            <a key={label} href={`#${label.toLowerCase().replace(/\s+/g, "-")}`} className="lf-nav-link">
              {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button onClick={toggle} className="lf-theme-btn" aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}>
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {isLoggedIn ? (
            <Link to={Routes.dashboard.root} className="lf-btn-primary lf-sm">
              Go to Dashboard
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link to={Routes.auth.sign_in} className="lf-btn-text">Sign in</Link>
              <Link to={Routes.auth.sign_up} className="lf-btn-primary lf-sm">Get started free</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

/* ─── Hero ────────────────────────────────────────────────────────────────── */

function HeroSection({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-24 pb-28 grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-14 lg:gap-10 items-center">
      <div className="space-y-8 max-w-xl">
        <div className="lf-label lf-label-blue">
          <span className="lf-pulse-dot w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "var(--lf-grn)", borderRadius: "9999px" }} />
          AI-powered lead intelligence
        </div>

        <h1 style={{ fontFamily: "'Syne', system-ui, sans-serif", fontWeight: 800,
          fontSize: "clamp(38px,5vw,64px)", lineHeight: 1.05, color: "var(--lf-tx)", letterSpacing: "-0.025em" }}>
          Turn Any Market
          <br />
          Into <span className="lf-accent-text">Your Pipeline</span>
        </h1>

        <p className="text-lg leading-relaxed" style={{ color: "var(--lf-mu)" }}>
          LeadFinder automatically discovers prospects from LinkedIn and Google Maps, scores them with AI,
          and prepares personalised outreach — so your team can focus on closing.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            to={isLoggedIn ? Routes.dashboard.root : Routes.auth.sign_up}
            className="lf-btn-primary"
            style={{ paddingLeft: "24px", paddingRight: "24px", paddingTop: "14px", paddingBottom: "14px" }}
          >
            {isLoggedIn ? "Go to Dashboard" : "Start finding leads"}
            <ArrowRight className="w-4 h-4" />
          </Link>
          {!isLoggedIn && (
            <Link to={Routes.auth.sign_in} className="lf-btn-ghost">Sign in</Link>
          )}
        </div>

        <div className="flex flex-wrap gap-5">
          {["No credit card required", "LinkedIn & Google Maps", "AI-powered scoring"].map((t) => (
            <div key={t} className="flex items-center gap-2 text-sm" style={{ color: "var(--lf-mu)" }}>
              <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "var(--lf-grn)" }} />
              {t}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center lg:justify-end">
        <HeroTerminal />
      </div>
    </section>
  );
}

function HeroTerminal() {
  return (
    <div className="relative w-full max-w-md lf-float">
      {/* Ambient glow behind the card */}
      <div className="absolute pointer-events-none" style={{
        inset: "-40px",
        background: `radial-gradient(ellipse, var(--lf-hero-glow) 0%, transparent 70%)`,
        filter: "blur(10px)",
      }} />

      {/* Terminal card */}
      <div className="relative rounded-2xl overflow-hidden" style={{
        backgroundColor: "var(--lf-sur)",
        border: "1px solid var(--lf-acc-bd)",
        boxShadow: "var(--lf-term-sh)",
      }}>
        <div className="lf-scan-beam" />

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b" style={{
          borderColor: "var(--lf-acc-bd-sm)", backgroundColor: "var(--lf-inset)" }}>
          <div className="flex gap-1.5">
            {["rgba(239,68,68,0.55)", "rgba(234,179,8,0.55)", "rgba(34,197,94,0.55)"].map((c) => (
              <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
            ))}
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="lf-pulse-dot w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: "var(--lf-grn)", borderRadius: "9999px" }} />
            <span className="truncate text-[11px]"
              style={{ fontFamily: "ui-monospace, Consolas, monospace", color: "var(--lf-mu)" }}>
              filter:SaaS-Founders · SF · running
            </span>
          </div>
          <span className="shrink-0 text-[11px] font-semibold"
            style={{ fontFamily: "ui-monospace, Consolas, monospace", color: "var(--lf-acc)" }}>
            247 leads
          </span>
        </div>

        {/* Lead rows */}
        <div className="p-3 space-y-2">
          {MOCK_LEADS.map((lead, i) => (
            <div key={lead.name} className={`lf-lead-${i + 1} flex items-center gap-3 p-2.5 rounded-xl`}
              style={{ backgroundColor: "var(--lf-row-bg)", border: "1px solid var(--lf-row-bd)" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: lead.ab, color: lead.ac }}>
                {lead.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: "var(--lf-tx)" }}>{lead.name}</p>
                <p className="text-xs truncate" style={{ color: "var(--lf-mu)" }}>{lead.title} · {lead.company}</p>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0" style={{
                backgroundColor: lead.source === "li" ? "var(--lf-li-bg)" : "var(--lf-gm-bg)",
                color:           lead.source === "li" ? "var(--lf-li-c)" : "var(--lf-gm-c)",
                border:          `1px solid ${lead.source === "li" ? "var(--lf-li-bd)" : "var(--lf-gm-bd)"}`,
              }}>
                {lead.source === "li" ? "LI" : "GM"}
              </span>
              <span className="w-7 text-right text-sm font-bold shrink-0" style={{
                color: lead.score >= 90 ? "var(--lf-grn-lt)" : lead.score >= 85 ? "var(--lf-acc)" : "var(--lf-ylw)",
              }}>
                {lead.score}
              </span>
            </div>
          ))}
        </div>

        {/* AI scoring footer */}
        <div className="px-4 py-3 border-t" style={{
          borderColor: "var(--lf-acc-bd-sm)", backgroundColor: "var(--lf-inset)" }}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--lf-vio)" }} />
            <span className="text-xs" style={{ color: "var(--lf-mu)" }}>AI scoring in progress</span>
            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: "var(--lf-shimmer)" }}>
              <div className="lf-shimmer-bar h-full rounded-full" style={{
                width: "65%",
                background: "linear-gradient(90deg, var(--lf-acc), var(--lf-vio))",
              }} />
            </div>
            <span className="text-xs font-bold shrink-0" style={{ color: "var(--lf-acc)" }}>65%</span>
          </div>
        </div>
      </div>

      {/* Floating stat — conversion */}
      <div className="absolute -right-5 -bottom-5 lf-float-alt rounded-xl p-3 flex items-center gap-3"
        style={{ backgroundColor: "var(--lf-sur)", border: "1px solid var(--lf-grn-bd-lg)",
          boxShadow: "var(--lf-float-sh)", minWidth: "160px" }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: "var(--lf-grn-bg)" }}>
          <TrendingUp className="w-4 h-4" style={{ color: "var(--lf-grn)" }} />
        </div>
        <div>
          <p className="text-lg font-bold" style={{ fontFamily: "'Syne', sans-serif", color: "var(--lf-grn-lt)", lineHeight: 1.1 }}>
            3.2×
          </p>
          <p className="text-xs" style={{ color: "var(--lf-mu)" }}>conversion lift</p>
        </div>
      </div>

      {/* Floating stat — AI */}
      <div className="absolute -left-5 top-14 rounded-xl p-3 flex items-center gap-3"
        style={{ backgroundColor: "var(--lf-sur)", border: "1px solid var(--lf-vio-bd-lg)",
          boxShadow: "var(--lf-float-sh)", minWidth: "155px" }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: "var(--lf-vio-bg)" }}>
          <Brain className="w-4 h-4" style={{ color: "var(--lf-vio)" }} />
        </div>
        <div>
          <p className="text-lg font-bold" style={{ fontFamily: "'Syne', sans-serif", color: "var(--lf-vio-lt)", lineHeight: 1.1 }}>
            AI scored
          </p>
          <p className="text-xs" style={{ color: "var(--lf-mu)" }}>247 new leads</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Stats bar ───────────────────────────────────────────────────────────── */

function StatsSection() {
  const stats: { value: string; label: string; colorVar: string }[] = [
    { value: "50K+", label: "Leads Discovered",   colorVar: "--lf-acc" },
    { value: "89%",  label: "AI Scoring Accuracy", colorVar: "--lf-vio" },
    { value: "3.2×", label: "Avg Conversion Lift", colorVar: "--lf-grn" },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 pb-24">
      <div className="rounded-2xl px-6 py-8 grid grid-cols-1 sm:grid-cols-3"
        style={{ backgroundColor: "var(--lf-stats-bg)", border: "1px solid var(--lf-stats-bd)" }}>
        {stats.map(({ value, label, colorVar }, i) => (
          <div key={label}
            className="py-6 sm:py-0 sm:px-8 flex flex-col items-center text-center gap-1"
            style={{ borderTop: i > 0 ? "1px solid var(--lf-acc-bd-xs)" : undefined }}>
            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(32px,4vw,44px)",
              fontWeight: 800, color: v(colorVar), lineHeight: 1 }}>
              {value}
            </span>
            <span className="text-sm mt-1" style={{ color: "var(--lf-mu)" }}>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Features ────────────────────────────────────────────────────────────── */

function FeaturesSection() {
  return (
    <section id="features" className="max-w-6xl mx-auto px-6 py-24">
      <SectionLabel variant="blue">Platform capabilities</SectionLabel>
      <SectionHeading>
        Everything you need to fill<br />
        <span className="lf-accent-text">your pipeline</span>
      </SectionHeading>

      <p className="text-center text-lg mt-4 mb-16 max-w-2xl mx-auto" style={{ color: "var(--lf-mu)" }}>
        From discovery to conversion — LeadFinder handles the entire top of funnel with AI.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {FEATURES.map(({ icon: Icon, variant, title, description, bullets }) => {
          const cv = VARIANT_CSS[variant];
          return (
            <div key={title} className="lf-card-hover rounded-2xl p-6 space-y-5"
              style={{ backgroundColor: "var(--lf-sur)", border: `1px solid ${v(cv.bd)}` }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: v(cv.bg) }}>
                <Icon className="w-6 h-6" style={{ color: v(cv.color) }} />
              </div>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "18px", color: "var(--lf-tx)" }}>
                {title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--lf-mu)" }}>{description}</p>
              <ul className="space-y-2.5">
                {bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2.5 text-sm" style={{ color: "var(--lf-mu)" }}>
                    <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: v(cv.color) }} />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ─── How it works ────────────────────────────────────────────────────────── */

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-24">
      <SectionLabel variant="violet">Simple workflow</SectionLabel>
      <SectionHeading>
        From zero to pipeline<br />
        <span className="lf-accent-text">in three steps</span>
      </SectionHeading>

      <div className="relative mt-20 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
        <div className="hidden md:block absolute top-6 left-[calc(33.33%+24px)] right-[calc(33.33%+24px)] h-px pointer-events-none"
          style={{ background: "linear-gradient(90deg, var(--lf-acc-bd-lg), var(--lf-vio-bd-lg))" }} />

        {STEPS.map(({ num, icon: Icon, variant, title, body }) => {
          const cv = VARIANT_CSS[variant];
          return (
            <div key={num} className="relative flex flex-col items-center text-center gap-4">
              <div className="relative w-full flex justify-center">
                <span className="absolute -top-6 select-none pointer-events-none"
                  style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "88px",
                    color: v(cv.wm), lineHeight: 1, letterSpacing: "-0.04em" }}>
                  {num}
                </span>
                <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: v(cv.bg), border: `1px solid ${v(cv.bdLg)}`,
                    boxShadow: v(cv.step) }}>
                  <Icon className="w-6 h-6" style={{ color: v(cv.color) }} />
                </div>
              </div>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "18px", color: "var(--lf-tx)" }}>
                {title}
              </h3>
              <p className="text-sm leading-relaxed max-w-xs" style={{ color: "var(--lf-mu)" }}>{body}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ─── CTA ─────────────────────────────────────────────────────────────────── */

function CTASection({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <section className="max-w-6xl mx-auto px-6 py-24">
      <div className="relative rounded-3xl overflow-hidden p-12 md:p-20 text-center"
        style={{
          background: "linear-gradient(135deg, var(--lf-cta-from) 0%, var(--lf-cta-mid) 50%, var(--lf-cta-from) 100%)",
          border: "1px solid var(--lf-cta-bd)",
        }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% -10%, var(--lf-cta-glow) 0%, transparent 55%)" }} />

        <div className="relative space-y-8">
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "var(--lf-tx)",
            fontSize: "clamp(28px,4vw,48px)", letterSpacing: "-0.025em", lineHeight: 1.1 }}>
            Start building your pipeline
            <br />
            <span className="lf-accent-text">today — for free</span>
          </h2>

          <p className="text-lg max-w-xl mx-auto" style={{ color: "var(--lf-mu)" }}>
            Join teams using LeadFinder to discover high-fit prospects at scale and convert them with AI-personalised outreach.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to={isLoggedIn ? Routes.dashboard.root : Routes.auth.sign_up}
              className="lf-btn-primary"
              style={{ paddingLeft: "32px", paddingRight: "32px", paddingTop: "16px", paddingBottom: "16px" }}
            >
              {isLoggedIn ? "Go to Dashboard" : "Get started free"}
              <ArrowRight className="w-4 h-4" />
            </Link>
            {!isLoggedIn && (
              <Link to={Routes.auth.sign_in} className="lf-btn-ghost lf-cta-ghost">Sign in</Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ──────────────────────────────────────────────────────────────── */

function LandingFooter() {
  const cols = [
    { heading: "Product", links: ["Features", "How it works", "Pricing"] },
    { heading: "Company", links: ["About", "Blog", "Contact"] },
    { heading: "Legal",   links: ["Privacy policy", "Terms of service"] },
  ];

  return (
    <footer className="border-t" style={{ borderColor: "var(--lf-foot-bd)" }}>
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row items-start justify-between gap-10">
          <div className="space-y-4 max-w-xs">
            <Link to="/" className="flex items-center gap-2.5" style={{ textDecoration: "none" }}>
              <img src="/leadfinder-logo.png" alt="" className="h-7 w-7 object-contain" />
              <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "17px", color: "var(--lf-tx)" }}>
                LeadFinder
              </span>
            </Link>
            <p className="text-sm leading-relaxed" style={{ color: "var(--lf-mu)" }}>
              AI-powered lead intelligence for modern sales teams.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
            {cols.map(({ heading, links }) => (
              <div key={heading} className="space-y-3">
                <p style={{ color: "var(--lf-tx)", fontWeight: 600, fontSize: "14px" }}>{heading}</p>
                {links.map((l) => (
                  <a key={l} href="#" className="lf-foot-link">{l}</a>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderColor: "var(--lf-foot-bd)" }}>
          <p className="text-xs" style={{ color: "var(--lf-mu)" }}>© 2025 LeadFinder. All rights reserved.</p>
          <p className="text-xs" style={{ color: "var(--lf-mu)" }}>Built for ambitious sales teams.</p>
        </div>
      </div>
    </footer>
  );
}

/* ─── Shared primitives ───────────────────────────────────────────────────── */

function SectionLabel({ children, variant = "blue" }: { children: ReactNode; variant?: Variant }) {
  return (
    <div className="flex justify-center mb-5">
      <span className={`lf-label lf-label-${variant}`}>{children}</span>
    </div>
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-center"
      style={{ fontFamily: "'Syne', system-ui, sans-serif", fontWeight: 700,
        fontSize: "clamp(28px,4vw,44px)", color: "var(--lf-tx)", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
      {children}
    </h2>
  );
}
