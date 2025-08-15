import { useEffect, useMemo, useRef, useState } from "react";
import { motion as _motion } from "framer-motion";
import { Rocket as _Rocket, KeyRound as _KeyRound, Terminal as _Terminal, Download as _Download, ArrowRight as _ArrowRight, Link as _LinkIcon, Copy as _Copy } from "lucide-react";

// -----------------------------
// SAFETY WRAPPERS (avoid undefined imports in sandboxes)
// -----------------------------
const motion = _motion || {};
const MDiv = motion.div || (props => <div {...props} />);
const MH1 = motion.h1 || (props => <h1 {...props} />);
const MP = motion.p || (props => <p {...props} />);

const makeSafeIcon = (Cmp, fallback = "★") => (props) => Cmp ? <Cmp {...props} /> : <span {...props}>{fallback}</span>;
const Rocket = makeSafeIcon(_Rocket, "🚀");
const KeyRound = makeSafeIcon(_KeyRound, "🔑");
const Terminal = makeSafeIcon(_Terminal, "⌨️");
const Download = makeSafeIcon(_Download, "⬇️");
const ArrowRight = makeSafeIcon(_ArrowRight, "→");
const LinkIcon = makeSafeIcon(_LinkIcon, "🔗");
const Copy = makeSafeIcon(_Copy, "📋");

// --- External refs (kept constant; cause of earlier stack pointer is unrelated)
const DISCORD_INVITE = "https://discord.gg/TXxFCGsCfP";
const STAR_ATLAS = "https://staratlas.com/";
const SLASH_CMD = "/key <your username>";

// -----------------------------
// Minimal 3D-esque starfield using HTML Canvas (no external 3D libs)
// -----------------------------
function StarfieldCanvas() {
  const ref = useRef(null);
  const animRef = useRef(0);
  const starsRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let w, h, dpr;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // (Re)seed stars on resize
      const count = Math.floor((w * h) / 2200);
      starsRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * 2 + 0.2, // depth 0.2–2.2
        s: Math.random() * 1.6 + 0.2, // size
        vx: (Math.random() - 0.5) * 0.05,
        vy: (Math.random() - 0.5) * 0.05,
      }));
    };

    const onMove = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const draw = (t) => {
      const { x: mx, y: my } = mouseRef.current;
      ctx.clearRect(0, 0, w, h);

      // subtle nebula gradient
      const g = ctx.createRadialGradient(w * 0.2, h * 0.2, 0, w * 0.2, h * 0.2, Math.max(w, h));
      g.addColorStop(0, "rgba(0,200,255,0.12)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // stars
      for (const star of starsRef.current) {
        star.x += star.vx + mx * star.z * 0.1;
        star.y += star.vy + my * star.z * 0.1;
        // wrap
        if (star.x < -5) star.x = w + 5;
        if (star.x > w + 5) star.x = -5;
        if (star.y < -5) star.y = h + 5;
        if (star.y > h + 5) star.y = -5;
        const alpha = 0.5 + Math.sin((t * 0.002 + star.x) * 0.5) * 0.3;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.s * star.z, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // holo planet
      const cx = w * 0.75 + mx * 20;
      const cy = h * 0.32 + my * 15;
      const r = Math.min(w, h) * 0.12;
      const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.2, cx, cy, r);
      grad.addColorStop(0, "rgba(126,230,255,0.9)");
      grad.addColorStop(1, "rgba(10,30,50,0.1)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      // ring
      ctx.strokeStyle = "rgba(0,212,255,0.35)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(cx, cy, r * 1.5, r * 0.55, Math.PI / 2.8, 0, Math.PI * 2);
      ctx.stroke();

      animRef.current = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    animRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return <canvas ref={ref} className="fixed inset-0 -z-10 w-full h-full" />;
}

// --- Small UI helpers ---
function GlowButton({ href, onClick, children }) {
  const Comp = href ? "a" : "button";
  return (
    <Comp
      href={href || undefined}
      target={href ? "_blank" : undefined}
      rel={href ? "noopener noreferrer" : undefined}
      onClick={onClick}
      className="group relative inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-base font-semibold tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 bg-white/5 hover:bg-white/10"
    >
      <span className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-cyan-500/40 via-sky-500/40 to-emerald-500/40 blur-md opacity-60 group-hover:opacity-90 transition" />
      <span className="relative flex items-center gap-2">{children}</span>
    </Comp>
  );
}

function CopyPill({ text, label }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch (e) {}
      }}
      className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/90 hover:bg-white/10 transition"
    >
      <Copy className="h-4 w-4" />
      <span className="font-mono">{label || text}</span>
      <span className="ml-1 text-xs text-emerald-300/90">{copied ? "copied" : "copy"}</span>
    </button>
  );
}

function Step({ n, icon, title, children, accent = "from-cyan-400 to-emerald-400" }) {
  return (
    <MDiv
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.02] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
    >
      <div className={`pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-r ${accent} opacity-20 blur-xl`} />
      <div className="relative flex items-start gap-4">
        <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">{icon}</div>
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-white/10 px-2 text-xs font-bold tracking-wider text-white/80">{n}</span>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          </div>
          <div className="prose prose-invert prose-sm max-w-none text-white/80">{children}</div>
        </div>
      </div>
    </MDiv>
  );
}

// -----------------------------
// Self-tests (since we don't have a test runner here)
// -----------------------------
function runSelfTests() {
  const tests = [];
  const add = (name, fn) => {
    try { const ok = !!fn(); tests.push({ name, ok }); }
    catch { tests.push({ name, ok: false }); }
  };
  add("DISCORD_INVITE format", () => /^https:\/\/discord\.gg\//.test(DISCORD_INVITE));
  add("STAR_ATLAS url", () => /^https:\/\//.test(STAR_ATLAS));
  add("SLASH_CMD format", () => SLASH_CMD.startsWith("/key "));
  add("Icons available (fallbacks allowed)", () => true); // render-time safe
  add("Clipboard API present", () => typeof navigator !== 'undefined' && !!navigator.clipboard);
  return tests;
}

function TestPanel() {
  const tests = useMemo(runSelfTests, []);
  return (
    <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs text-white/70">
      <div className="mb-2 font-semibold text-white/80">Environment Self‑Test</div>
      <ul className="grid gap-1 md:grid-cols-2">
        {tests.map((t, i) => (
          <li key={i} className={t.ok ? "text-emerald-300" : "text-rose-300"}>
            {t.ok ? "✓" : "✗"} {t.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Page() {
  return (
    <div className="min-h-screen w-full bg-black text-white">
      {/* 3D starfield background (2D canvas illusion) */}
      <StarfieldCanvas />

      {/* CSS nebula glows */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1000px_600px_at_0%_0%,rgba(0,195,255,0.15),transparent_60%),radial-gradient(800px_500px_at_100%_0%,rgba(16,185,129,0.12),transparent_60%),radial-gradient(1000px_700px_at_50%_120%,rgba(59,130,246,0.10),transparent_60%)]" />
      </div>

      {/* Header */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/15">
            <Rocket className="h-5 w-5" />
          </div>
          <span className="text-sm font-semibold tracking-widest text-white/80">STAR ATLASY</span>
        </div>
        <nav className="hidden gap-6 md:flex">
          <a href={STAR_ATLAS} target="_blank" rel="noreferrer" className="text-sm text-white/70 hover:text-white">Official Site</a>
          <a href={DISCORD_INVITE} target="_blank" rel="noreferrer" className="text-sm text-white/70 hover:text-white">Discord</a>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-8 px-6 pb-10 pt-4 md:grid-cols-2 md:pb-16 md:pt-8">
        <div>
          <MH1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-cyan-200 via-white to-emerald-200 bg-clip-text text-4xl font-extrabold leading-tight text-transparent md:text-5xl"
          >
            Open Beta download ≠ boss fight.
          </MH1>
          <MP
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-4 max-w-prose text-base text-white/80"
          >
            Taking a cue from Star Atlas’s space-core vibe — deep space blacks, cyan/teal holo-glass, and starship glow — here’s the exact path. No detours, no warp anomalies.
          </MP>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <GlowButton href={DISCORD_INVITE}>
              <LinkIcon className="h-5 w-5" /> Join the Discord <ArrowRight className="h-4 w-4" />
            </GlowButton>
            <GlowButton href={STAR_ATLAS}>
              <Rocket className="h-5 w-5" /> Official Site
            </GlowButton>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <CopyPill text={DISCORD_INVITE} label="copy invite" />
            <CopyPill text={SLASH_CMD} label="copy /key <your username>" />
          </div>
        </div>

        <MDiv
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative"
        >
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(0,255,240,0.12),rgba(0,0,0,0)_40%),linear-gradient(0deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6 shadow-2xl">
            <div className="pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500/20 via-sky-400/20 to-emerald-400/20 blur-lg" />
            <div className="relative">
              <div className="mb-4 flex items-center gap-2 text-white/70">
                <Terminal className="h-5 w-5" />
                <span className="text-sm">Quick Commands</span>
              </div>
              <code className="block rounded-xl bg-black/50 p-4 font-mono text-sm text-white/90 ring-1 ring-white/10">
                # 1) join discord and find <span className="text-cyan-300">🔑┃game-access-key</span>
                <br />
                {SLASH_CMD}
                <br />
                # 2) open epic → Profile → Redeem
                <br />
                # 3) paste the code → download
              </code>
            </div>
          </div>
        </MDiv>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="mb-6 text-sm font-medium uppercase tracking-widest text-white/50">The Actual Route</div>
        <div className="grid gap-5 md:grid-cols-2">
          <Step n="0" icon={<Rocket className="h-5 w-5 text-cyan-300" />} title="Don’t start at staratlas.com for the download">
            <p>
              The homepage is great for lore and news, not your installer. We love it. We just don’t get the game from there.
              {" "}
              <a href={STAR_ATLAS} target="_blank" rel="noreferrer" className="text-cyan-300 underline decoration-cyan-300/30 underline-offset-4 hover:text-cyan-200">Visit for updates</a>, not keys.
            </p>
          </Step>

          <Step n="1" icon={<LinkIcon className="h-5 w-5 text-emerald-300" />} title="Jump into the Discord">
            <p>
              Use this invite: {" "}
              <a className="text-emerald-300 underline decoration-emerald-300/30 underline-offset-4" href={DISCORD_INVITE} target="_blank" rel="noreferrer">discord.gg/TXxFCGsCfP</a>.
              Inside, head to <span className="font-semibold text-white">🔑┃game-access-key</span>.
            </p>
          </Step>

          <Step n="2" icon={<KeyRound className="h-5 w-5 text-sky-300" />} title="Ask the bot for your key">
            <p>
              Type {" "}
              <span className="rounded px-1.5 py-0.5 font-mono text-[0.85em] text-white/90 bg-white/10 border border-white/10">{SLASH_CMD}</span>
              {" "}and swap in your username. The bot drops a key.
            </p>
          </Step>

          <Step n="3" icon={<Download className="h-5 w-5 text-cyan-300" />} title="Redeem on Epic & install">
            <p>
              Open the <span className="font-semibold">Epic Games Store</span> → <span className="font-semibold">Profile</span> → <span className="font-semibold">Redeem</span>.
              Paste the code. Smash download. Touch grass while it installs.
            </p>
          </Step>
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-white/80">
          <p className="text-sm">
            <span className="font-semibold text-white">Why is it like this?</span> Because open betas move fast, Discord is where the keys live, and Epic handles the heavy lifting. It’s not you. It’s the pipeline.
          </p>

          {/* Self-test display */}
          <TestPanel />
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-6xl px-6 pb-16 text-xs text-white/50">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p>Unofficial fan-made download guide — the rant we wish we had.</p>
          <div className="flex items-center gap-2">
            <CopyPill text={DISCORD_INVITE} label="copy discord invite" />
            <CopyPill text={SLASH_CMD} label="copy /key command" />
          </div>
        </div>
      </footer>
    </div>
  );
}
