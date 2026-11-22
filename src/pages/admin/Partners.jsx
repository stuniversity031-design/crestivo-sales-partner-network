import React, { useMemo, useState } from "react";
import { Plus, Search, Check, X, Pause, Play, Download, ArrowUpDown } from "lucide-react";
import { useStore } from "../../state/store.jsx";
import { PageHead, Panel, Modal, Field, StatusPill, Empty, Confirm } from "../../components/ui.jsx";
import { money, totalsFor, fmtDate, exportCSV } from "../../lib/calc.js";

const BLANK = { name: "", email: "", company: "", phone: "", status: "active" };

export default function Partners() {
  const { partners, leads, sales, services, settings, addPartner, updatePartner, setPartnerStatus, toast } = useStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState({ key: "name", dir: 1 });
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [view, setView] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const rows = useMemo(() => {
    const list = partners
      .filter((p) => status === "all" || p.status === status)
      .filter((p) => (p.name + p.email + p.company + p.id).toLowerCase().includes(q.toLowerCase()))
      .map((p) => {
        const ps = sales.filter((s) => s.partnerId === p.id);
        const t = totalsFor(ps, settings, services);
        const pl = leads.filter((l) => l.partnerId === p.id);
        const won = pl.filter((l) => l.stage === "Won").length;
        const closed = pl.filter((l) => ["Won", "Lost"].includes(l.stage)).length;
        return { ...p, leadCount: pl.length, revenue: t.gross, commission: t.total, conv: closed ? Math.round((won / closed) * 100) : 0 };
      });
    return list.sort((a, b) => {
      const x = a[sort.key], y = b[sort.key];
      return (typeof x === "number" ? x - y : String(x).localeCompare(String(y))) * sort.dir;
    });
  }, [partners, leads, sales, services, settings, q, status, sort]);

  const th = (key, label) => (
    <th style={{ cursor: "pointer" }} onClick={() => setSort({ key, dir: sort.key === key ? -sort.dir : 1 })}>
      {label} <ArrowUpDown size={10} />
    </th>
  );

  const validate = (f) => {
    const e = {};
    if (!f.name.trim()) e.name = "Name is required";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Valid email required";
    return e;
  };

  const save = () => {
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length) return;
    if (form.id) { updatePartner(form); toast("Partner updated"); }
    else { addPartner(form); toast("Partner added"); }
    setForm(null);
  };

  const exportRows = () => exportCSV("partners.csv", rows.map((r) => ({ id: r.id, name: r.name, email: r.email, company: r.company, status: r.status, leads: r.leadCount, revenue: r.revenue, commission: r.commission })));

  const act = (p, status, msg) => { setPartnerStatus(p.id, status); toast(msg); };

  return (
    <>
      <PageHead eyebrow="NETWORK" title="Partners" sub="Directory, applications and account status."
        actions={<>
          <button className="btn" onClick={exportRows}><Download size={15} /> Export</button>
          <button className="btn primary" onClick={() => { setForm({ ...BLANK }); setErrors({}); }}><Plus size={15} /> Add partner</button>
        </>} />

      <div className="toolbar">
        <input placeholder="Search partners…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All statuses</option><option value="active">Active</option>
          <option value="pending">Pending</option><option value="suspended">Suspended</option><option value="rejected">Rejected</option>
        </select>
      </div>

      <Panel pad={false}>
        {rows.length === 0 ? <Empty title="No partners match" body="Adjust your search or filters." /> : (
          <div className="scrollx">
            <table className="tbl">
              <thead><tr>{th("name", "Partner")}{th("status", "Status")}{th("leadCount", "Leads")}{th("revenue", "Revenue")}{th("commission", "Commission")}{th("conv", "Conv.")}<th>Actions</th></tr></thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id}>
                    <td><b style={{ cursor: "pointer" }} onClick={() => setView(p)}>{p.name}</b><small>{p.id} · {p.company}</small></td>
                    <td><StatusPill status={p.status} /></td>
                    <td>{p.leadCount}</td>
                    <td>{money(p.revenue)}</td>
                    <td>{money(p.commission)}</td>
                    <td>{p.conv}%</td>
                    <td>
                      <div className="row">
                        {p.status === "pending" && <>
                          <button className="btn sm" onClick={() => act(p, "active", `${p.name} approved`)}><Check size={13} /> Approve</button>
                          <button className="btn sm danger" onClick={() => act(p, "rejected", `${p.name} rejected`)}><X size={13} /> Reject</button>
                        </>}
                        {p.status === "active" && <button className="btn sm danger" onClick={() => setConfirm({ p, status: "suspended", label: "Suspend" })}><Pause size={13} /> Suspend</button>}
                        {(p.status === "suspended" || p.status === "rejected") && <button className="btn sm" onClick={() => act(p, "active", `${p.name} reactivated`)}><Play size={13} /> Reactivate</button>}
                        <button className="btn sm ghost" onClick={() => { setForm({ ...p }); setErrors({}); }}>Edit</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {form && (
        <Modal title={form.id ? "Edit partner" : "Add partner"} onClose={() => setForm(null)}>
          <Field label="Full name" error={errors.name}><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Email" error={errors.email}><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Company"><input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></Field>
          <Field label="Phone"><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <div className="row end"><button className="btn" onClick={() => setForm(null)}>Cancel</button><button className="btn primary" onClick={save}>Save</button></div>
        </Modal>
      )}

      {view && (
        <Modal title={view.name} onClose={() => setView(null)} wide>
          <div className="row" style={{ marginBottom: 16 }}><StatusPill status={view.status} /><span className="mono muted">{view.id} · code {view.code}</span></div>
          <p className="dim">{view.company} · {view.email} · {view.phone}</p>
          <p className="muted" style={{ margin: "6px 0 18px" }}>Joined {fmtDate(view.joined)}</p>
          <h3 style={{ marginBottom: 8 }}>Leads</h3>
          {leads.filter((l) => l.partnerId === view.id).map((l) => (
            <div key={l.id} className="row" style={{ justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
              <span>{l.name}</span><span className="row"><span className="dim">{money(l.value)}</span><StatusPill status={l.stage} /></span>
            </div>
          ))}
          <h3 style={{ margin: "18px 0 8px" }}>Commission history</h3>
          {sales.filter((s) => s.partnerId === view.id).map((s) => (
            <div key={s.id} className="row" style={{ justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
              <span>{s.id} · {s.billing}</span><span className="row"><span className="dim">{money(s.amount)}</span><StatusPill status={s.status} /></span>
            </div>
          ))}
        </Modal>
      )}

      {confirm && (
        <Confirm title={`${confirm.label} partner`} body={`${confirm.label} ${confirm.p.name}? You can reactivate them at any time.`}
          confirmLabel={confirm.label} danger onConfirm={() => act(confirm.p, confirm.status, `${confirm.p.name} suspended`)} onClose={() => setConfirm(null)} />
      )}
    </>
  );
}
