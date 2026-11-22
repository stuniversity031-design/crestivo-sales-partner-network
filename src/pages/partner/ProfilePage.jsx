import React, { useState, useEffect } from "react";
import { Save, RotateCcw } from "lucide-react";
import { useStore } from "../../state/store.jsx";
import { PageHead, Panel, Field, Empty, StatusPill } from "../../components/ui.jsx";
import { fmtDate } from "../../lib/calc.js";

const NOTIFY = [
  ["newLead", "Lead status changes"],
  ["commission", "Commission approved"],
  ["payout", "Weekly payout summary"],
  ["announce", "Program announcements"]
];

export default function ProfilePage() {
  const { session, partners, updatePartner, toast } = useStore();
  const me = partners.find((p) => p.id === session.partnerId);
  const [d, setD] = useState(me);
  const [errors, setErrors] = useState({});

  useEffect(() => { setD(me); setErrors({}); }, [session.partnerId]);

  if (!me || !d) return <Empty title="No partner selected" />;

  const notify = { newLead: true, commission: true, payout: true, announce: false, ...(d.notify || {}) };
  const payout = { method: "Bank transfer (demo)", account: "Demo account ending 0000", ...(d.payout || {}) };

  const save = () => {
    const e = {};
    if (!String(d.name || "").trim()) e.name = "Required";
    if (!/^\S+@\S+\.\S+$/.test(d.email || "")) e.email = "Enter a valid email";
    if (!String(d.company || "").trim()) e.company = "Required";
    setErrors(e);
    if (Object.keys(e).length) return toast("Fix the highlighted fields", "bad");
    updatePartner({ ...d, notify, payout });
    toast("Profile saved");
  };

  return (
    <>
      <PageHead
        eyebrow="ACCOUNT"
        title="Profile"
        sub="Demonstration account. Payout details below are not real."
        actions={
          <>
            <button className="btn" onClick={() => { setD(me); setErrors({}); }}><RotateCcw size={15} /> Discard</button>
            <button className="btn primary" onClick={save}><Save size={15} /> Save profile</button>
          </>
        }
      />

      <div className="grid2">
        <Panel title="Personal and business">
          <Field label="Full name" error={errors.name}><input value={d.name || ""} onChange={(e) => setD({ ...d, name: e.target.value })} /></Field>
          <Field label="Business name" error={errors.company}><input value={d.company || ""} onChange={(e) => setD({ ...d, company: e.target.value })} /></Field>
          <Field label="Email" error={errors.email}><input value={d.email || ""} onChange={(e) => setD({ ...d, email: e.target.value })} /></Field>
          <Field label="Phone"><input value={d.phone || ""} onChange={(e) => setD({ ...d, phone: e.target.value })} /></Field>
        </Panel>

        <Panel title="Referral identity">
          <p className="muted">Partner ID</p>
          <h3>{me.id}</h3>
          <p className="muted">Referral code</p>
          <h3>{me.code}</h3>
          <p className="muted">Member since</p>
          <p>{fmtDate(me.joined)}</p>
          <p><StatusPill status={me.status} /></p>
        </Panel>

        <Panel title="Notification preferences" sub="Delivered in-app only (simulated)">
          {NOTIFY.map(([k, label]) => (
            <label key={k} className="row" style={{ marginBottom: 8 }}>
              <input type="checkbox" checked={!!notify[k]} onChange={(e) => setD({ ...d, notify: { ...notify, [k]: e.target.checked } })} />
              {label}
            </label>
          ))}
        </Panel>

        <Panel title="Demonstration payout profile" sub="No real money is transferred">
          <Field label="Payout method">
            <select value={payout.method} onChange={(e) => setD({ ...d, payout: { ...payout, method: e.target.value } })}>
              <option>Bank transfer (demo)</option>
              <option>PayPal (demo)</option>
              <option>Check (demo)</option>
            </select>
          </Field>
          <Field label="Account label">
            <input value={payout.account} onChange={(e) => setD({ ...d, payout: { ...payout, account: e.target.value } })} />
          </Field>
          <p className="muted">Do not enter real banking details in this prototype.</p>
        </Panel>
      </div>
    </>
  );
}
