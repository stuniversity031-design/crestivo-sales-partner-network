import React, { useMemo, useState } from "react";
import { Download, CheckCircle2, Undo2, Wallet } from "lucide-react";
import { useStore } from "../../state/store.jsx";
import { PageHead, Stat, Panel, StatusPill, Empty, Confirm } from "../../components/ui.jsx";
import { money, totalsFor, commissionOf, rateFor, fmtDate, exportCSV, nextPayoutDate } from "../../lib/calc.js";

const TABS = ["all", "pending", "approved", "paid", "reversed"];

export default function Commissions() {
  const { sales, partners, services, settings, payouts, setSaleStatus, createPayoutBatch, toast } = useStore();
  const [tab, setTab] = useState("all");
  const [sel, setSel] = useState([]);
  const [confirm, setConfirm] = useState(null);

  const t = totalsFor(sales, settings, services);
  const partnerName = (id) => partners.find((p) => p.id === id)?.name || id;
  const svcName = (id) => services.find((s) => s.id === id)?.name || id;

  const rows = useMemo(
    () => sales.filter((s) => tab === "all" || s.status === tab).sort((a, b) => b.date.localeCompare(a.date)),
    [sales, tab]
  );

  const toggle = (id) => setSel((x) => (x.includes(id) ? x.filter((i) => i !== id) : [...x, id]));
  const act = (status, msg) => {
    setSaleStatus(sel, status);
    toast(msg);
    setSel([]);
  };

  const approvedSales = sales.filter((s) => s.status === "approved");
  const batchTotal = approvedSales.reduce((n, s) => n + commissionOf(s, settings, services), 0);
  const payoutDate = nextPayoutDate(settings.payoutDay);

  const exportAll = () =>
    exportCSV(
      "commission-ledger.csv",
      sales.map((s) => ({
        id: s.id,
        date: s.date,
        partner: partnerName(s.partnerId),
        service: svcName(s.serviceId),
        billing: s.billing,
        amount: s.amount,
        rate_pct: rateFor(s.billing, settings),
        commission: commissionOf(s, settings, services),
        status: s.status
      }))
    );

  return (
    <>
      <PageHead
        eyebrow="FINANCE"
        title="Commission Center"
        sub={`${settings.oneTimeRate}% one-time · ${settings.recurringRate}% recurring · paid weekly (${settings.payoutDay}). Simulation only, no real money moves.`}
        actions={
          <>
            <button className="btn" onClick={exportAll}><Download size={15} /> Export ledger</button>
            <button className="btn primary" disabled={!approvedSales.length} onClick={() => setConfirm("batch")}>
              <Wallet size={15} /> Prepare payout batch
            </button>
          </>
        }
      />

      <div className="stats">
        <Stat label="Pending" value={money(t.pending)} sub="awaiting approval" />
        <Stat label="Approved / payable" value={money(t.approved)} sub={`next payout ${fmtDate(payoutDate)}`} />
        <Stat label="Paid" value={money(t.paid)} sub="simulated" />
        <Stat label="Reversed" value={money(t.reversed)} sub="refunds / cancellations" />
      </div>

      <Panel
        title="Commission ledger"
        sub="Amounts recalculate live from the rates in Settings"
        actions={
          <>
            {TABS.map((x) => (
              <button key={x} className={"btn sm" + (tab === x ? " primary" : "")} onClick={() => { setTab(x); setSel([]); }}>
                {x[0].toUpperCase() + x.slice(1)}
              </button>
            ))}
          </>
        }
        pad={false}
      >
        {sel.length > 0 && (
          <div className="row" style={{ padding: 14 }}>
            <b>{sel.length} selected</b>
            <button className="btn sm" onClick={() => act("approved", "Marked approved")}><CheckCircle2 size={14} /> Approve</button>
            <button className="btn sm" onClick={() => act("pending", "Marked pending")}>Set pending</button>
            <button className="btn sm danger" onClick={() => setConfirm("reverse")}><Undo2 size={14} /> Simulate refund</button>
          </div>
        )}
        {rows.length === 0 ? (
          <Empty title="No commissions" body="Nothing matches this filter." />
        ) : (
          <table>
            <thead>
              <tr>
                <th></th><th>Date</th><th>Partner</th><th>Service</th><th>Type</th>
                <th>Sale</th><th>Rate</th><th>Commission</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id}>
                  <td><input type="checkbox" checked={sel.includes(s.id)} onChange={() => toggle(s.id)} /></td>
                  <td>{fmtDate(s.date)}</td>
                  <td>{partnerName(s.partnerId)}</td>
                  <td>{svcName(s.serviceId)}</td>
                  <td>{s.billing}</td>
                  <td>{money(s.amount)}</td>
                  <td>{rateFor(s.billing, settings)}%</td>
                  <td><b>{s.status === "reversed" ? "—" : money(commissionOf(s, settings, services))}</b></td>
                  <td><StatusPill status={s.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      <Panel title="Payout history" sub="Simulated batches" pad={false}>
        {payouts.length === 0 ? (
          <Empty title="No payout batches yet" body="Approve commissions, then prepare a batch." />
        ) : (
          <table>
            <thead><tr><th>Batch</th><th>Created</th><th>Payout date</th><th>Items</th><th>Total</th></tr></thead>
            <tbody>
              {payouts.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td><td>{fmtDate(p.createdOn)}</td><td>{fmtDate(p.date)}</td>
                  <td>{p.saleIds.length}</td><td><b>{money(p.total)}</b></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      {confirm === "batch" && (
        <Confirm
          title="Prepare simulated payout batch"
          body={`${approvedSales.length} approved commission(s) totaling ${money(batchTotal)} will be marked paid for ${fmtDate(payoutDate)}. Simulation only.`}
          confirmLabel="Create batch"
          onConfirm={() => {
            createPayoutBatch(approvedSales.map((s) => s.id), batchTotal, payoutDate);
            toast("Simulated payout batch created");
          }}
          onClose={() => setConfirm(null)}
        />
      )}
      {confirm === "reverse" && (
        <Confirm
          title="Simulate refund / cancellation"
          body={`${sel.length} commission(s) will be reversed and excluded from payouts.`}
          confirmLabel="Reverse"
          danger
          onConfirm={() => act("reversed", "Commission reversed")}
          onClose={() => setConfirm(null)}
        />
      )}
    </>
  );
}
