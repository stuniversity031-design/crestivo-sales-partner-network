import React, { useState } from "react";
import { Save, Upload, RotateCcw, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { useStore } from "../../state/store.jsx";
import { PageHead, Panel, Field, Confirm } from "../../components/ui.jsx";
import { uid, todayISO } from "../../lib/calc.js";

const TABS = ["Content", "Announcements", "FAQs", "Resources"];

const CONTENT_FIELDS = [
  ["tagline", "Tagline", "input"],
  ["heroTitle", "Headline", "input"],
  ["heroBody", "Subheading", "textarea"],
  ["primaryCta", "Primary button text", "input"],
  ["secondaryCta", "Secondary button text", "input"],
  ["payoutNote", "Payout explanation", "textarea"],
  ["footerText", "Footer text", "input"]
];

function ContentTab() {
  const { settings, published, saveDraft, publishSettings, toast } = useStore();
  const [d, setD] = useState(settings);
  const [errors, setErrors] = useState({});
  const [confirm, setConfirm] = useState(false);

  const validate = () => {
    const e = {};
    CONTENT_FIELDS.forEach(([k, label]) => { if (!String(d[k] || "").trim()) e[k] = `${label} is required`; });
    if ((d.heroTitle || "").length > 90) e.heroTitle = "Keep under 90 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const merged = () => ({ ...settings, ...Object.fromEntries(CONTENT_FIELDS.map(([k]) => [k, d[k]])) });
  const dirty = JSON.stringify(merged()) !== JSON.stringify(published);

  return (
    <>
      <div className="row end" style={{ marginBottom: 16 }}>
        <button className="btn" onClick={() => { setD(settings); setErrors({}); }}><RotateCcw size={15} /> Discard</button>
        <button className="btn" onClick={() => { if (validate()) { saveDraft(merged()); toast("Draft saved"); } }}><Save size={15} /> Save draft</button>
        <button className="btn primary" onClick={() => { if (validate()) setConfirm(true); }}><Upload size={15} /> Publish</button>
      </div>
      <div className="grid2">
        <Panel title="Edit content" sub={dirty ? "Unpublished changes" : "Published"}>
          {CONTENT_FIELDS.map(([k, label, type]) => (
            <Field key={k} label={label} error={errors[k]}>
              {type === "textarea"
                ? <textarea rows={3} value={d[k] || ""} onChange={(e) => setD({ ...d, [k]: e.target.value })} />
                : <input value={d[k] || ""} onChange={(e) => setD({ ...d, [k]: e.target.value })} />}
            </Field>
          ))}
        </Panel>
        <Panel title="Live preview" sub="Partner-facing">
          <span className="eyebrow">{(d.brand || "").toUpperCase()} · {d.tagline}</span>
          <h2>{d.heroTitle}</h2>
          <p className="dim">{d.heroBody}</p>
          <div className="row" style={{ margin: "14px 0" }}>
            <button className="btn primary">{d.primaryCta}</button>
            <button className="btn">{d.secondaryCta}</button>
          </div>
          <p className="muted">{d.payoutNote}</p>
          <hr />
          <small className="muted">{d.footerText}</small>
        </Panel>
      </div>
      {confirm && (
        <Confirm
          title="Publish content"
          body="Partner-facing content will update immediately. The previous version is saved in revision history."
          confirmLabel="Publish"
          onConfirm={() => { publishSettings(merged()); toast("Published"); }}
          onClose={() => setConfirm(false)}
        />
      )}
    </>
  );
}

function CollectionTab({ storeKey, title, fields, blank, label }) {
  const store = useStore();
  const { saveCollection, toast } = store;
  const source = store[storeKey];
  const [items, setItems] = useState(source);
  const [errors, setErrors] = useState({});
  const [del, setDel] = useState(null);

  const set = (id, k, v) => setItems(items.map((x) => (x.id === id ? { ...x, [k]: v } : x)));
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const n = [...items];
    [n[i], n[j]] = [n[j], n[i]];
    setItems(n);
  };
  const dirty = JSON.stringify(items) !== JSON.stringify(source);

  const save = () => {
    const e = {};
    items.forEach((it) => fields.forEach(([k, l]) => { if (!String(it[k] || "").trim()) e[it.id + k] = `${l} required`; }));
    setErrors(e);
    if (Object.keys(e).length) return toast("Fix the highlighted fields", "bad");
    saveCollection(storeKey, items);
    toast("Saved");
  };

  return (
    <>
      <div className="row end" style={{ marginBottom: 16 }}>
        <button className="btn" disabled={!dirty} onClick={() => { setItems(source); setErrors({}); }}><RotateCcw size={15} /> Discard</button>
        <button className="btn" onClick={() => setItems([...items, { ...blank, id: uid(storeKey[0]), date: todayISO() }])}><Plus size={15} /> Add {label}</button>
        <button className="btn primary" disabled={!dirty} onClick={save}><Save size={15} /> Save changes</button>
      </div>
      {items.map((it, i) => (
        <Panel
          key={it.id}
          title={it[fields[0][0]] || `New ${label}`}
          sub={it.published ? "Visible to partners" : "Hidden"}
          actions={
            <>
              <button className="iconBtn" title="Move up" onClick={() => move(i, -1)}><ArrowUp size={15} /></button>
              <button className="iconBtn" title="Move down" onClick={() => move(i, 1)}><ArrowDown size={15} /></button>
              <button className="iconBtn" title="Delete" onClick={() => setDel(it)}><Trash2 size={15} /></button>
            </>
          }
        >
          {fields.map(([k, l, type, options]) => (
            <Field key={k} label={l} error={errors[it.id + k]}>
              {type === "textarea" ? <textarea rows={3} value={it[k] || ""} onChange={(e) => set(it.id, k, e.target.value)} />
                : type === "select" ? <select value={it[k]} onChange={(e) => set(it.id, k, e.target.value)}>{options.map((o) => <option key={o}>{o}</option>)}</select>
                : <input value={it[k] || ""} onChange={(e) => set(it.id, k, e.target.value)} />}
            </Field>
          ))}
          <label className="row"><input type="checkbox" checked={!!it.published} onChange={(e) => set(it.id, "published", e.target.checked)} /> Published</label>
        </Panel>
      ))}
      {items.length === 0 && <p className="muted">No {title.toLowerCase()} yet. Add one above.</p>}
      {del && (
        <Confirm
          title={`Delete ${label}`}
          body="Removes it from this list. Click Save changes to apply."
          confirmLabel="Delete"
          danger
          onConfirm={() => setItems(items.filter((x) => x.id !== del.id))}
          onClose={() => setDel(null)}
        />
      )}
    </>
  );
}

export default function Editor() {
  const [tab, setTab] = useState("Content");
  return (
    <>
      <PageHead eyebrow="CONTENT" title="No-Code Editor" sub="Edit partner-facing content without touching code. Everything here is live in the prototype." />
      <div className="row" style={{ marginBottom: 16 }}>
        {TABS.map((x) => <button key={x} className={"btn sm" + (tab === x ? " primary" : "")} onClick={() => setTab(x)}>{x}</button>)}
      </div>
      {tab === "Content" && <ContentTab />}
      {tab === "Announcements" && (
        <CollectionTab key="a" storeKey="announcements" title="Announcements" label="announcement"
          blank={{ title: "", body: "", published: true }}
          fields={[["title", "Title", "input"], ["body", "Message", "textarea"]]} />
      )}
      {tab === "FAQs" && (
        <CollectionTab key="f" storeKey="faqs" title="FAQs" label="FAQ"
          blank={{ q: "", a: "", published: true }}
          fields={[["q", "Question", "input"], ["a", "Answer", "textarea"]]} />
      )}
      {tab === "Resources" && (
        <CollectionTab key="r" storeKey="resources" title="Resources" label="resource"
          blank={{ type: "Script", title: "", body: "", published: true }}
          fields={[["title", "Title", "input"], ["type", "Type", "select", ["Script", "Discovery", "Objection"]], ["body", "Content", "textarea"]]} />
      )}
    </>
  );
}
