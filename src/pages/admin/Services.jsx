import React, { useMemo, useState } from "react";
import { Plus, Edit3, Trash2, Archive, Star, Search } from "lucide-react";
import { useStore } from "../../state/store.jsx";
import { PageHead, Panel, Modal, Field, StatusPill, Empty, Confirm } from "../../components/ui.jsx";
import { money, rateFor, commissionOf } from "../../lib/calc.js";

const CATEGORIES = ["Websites", "Web Applications", "AI Systems", "Business Automation", "Custom Dashboards", "Digital Experiences", "Integrations", "Animations", "Custom Development", "Maintenance", "Support"];
const BLANK = { name: "", category: "Websites", billing: "one-time", price: 1000, eligible: true, featured: false, status: "draft", description: "" };

export default function Services() {
  const { services, settings, addService, updateService, deleteService, toast } = useStore();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [edit, setEdit] = useState(null);
  const [errors, setErrors] = useState({});
  const [del, setDel] = useState(null);

  const rows = useMemo(
    () => services.filter((s) =>
      (cat === "All" || s.category === cat) &&
      (s.name + s.description).toLowerCase().includes(q.toLowerCase())),
    [services, q, cat]
  );

  const open = (s) => { setErrors({}); setEdit({ ...s }); };

  const save = () => {
    const e = {};
    if (!edit.name.trim()) e.name = "Required";
    if (!(Number(edit.price) > 0)) e.price = "Enter a price above 0";
    if (!edit.description.trim()) e.description = "Required";
    setErrors(e);
    if (Object.keys(e).length) return;
    const svc = { ...edit, price: Number(edit.price) };
    if (svc.id) updateService(svc); else addService(svc);
    toast(svc.id ? "Service updated" : "Service added");
    setEdit(null);
  };

  const archive = (s) => {
    updateService({ ...s, status: s.status === "archived" ? "draft" : "archived" });
    toast(s.status === "archived" ? "Restored to draft" : "Archived");
  };

  return (
    <>
      <PageHead
        eyebrow="CONTENT"
        title="Service Catalog"
        sub="Published services appear in the partner catalog. Commission follows the rates in Settings."
        actions={<button className="btn primary" onClick={() => open(BLANK)}><Plus size={15} /> Add service</button>}
      />

      <Panel
        title={`${rows.length} services`}
        actions={
          <>
            <div className="row"><Search size={15} /><input placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} /></div>
            <select value={cat} onChange={(e) => setCat(e.target.value)}>
              <option>All</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </>
        }
        pad={false}
      >
        {rows.length === 0 ? <Empty title="No services" body="Adjust the search or add a service." /> : (
          <table>
            <thead>
              <tr><th>Service</th><th>Category</th><th>Billing</th><th>Price</th><th>Commission</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id}>
                  <td>
                    <b>{s.featured && <Star size={13} />} {s.name}</b>
                    <small className="muted" style={{ display: "block" }}>{s.description}</small>
                  </td>
                  <td>{s.category}</td>
                  <td>{s.billing}</td>
                  <td>{money(s.price)}{s.billing === "monthly" ? "/mo" : ""}</td>
                  <td>
                    {s.eligible ? `${money(commissionOf({ amount: s.price, billing: s.billing, serviceId: s.id, status: "pending" }, settings, services))} (${rateFor(s.billing, settings)}%)` : "Not eligible"}
                  </td>
                  <td><StatusPill status={s.status} /></td>
                  <td>
                    <div className="row end">
                      <button className="iconBtn" title="Edit" onClick={() => open(s)}><Edit3 size={15} /></button>
                      <button className="iconBtn" title="Archive / restore" onClick={() => archive(s)}><Archive size={15} /></button>
                      <button className="iconBtn" title="Delete" onClick={() => setDel(s)}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      {edit && (
        <Modal title={edit.id ? "Edit service" : "Add service"} onClose={() => setEdit(null)}>
          <Field label="Name" error={errors.name}>
            <input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
          </Field>
          <Field label="Category">
            <select value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Billing">
            <select value={edit.billing} onChange={(e) => setEdit({ ...edit, billing: e.target.value })}>
              <option value="one-time">One-time</option>
              <option value="monthly">Monthly (recurring)</option>
            </select>
          </Field>
          <Field label="Price (USD)" error={errors.price}>
            <input type="number" min="0" value={edit.price} onChange={(e) => setEdit({ ...edit, price: e.target.value })} />
          </Field>
          <Field label="Description" error={errors.description}>
            <textarea rows={3} value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} />
          </Field>
          <Field label="Publication status">
            <select value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })}>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </Field>
          <label className="row"><input type="checkbox" checked={edit.eligible} onChange={(e) => setEdit({ ...edit, eligible: e.target.checked })} /> Commission eligible</label>
          <label className="row"><input type="checkbox" checked={edit.featured} onChange={(e) => setEdit({ ...edit, featured: e.target.checked })} /> Featured</label>
          <div className="row end" style={{ marginTop: 16 }}>
            <button className="btn" onClick={() => setEdit(null)}>Cancel</button>
            <button className="btn primary" onClick={save}>Save service</button>
          </div>
        </Modal>
      )}

      {del && (
        <Confirm
          title="Delete service"
          body={`Delete "${del.name}" permanently? Archive instead if you may need it later.`}
          confirmLabel="Delete"
          danger
          onConfirm={() => { deleteService(del.id); toast("Service deleted"); }}
          onClose={() => setDel(null)}
        />
      )}
    </>
  );
}
