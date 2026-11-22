import React, { useState } from "react";
import { Save, Upload, RotateCcw } from "lucide-react";
import { useStore } from "../../state/store.jsx";
import { PageHead, Panel, Field, Confirm } from "../../components/ui.jsx";
import { money, fmtDate } from "../../lib/calc.js";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function Settings() {
  const { settings, published, revisions, saveDraft, publishSettings, restoreRevision, toast } = useStore();
  const [d, setD] = useState(settings);
  const [errors, setErrors] = useState({});
  const [confirm, setConfirm] = useState(false);

  const set = (k, v) => setD({ ...d, [k]: v });

  const validate = () => {
    const e = {};
    const one = Number(d.oneTimeRate), rec = Number(d.recurringRate), win = Number(d.refundWindowDays);
    if (d.oneTimeRate === "" || isNaN(one) || one < 0 || one > 100) e.oneTimeRate = "Enter 0 to 100";
    if (d.recurringRate === "" || isNaN(rec) || rec < 0 || rec > 100) e.recurringRate = "Enter 0 to 100";
    if (isNaN(win) || win < 0 || win > 90) e.refundWindowDays = "Enter 0 to 90";
    if (!String(d.brand).trim()) e.brand = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const clean = () => ({
    ...d,
    oneTimeRate: Number(d.oneTimeRate),
    recurringRate: Number(d.recurringRate),
    refundWindowDays: Number(d.refundWindowDays)
  });

  const save = () => {
    if (!validate()) return toast("Fix the highlighted fields", "bad");
    saveDraft(clean());
    toast("Draft saved");
  };

  const publish = () => {
    publishSettings(clean());
    toast("Published");
  };

  const dirty = JSON.stringify(clean()) !== JSON.stringify(published);
  const sample = 3000;

  return (
    <>
      <PageHead
        eyebrow="CONTENT"
        title="Settings"
        sub="Commission rules and payout schedule. Changes recalculate every commission in the app."
        actions={
          <>
            <button className="btn" onClick={() => setD(settings)}><RotateCcw size={15} /> Discard</button>
            <button className="btn" onClick={save}><Save size={15} /> Save draft</button>
            <button className="btn primary" onClick={() => { if (validate()) setConfirm(true); }}><Upload size={15} /> Publish</button>
          </>
        }
      />

      <div className="grid2">
        <Panel title="Commission rules" sub={dirty ? "Unpublished changes" : "Published"}>
          <Field label="One-time services commission (%)" error={errors.oneTimeRate}>
            <input type="number" min="0" max="100" value={d.oneTimeRate} onChange={(e) => set("oneTimeRate", e.target.value)} />
          </Field>
          <Field label="Monthly / recurring commission (%)" error={errors.recurringRate}>
            <input type="number" min="0" max="100" value={d.recurringRate} onChange={(e) => set("recurringRate", e.target.value)} />
          </Field>
          <Field label="Payout day (weekly)">
            <select value={d.payoutDay} onChange={(e) => set("payoutDay", e.target.value)}>
              {DAYS.map((x) => <option key={x}>{x}</option>)}
            </select>
          </Field>
          <Field label="Refund window (days)" error={errors.refundWindowDays}>
            <input type="number" min="0" max="90" value={d.refundWindowDays} onChange={(e) => set("refundWindowDays", e.target.value)} />
          </Field>
          <Field label="Brand name" error={errors.brand}>
            <input value={d.brand} onChange={(e) => set("brand", e.target.value)} />
          </Field>
        </Panel>

        <Panel title="Live calculation" sub="Example sale">
          <p className="dim">{money(sample)} one-time service</p>
          <h2>{money(sample * (Number(d.oneTimeRate) || 0) / 100)}</h2>
          <p className="muted">at {Number(d.oneTimeRate) || 0}%</p>
          <hr />
          <p className="dim">{money(250)} monthly service</p>
          <h2>{money(250 * (Number(d.recurringRate) || 0) / 100)}</h2>
          <p className="muted">at {Number(d.recurringRate) || 0}% per month</p>
          <hr />
          <p className="muted">Paid every {d.payoutDay}, after a {Number(d.refundWindowDays) || 0}-day refund window.</p>
        </Panel>
      </div>

      <Panel title="Revision history" sub="Previous published versions" pad={false}>
        {revisions.length === 0 ? (
          <p className="muted" style={{ padding: 20 }}>No revisions yet. They appear after you publish.</p>
        ) : (
          <table>
            <thead><tr><th>Date</th><th>One-time</th><th>Recurring</th><th>Payout</th><th></th></tr></thead>
            <tbody>
              {revisions.map((r) => (
                <tr key={r.id}>
                  <td>{fmtDate(r.date.slice(0, 10))}</td>
                  <td>{r.snapshot.oneTimeRate}%</td>
                  <td>{r.snapshot.recurringRate}%</td>
                  <td>{r.snapshot.payoutDay}</td>
                  <td>
                    <button className="btn sm" onClick={() => { restoreRevision(r.id); setD(r.snapshot); toast("Revision restored"); }}>
                      Restore
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      {confirm && (
        <Confirm
          title="Publish settings"
          body={`One-time ${d.oneTimeRate}%, recurring ${d.recurringRate}%. All commissions will recalculate immediately.`}
          confirmLabel="Publish"
          onConfirm={publish}
          onClose={() => setConfirm(false)}
        />
      )}
    </>
  );
}
