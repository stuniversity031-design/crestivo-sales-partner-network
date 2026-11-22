import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Search } from "lucide-react";
import { useStore } from "../state/store.jsx";
import { PageHead, Panel, Field, StatusPill, Empty } from "../components/ui.jsx";
import { money, fmtDate } from "../lib/calc.js";

const BUDGETS = ["Under $1,000", "$1,000 - $3,000", "$3,000 - $7,500", "$7,500 - $15,000", "$15,000+"];
const CLIENT_STATUS = {
  New: "Received",
  "Under Review": "In review",
  Qualified: "Qualified",
  Contacted: "We have reached out",
  Proposal: "Proposal sent",
  Negotiation: "Finalizing scope",
  Won: "Project confirmed",
  Lost: "Closed"
};
const STEPS = ["Service", "Project", "Contact", "Review"];

export default function Client() {
  const { services, partners, leads, addLead, toast } = useStore();
  const published = services.filter((s) => s.status === "published");

  const urlRef = new URLSearchParams(window.location.search).get("ref");
  const [ref, setRef] = useState(urlRef || "");
  const partner = partners.find((p) => p.code === ref && p.status === "active");

  const [step, setStep] = useState(0);
  const [f, setF] = useState({ serviceId: "", budget: "", description: "", business: "", contact: "", email: "", phone: "" });
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(null);
  const [lookup, setLookup] = useState("");
  const [looked, setLooked] = useState(null);

  const svc = services.find((s) => s.id === f.serviceId);

  const validate = () => {
    const e = {};
    if (step === 0 && !f.serviceId) e.serviceId = "Choose a service";
    if (step === 1) {
      if (!f.budget) e.budget = "Select a budget range";
      if (f.description.trim().length < 10) e.description = "Describe your project (10+ characters)";
    }
    if (step === 2) {
      if (!f.business.trim()) e.business = "Required";
      if (!f.contact.trim()) e.contact = "Required";
      if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Enter a valid email";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate()) setStep(step + 1); };

  const submit = () => {
    addLead({
      name: f.business,
      contact: f.contact,
      email: f.email,
      partnerId: partner ? partner.id : "",
      serviceId: f.serviceId,
      value: svc.price,
      followUp: "",
      notes: `Client inquiry | Budget: ${f.budget} | ${f.description}${f.phone ? " | Phone: " + f.phone : ""}`
    });
    toast("Inquiry submitted");
    setDone({ email: f.email });
  };

  const lead = done ? leads.find((l) => l.email.toLowerCase() === done.email.toLowerCase()) : null;
  const found = looked ? leads.find((l) => l.email.toLowerCase() === looked.toLowerCase() || l.id.toLowerCase() === looked.toLowerCase()) : null;

  const reset = () => { setDone(null); setStep(0); setF({ serviceId: "", budget: "", description: "", business: "", contact: "", email: "", phone: "" }); };

  return (
    <>
      <PageHead eyebrow="CLIENT EXPERIENCE" title="Start a project" sub="Tell us what you need. We respond within one business day." />

      <Panel title="Demo: arrive through a referral" sub="Simulates opening a partner's referral link">
        <div className="row">
          <select value={ref} onChange={(e) => setRef(e.target.value)}>
            <option value="">Direct visit (no partner)</option>
            {partners.filter((p) => p.status === "active").map((p) => <option key={p.id} value={p.code}>{p.code}</option>)}
          </select>
          <span className="muted">{partner ? `Attribution active: ${partner.code}` : "No attribution"}</span>
        </div>
      </Panel>

      {!done ? (
        <Panel title={`Step ${step + 1} of ${STEPS.length}: ${STEPS[step]}`}>
          <div className="row" style={{ marginBottom: 16 }}>
            {STEPS.map((s, i) => <span key={s} className={"pill " + (i <= step ? "gold" : "info")}>{i + 1}. {s}</span>)}
          </div>

          {step === 0 && (
            <>
              {errors.serviceId && <p className="err">{errors.serviceId}</p>}
              {published.length === 0 ? <Empty title="No services available" /> : (
                <div className="grid2">
                  {published.map((s) => (
                    <button key={s.id} className={"surface" + (f.serviceId === s.id ? " raised" : "")} style={{ textAlign: "left", padding: 16, border: f.serviceId === s.id ? "1px solid var(--gold, #c9a96a)" : undefined }}
                      onClick={() => setF({ ...f, serviceId: s.id })}>
                      <b>{s.name}</b>
                      <p className="dim">{s.description}</p>
                      <small className="muted">From {money(s.price)}{s.billing === "monthly" ? "/mo" : ""}</small>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {step === 1 && (
            <>
              <Field label="Budget range" error={errors.budget}>
                <select value={f.budget} onChange={(e) => setF({ ...f, budget: e.target.value })}>
                  <option value="">Select…</option>
                  {BUDGETS.map((b) => <option key={b}>{b}</option>)}
                </select>
              </Field>
              <Field label="Project description" error={errors.description}>
                <textarea rows={4} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
              </Field>
            </>
          )}

          {step === 2 && (
            <>
              <Field label="Business name" error={errors.business}><input value={f.business} onChange={(e) => setF({ ...f, business: e.target.value })} /></Field>
              <Field label="Your name" error={errors.contact}><input value={f.contact} onChange={(e) => setF({ ...f, contact: e.target.value })} /></Field>
              <Field label="Email" error={errors.email}><input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
              <Field label="Phone (optional)"><input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
            </>
          )}

          {step === 3 && (
            <div>
              <p><b>Service:</b> {svc?.name}</p>
              <p><b>Budget:</b> {f.budget}</p>
              <p><b>Project:</b> {f.description}</p>
              <p><b>Business:</b> {f.business}</p>
              <p><b>Contact:</b> {f.contact}, {f.email}{f.phone ? `, ${f.phone}` : ""}</p>
            </div>
          )}

          <div className="row end" style={{ marginTop: 16 }}>
            {step > 0 && <button className="btn" onClick={() => setStep(step - 1)}><ArrowLeft size={15} /> Back</button>}
            {step < 3
              ? <button className="btn primary" onClick={next}>Continue <ArrowRight size={15} /></button>
              : <button className="btn primary" onClick={submit}><Check size={15} /> Submit inquiry</button>}
          </div>
        </Panel>
      ) : (
        <Panel title="Inquiry received" sub="Demonstration only. No email is actually sent.">
          <h2>Thank you, {f.contact}.</h2>
          {lead && <p className="dim">Reference: <b>{lead.id}</b></p>}
          <p>Current status: <b>{lead ? CLIENT_STATUS[lead.stage] : "Received"}</b></p>
          <p className="muted">Bookmark your reference to check progress below.</p>
          <button className="btn" onClick={reset}>Submit another inquiry</button>
        </Panel>
      )}

      <Panel title="Check inquiry status" sub="Enter your reference or email">
        <div className="row">
          <input placeholder="L-123456 or you@email.com" value={lookup} onChange={(e) => setLookup(e.target.value)} style={{ flex: 1 }} />
          <button className="btn" onClick={() => setLooked(lookup.trim())}><Search size={15} /> Check</button>
        </div>
        {looked !== null && (
          found ? (
            <div style={{ marginTop: 14 }}>
              <p><b>{found.name}</b> · submitted {fmtDate(found.created)}</p>
              <p>Status: <StatusPill status={found.stage} /> {CLIENT_STATUS[found.stage]}</p>
            </div>
          ) : <p className="muted" style={{ marginTop: 14 }}>No inquiry found.</p>
        )}
      </Panel>
    </>
  );
}
