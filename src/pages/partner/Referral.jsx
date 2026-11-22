import React, { useState } from "react";
import { Copy, Send } from "lucide-react";
import { useStore } from "../../state/store.jsx";
import { PageHead, Panel, Field, StatusPill, Empty } from "../../components/ui.jsx";
import { money, fmtDate } from "../../lib/calc.js";

const BLANK = { name: "", contact: "", email: "", serviceId: "", notes: "", campaign: "" };

export default function Referral() {
  const { session, partners, leads, services, addLead, toast } = useStore();
  const me = partners.find((p) => p.id === session.partnerId);
  const published = services.filter((s) => s.status === "published");
  const [f, setF] = useState(BLANK);
  const [errors, setErrors] = useState({});

  if (!me) return <Empty title="No partner selected" />;

  const link = `${window.location.origin}/?ref=${me.code}`;
  const mine = leads.filter((l) => l.partnerId === me.id).sort((a, b) => b.created.localeCompare(a.created));

  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); toast("Copied"); }
    catch { toast("Copy failed", "bad"); }
  };

  const submit = () => {
    const e = {};
    if (!f.name.trim()) e.name = "Required";
    if (!f.contact.trim()) e.contact = "Required";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Enter a valid email";
    if (!f.serviceId) e.serviceId = "Choose a service";
    const dupe = leads.find((l) => l.email.toLowerCase() === f.email.toLowerCase());
    if (dupe) e.email = `Possible duplicate: ${dupe.name} already exists`;
    setErrors(e);
    if (Object.keys(e).length) return;
    const svc = services.find((s) => s.id === f.serviceId);
    addLead({
      name: f.name, contact: f.contact, email: f.email, partnerId: me.id,
      serviceId: svc.id, value: svc.price, followUp: "",
      notes: [f.campaign && `Campaign: ${f.campaign}`, f.notes].filter(Boolean).join(" | ")
    });
    toast("Lead submitted");
    setF(BLANK);
  };

  return (
    <>
      <PageHead eyebrow="SELL" title="Referral Center" sub="Your link, your leads, and their status. Simulated tracking." />

      <div className="grid2">
        <Panel title="Your referral identity" sub="Prototype link, local simulation only">
          <p className="muted">Referral code</p>
          <h2>{me.code}</h2>
          <div className="row">
            <input readOnly value={link} style={{ flex: 1 }} />
            <button className="btn" onClick={() => copy(link)}><Copy size={15} /> Copy link</button>
          </div>
          <div className="row" style={{ marginTop: 10 }}>
            <button className="btn sm" onClick={() => copy(me.code)}>Copy code</button>
          </div>
        </Panel>

        <Panel title="Submit a lead">
          <Field label="Business name" error={errors.name}>
            <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          </Field>
          <Field label="Contact person" error={errors.contact}>
            <input value={f.contact} onChange={(e) => setF({ ...f, contact: e.target.value })} />
          </Field>
          <Field label="Contact email" error={errors.email}>
            <input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          </Field>
          <Field label="Service interest" error={errors.serviceId}>
            <select value={f.serviceId} onChange={(e) => setF({ ...f, serviceId: e.target.value })}>
              <option value="">Select…</option>
              {published.map((s) => <option key={s.id} value={s.id}>{s.name} ({money(s.price)})</option>)}
            </select>
          </Field>
          <Field label="Campaign tag (optional)">
            <input value={f.campaign} onChange={(e) => setF({ ...f, campaign: e.target.value })} />
          </Field>
          <Field label="Notes">
            <textarea rows={2} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
          </Field>
          <button className="btn primary" onClick={submit}><Send size={15} /> Submit lead</button>
        </Panel>
      </div>

      <Panel title="Referral history" sub={`${mine.length} leads attributed to ${me.code}`} pad={false}>
        {mine.length === 0 ? <Empty title="No leads yet" body="Submit your first lead above." /> : (
          <table>
            <thead><tr><th>Submitted</th><th>Business</th><th>Contact</th><th>Service</th><th>Value</th><th>Attribution</th><th>Stage</th></tr></thead>
            <tbody>
              {mine.map((l) => (
                <tr key={l.id}>
                  <td>{fmtDate(l.created)}</td>
                  <td><b>{l.name}</b></td>
                  <td>{l.contact}</td>
                  <td>{services.find((s) => s.id === l.serviceId)?.name || "—"}</td>
                  <td>{money(l.value)}</td>
                  <td>Attributed to {me.code}</td>
                  <td><StatusPill status={l.stage} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </>
  );
}
