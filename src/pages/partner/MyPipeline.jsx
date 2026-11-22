import React, { useState } from "react";
import { useStore } from "../../state/store.jsx";
import { PageHead, Panel, Modal, Empty, StatusPill } from "../../components/ui.jsx";
import { money, fmtDate } from "../../lib/calc.js";
import { STAGES } from "../../data/seed.js";

export default function MyPipeline() {
  const { session, leads, services } = useStore();
  const [open, setOpen] = useState(null);

  const mine = leads.filter((l) => l.partnerId === session.partnerId);
  const svcName = (id) => services.find((s) => s.id === id)?.name || "—";
  const total = mine.reduce((n, l) => n + (l.stage === "Lost" ? 0 : l.value), 0);

  return (
    <>
      <PageHead
        eyebrow="SELL"
        title="My Pipeline"
        sub={`${mine.length} leads · ${money(total)} open and won value. View only.`}
      />

      {mine.length === 0 ? (
        <Empty title="No leads yet" body="Submit leads from the Referral Center." />
      ) : (
        <div style={{ display: "grid", gridAutoFlow: "column", gridAutoColumns: "minmax(220px, 1fr)", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
          {STAGES.map((stage) => {
            const col = mine.filter((l) => l.stage === stage);
            return (
              <Panel key={stage} title={stage} sub={`${col.length} · ${money(col.reduce((n, l) => n + l.value, 0))}`}>
                {col.length === 0 && <small className="muted">None</small>}
                {col.map((l) => (
                  <button
                    key={l.id}
                    className="surface"
                    style={{ display: "block", width: "100%", textAlign: "left", padding: 12, marginBottom: 8 }}
                    onClick={() => setOpen(l)}
                  >
                    <b>{l.name}</b>
                    <small className="muted" style={{ display: "block" }}>{svcName(l.serviceId)}</small>
                    <small>{money(l.value)}</small>
                  </button>
                ))}
              </Panel>
            );
          })}
        </div>
      )}

      {open && (
        <Modal title={open.name} onClose={() => setOpen(null)}>
          <p><StatusPill status={open.stage} /></p>
          <p><b>Contact:</b> {open.contact} ({open.email})</p>
          <p><b>Service:</b> {svcName(open.serviceId)}</p>
          <p><b>Value:</b> {money(open.value)}</p>
          <p><b>Submitted:</b> {fmtDate(open.created)}</p>
          <p><b>Follow-up:</b> {fmtDate(open.followUp)}</p>
          <p><b>Notes:</b> {open.notes || "—"}</p>
        </Modal>
      )}
    </>
  );
}
