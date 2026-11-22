import React, { useState } from "react";
import { Copy, Download } from "lucide-react";
import { useStore } from "../../state/store.jsx";
import { PageHead, Panel, StatusPill, Empty } from "../../components/ui.jsx";
import { money, rateFor, commissionOf, fmtDate } from "../../lib/calc.js";

const TABS = ["Services", "Scripts", "Discovery", "Objections", "FAQs", "Announcements"];
const TYPE = { Scripts: "Script", Discovery: "Discovery", Objections: "Objection" };

export default function Enablement() {
  const { services, resources, faqs, announcements, settings, toast } = useStore();
  const [tab, setTab] = useState("Services");
  const [open, setOpen] = useState(null);

  const published = services.filter((s) => s.status === "published");
  const items = resources.filter((r) => r.published && r.type === TYPE[tab]);

  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); toast("Copied"); }
    catch { toast("Copy failed", "bad"); }
  };

  const download = (r) => {
    const url = URL.createObjectURL(new Blob([`${r.title}\n\n${r.body}`], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = r.title.replace(/\W+/g, "-").toLowerCase() + ".txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHead eyebrow="SELL" title="Sales Enablement" sub="Everything you need to position, pitch and close." />

      <div className="row" style={{ marginBottom: 16 }}>
        {TABS.map((x) => (
          <button key={x} className={"btn sm" + (tab === x ? " primary" : "")} onClick={() => setTab(x)}>{x}</button>
        ))}
      </div>

      {tab === "Services" && (
        <Panel title="Service catalog" sub="Your commission shown per service" pad={false}>
          {published.length === 0 ? <Empty title="No published services" /> : (
            <table>
              <thead><tr><th>Service</th><th>Category</th><th>Price</th><th>Your commission</th></tr></thead>
              <tbody>
                {published.map((s) => (
                  <tr key={s.id}>
                    <td><b>{s.name}</b><small className="muted" style={{ display: "block" }}>{s.description}</small></td>
                    <td>{s.category}</td>
                    <td>{money(s.price)}{s.billing === "monthly" ? "/mo" : ""}</td>
                    <td>
                      {s.eligible
                        ? `${money(commissionOf({ amount: s.price, billing: s.billing, serviceId: s.id, status: "pending" }, settings, services))} (${rateFor(s.billing, settings)}%)`
                        : "Not eligible"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
      )}

      {TYPE[tab] && (
        items.length === 0 ? <Empty title="No resources yet" body="Your admin has not published any." /> : (
          items.map((r) => (
            <Panel
              key={r.id}
              title={r.title}
              sub={r.type}
              actions={
                <>
                  <button className="btn sm" onClick={() => copy(r.body)}><Copy size={14} /> Copy</button>
                  <button className="btn sm" onClick={() => download(r)}><Download size={14} /> Download</button>
                </>
              }
            >
              <p style={{ whiteSpace: "pre-wrap" }}>{r.body}</p>
            </Panel>
          ))
        )
      )}

      {tab === "FAQs" && (
        faqs.filter((f) => f.published).length === 0 ? <Empty title="No FAQs" /> : (
          <Panel title="Frequently asked questions" pad={false}>
            {faqs.filter((f) => f.published).map((f) => (
              <div key={f.id} style={{ padding: "14px 20px", borderBottom: "1px solid var(--line)" }}>
                <button className="btn sm ghost" onClick={() => setOpen(open === f.id ? null : f.id)}><b>{f.q}</b></button>
                {open === f.id && <p className="dim" style={{ marginTop: 8 }}>{f.a}</p>}
              </div>
            ))}
          </Panel>
        )
      )}

      {tab === "Announcements" && (
        announcements.filter((a) => a.published).length === 0 ? <Empty title="No announcements" /> : (
          announcements.filter((a) => a.published).map((a) => (
            <Panel key={a.id} title={a.title} sub={fmtDate(a.date)}>
              <p>{a.body}</p>
            </Panel>
          ))
        )
      )}
    </>
  );
}
