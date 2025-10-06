/**
GeniusSwarmShowcase.jsx
Single-file React demo. Tailwind CSS assumed.
Drop this file into any React + Tailwind app (or Vite) and open.

What it is, succinctly:
- A compact micro-agent playground that simulates six expert roles.
- Type or paste any brief idea and run agents to see staged outputs.
- Includes a one-click "Genius Remix" that produces a shareable, high-signal artifact.

License: MIT. Fill README and expand agents as you like.
*/

import React, { useState } from "react";

// --- lightweight role implementations (deterministic, explainable) ---
const sanitize = (s) => s.trim().replace(/\s+/g, " ");

const Promptor = (input) => {
  const base = sanitize(input);
  if (!base) return "Provide a short idea to start.";
  return `${base} — short concise brief, target audience: early adopters, 1-line value prop.`;
};

const Orchestrator = (input) => {
  const p = sanitize(input);
  const steps = [
    `Clarify: extract main goal from '${p.split(" ").slice(0,6).join(" ") + (p.length>40?"...":"")}'`,
    "Design minimal UX: single flow, 3 actions",
    "Deliverables: README, demo, 1 test, 1 screenshot"
  ];
  return steps.join("\n");
};

const Coder = (input) => {
  const n = sanitize(input).toLowerCase();
  if (!n) return "No idea to code.";
  const fileName = n.split(/\W+/).slice(0,3).join("-") || "demo";
  const snippet = `// ${fileName}.js\nexport default function ${fileName.replace(/-/g, "_") }(){ return 'hello from ${fileName}'; }`;
  return snippet;
};

const Reviewer = (input) => {
  const s = sanitize(input);
  if (!s) return "Nothing to review.";
  const bullets = [];
  if (s.length < 40) bullets.push("Expand the narrative with 1 user story.");
  if (!/[A-Z]/.test(s)) bullets.push("Add a capitalized headline.");
  bullets.push("Remove jargon; prefer outcomes.");
  return bullets.join("\n");
};

const FactChecker = (input) => {
  const s = sanitize(input);
  if (!s) return "Nothing to check.";
  const flags = [];
  if (s.match(/all|always|never/gi)) flags.push("Vague absolutes detected: 'all/always/never'. Consider softening.");
  if (s.match(/blockchain|ai|crypto/gi)) flags.push("Buzzword present: add concrete metric or user scenario.");
  return flags.length ? flags.join("\n") : "No obvious factual red flags.";
};

const Assessor = (input) => {
  const s = sanitize(input);
  if (!s) return {score:0, note:"Empty"};
  const lenFactor = Math.min(1, s.length / 120);
  const clarity = /\w+\s+\w+/.test(s) ? 0.6 : 0.3;
  const score = Math.round((0.5 * lenFactor + 0.5 * clarity) * 100);
  return { score, note: score>70 ? "Ready for demo" : "Needs iteration" };
};

// surprise generator: compact viral-ready artifact
const GeniusRemix = (input) => {
  const s = sanitize(input);
  const oneLiner = s
    ? `${s.split(" ").slice(0,6).join(" ")}${s.split(" ").length>6?"...":""}`
    : "A tiny idea that scales.";
  const blurb = `${oneLiner}\n\nWhy it matters: Converts friction into action.\nTry it: clone, run, iterate.`;
  const commit = `feat: prototype ${oneLiner.replace(/\W+/g, "-").toLowerCase()}`;
  const tweet = `${oneLiner} — demo + repo in bio. #buildinpublic`;
  return { blurb, commit, tweet };
};

export default function GeniusSwarmShowcase(){
  const [input, setInput] = useState("");
  const [out, setOut] = useState("");
  const [history, setHistory] = useState([]);

  const run = (role) => {
    const mapping = { Promptor, Orchestrator, Coder, Reviewer, FactChecker };
    const fn = mapping[role];
    if (!fn) return;
    const result = fn(input);
    setOut(result);
    setHistory(h => [{role, input, result, time: Date.now()} , ...h].slice(0,20));
  };

  const runAssess = () => {
    const a = Assessor(input);
    const r = `Score: ${a.score}\n${a.note}`;
    setOut(r);
    setHistory(h => [{role:"Assessor", input, result:r, time:Date.now()}, ...h].slice(0,20));
  };

  const remix = () => {
    const r = GeniusRemix(input);
    const combined = `--- Genius Remix ---\n${r.blurb}\n\nCommit: ${r.commit}\nTweet: ${r.tweet}`;
    setOut(combined);
    setHistory(h => [{role:"GeniusRemix", input, result:combined, time:Date.now()}, ...h].slice(0,20));
  };

  const copy = async (t) => {
    try{ await navigator.clipboard.writeText(t); }catch(e){}
  };

  return (
    <div className="p-6 max-w-4xl mx-auto font-sans">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Genius Swarm Showcase</h1>
        <p className="text-sm text-slate-500 mt-1">Micro-agent playground. Paste an idea. Run a role. Hit Genius Remix.</p>
      </header>

      <main className="grid gap-4 md:grid-cols-3">
        <section className="md:col-span-2">
          <textarea
            value={input}
            onChange={e=>setInput(e.target.value)}
            placeholder="Type a short idea, e.g. 'email that schedules meetings without back-and-forth'"
            className="w-full h-40 p-3 rounded-lg border bg-white text-sm"
          />

          <div className="flex gap-2 mt-3 flex-wrap">
            {['Promptor','Orchestrator','Coder','Reviewer','FactChecker'].map(r=> (
              <button key={r} onClick={()=>run(r)} className="px-3 py-2 rounded bg-slate-800 text-white text-sm">{r}</button>
            ))}
            <button onClick={runAssess} className="px-3 py-2 rounded bg-amber-600 text-white text-sm">Assessor</button>
            <button onClick={remix} className="px-3 py-2 rounded bg-indigo-600 text-white text-sm">Genius Remix</button>
          </div>

          <div className="mt-4">
            <label className="text-xs text-slate-600">Output</label>
            <pre className="bg-slate-900 text-slate-50 p-3 rounded-lg text-sm whitespace-pre-wrap max-h-72 overflow-auto">{out}</pre>
            <div className="flex gap-2 mt-2">
              <button onClick={()=>copy(out)} className="px-3 py-2 rounded bg-slate-700 text-white text-sm">Copy</button>
              <button onClick={()=>{ setInput(''); setOut(''); }} className="px-3 py-2 rounded bg-red-600 text-white text-sm">Clear</button>
            </div>
          </div>
        </section>

        <aside className="p-3 border rounded-lg bg-white">
          <h3 className="font-medium">History</h3>
          <div className="mt-2 text-xs text-slate-600 space-y-2 max-h-72 overflow-auto">
            {history.length===0 && <div className="text-slate-400">No runs yet.</div>}
            {history.map((h) => (
              <div key={h.time} className="p-2 rounded border bg-slate-50">
                <div className="text-[11px] text-slate-700 font-semibold">{h.role}</div>
                <div className="text-[11px] text-slate-500 mt-1">{new Date(h.time).toLocaleString()}</div>
                <div className="mt-2 text-[12px] text-slate-800 whitespace-pre-wrap">{h.result}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-xs text-slate-500">
            Tip: Use "Genius Remix" to generate the short blurb and a ready-to-use commit message.
          </div>
        </aside>
      </main>

      <footer className="mt-6 text-xs text-slate-500">
        Small, local, deterministic. Replace mock functions with API calls to scale. MIT.
      </footer>
    </div>
  );
}
