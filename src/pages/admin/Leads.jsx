import React, { useMemo, useState } from "react";
import { Plus, Download, Trash2, ArrowUpDown, AlertTriangle } from "lucide-react";
import { useStore } from "../../state/store.jsx";
import { PageHead, Panel, Modal, Field, StatusPill, Empty, Confirm } from "../../components/ui.jsx";
import { money, fmtDate, exportCSV, todayISO } from "../../lib/calc.js";
import { STAGES } from "../../data/seed.js";

export default function Leads() {
  const { leads, partners, services, session, addLead, updateLead, moveLead, deleteLeads, toast } = useStore();
  const isAdmin = session.role === "admin";
  const [q, setQ] = useState("");
  const [stage, setStage] = useState("all");
  const [sort, setSort] = useState({ key: "created", dir: -1 });
  const [sel, setSel] = useState([]);
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [dup, setDup] = useState(null);
  const [confirm, setConfirm] = useState(false);

  const pName = (id) => partners.find((p) => p.id === id)?.name || "Unassigned";
  const sName = (id) => services.find((s) => s.id === id)?.name || "—";

  const rows = useMemo(() => {
    return leads
      .filter((l) => isAdmin || l.partnerId === session.partnerId)
      .filter((l) => stage === "all" || l.stage === stage)
      .filter((l) => (l.name + l.contact + l.email + l.id).toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => {
        const x = a[sort.key], y = b[sort.key];
        return (typeof x === "number" ? x - y : String(x).localeCompare(String(y))) * sort.dir;
      });
  }, [leads, q, stage, sort, isAdmin, session.partnerId]);

  const th = (key, label) => (
    <th style={{ cursor: "pointer" }} onClick={() => setSort({ key, dir: sort.key === key ? -sort.dir : 1 })}>{label} <ArrowUpDown size={10} /></th>
  );

  const blank = () => ({ name: "", contact: "", email: "", partnerId: isAdmin ? partners[0]?.id : session.partnerId, serviceId: services[0]?.id, value: services[0]?.price || 0, followUp: "", notes: "" });

  const validate = (f) => {
    const e = {};
    if (!f.name.trim()) e.name = "Business name required";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Valid email required";
    if (!(Number(f.value) > 0)) e.value = "Value must be greater than 0";
    return e;
  };

  const save = (force) => {
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length) return;
    if (!form.id && !force) {
      const d = leads.find((l) => l.email.toLowerCase() === form.email.toLowerCase());
      if (d) { setDup(d); return; }
    }
    const payload = { ...form, value: Number(form.value) };
    if (form.id) { updateLead(payload); toast("Lead updated"); }
    else { addLead(payload); toast("Lead submitted"); }
    setForm(null); setDup(null);
  };

  const toggle = (id) => setSel(sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]);
  const allSel = rows.length > 0 && rows.every((r) => sel.includes(r.id));

  return (
    <>
      <PageHead eyebrow={isAdmin ? "NETWORK" : "SELL"} title={isAdmin ? "Leads" : "My Leads"} sub="Directory, attribution and qualification."
        actions={<>
          <button className="btn" onClick={() => exportCSV("leads.csv", rows.map((r) => ({ id: r.id, business: r.name, contact: r.contact, email: r.email, partner: pName(r.partnerId), service: sName(r.serviceId), value: r.value, stage: r.stage })))}><Download size={15} /> Export</button>
          <button className="btn primary" onClick={() => { setForm(blank()); setErrors({}); }}><Plus size={15} /> {isAdmin ? "New lead" : "Submit lead"}</button>
        </>} />

      <div className="toolbar">
        <input placeholder="Search leads…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={stage} onChange={(e) => setStage(e.target.value)}>
          <option value="all">All stages</option>{STAGES.map((s) => <option key={s}>{s}</option>)}
        </select>
        {isAdmin && sel.length > 0 && <button className="btn danger" onClick={() => setConfirm(true)}><Trash2 size={15} /> Delete {sel.length}</button>}
      </div>

      <Panel pad={false}>
        {rows.length === 0 ? <Empty title="No leads found" body="Submit a lead or adjust filters." /> : (
          <div className="scrollx">
            <table className="tbl">
              <thead><tr>
                {isAdmin && <th><input type="checkbox" style={{ width: "auto" }} checked={allSel} onChange={() => setSel(allSel ? [] : rows.map((r) => r.id))} /></th>}
                {th("name", "Business")}{isAdmin && th("partnerId", "Partner")}<th>Service</th>{th("value", "Value")}{th("stage", "Stage")}{th("followUp", "Follow-up")}<th></th>
              </tr></thead>
              <tbody>
                {rows.map((l) => (
                  <tr key={l.id}>
                    {isAdmin && <td><input type="checkbox" style={{ width: "auto" }} checked={sel.includes(l.id)} onChange={() => toggle(l.id)} /></td>}
                    <td><b>{l.name}</b><small>{l.contact} · {l.id}</small></td>
                    {isAdmin && <td>{pName(l.partnerId)}</td>}
                    <td>{sName(l.serviceId)}</td>
                    <td>{money(l.value)}</td>
                    <td>
                      {isAdmin ? (
                        <select style={{ width: 140 }} value={l.stage} onChange={(e) => { moveLead(l.id, e.target.value); toast(`Moved to ${e.target.value}`); }}>
                          {STAGES.map((s) => <option key={s}>{s}</option>)}
                        </select>
                      ) : <StatusPill status={l.stage} />}
                    </td>
                    <td>{fmtDate(l.followUp)}</td>
                    <td><button className="btn sm ghost" onClick={() => { setForm({ ...l }); setErrors({}); }}>{isAdmin ? "Edit" : "View"}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {form && (
        <Modal title={form.id ? "Lead profile" : "New lead"} onClose={() => { setForm(null); setDup(null); }} wide>
          {dup && (
            <div className="surface" style={{ padding: 14, marginBottom: 16, borderColor: "var(--warn)" }}>
              <div className="row"><AlertTriangle size={16} color="#d9a441" /><b>Possible duplicate</b></div>
              <p className="dim" style={{ margin: "6px 0 10px" }}>{dup.name} ({dup.email}) already exists, attributed to {pName(dup.partnerId)}.</p>
              <div className="row"><button className="btn sm" onClick={() => setDup(null)}>Edit</button><button className="btn sm primary" onClick={() => save(true)}>Submit anyway</button></div>
            </div>
          )}
          <div className="grid2" style={{ marginBottom: 0 }}>
            <Field label="Business name" error={errors.name}><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Contact person"><input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} /></Field>
            <Field label="Email" error={errors.email}><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            {isAdmin && <Field label="Assigned partner"><select value={form.partnerId} onChange={(e) => setForm({ ...form, partnerId: e.target.value })}>{partners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>}
            <Field label="Service"><select value={form.serviceId} onChange={(e) => { const s = services.find((x) => x.id === e.target.value); setForm({ ...form, serviceId: e.target.value, value: s?.price || form.value }); }}>{services.filter((s) => s.status === "published").map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
            <Field label="Opportunity value ($)" error={errors.value}><input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /></Field>
            <Field label="Follow-up date"><input type="date" value={form.followUp} onChange={(e) => setForm({ ...form, followUp: e.target.value })} /></Field>
          </div>
          <Field label="Internal notes"><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
          <div className="row end"><button className="btn" onClick={() => { setForm(null); setDup(null); }}>Cancel</button><button className="btn primary" onClick={() => save(false)}>Save</button></div>
        </Modal>
      )}

      {confirm && <Confirm title="Delete leads" body={`Delete ${sel.length} selected lead(s)? This cannot be undone.`} confirmLabel="Delete" danger
        onConfirm={() => { deleteLeads(sel); setSel([]); toast("Leads deleted"); }} onClose={() => setConfirm(false)} />}
    </>
  );
}
