import React, { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { useStore } from "../../state/store.jsx";
import { PageHead, Stat, Panel, StatusPill, Empty } from "../../components/ui.jsx";
import { money, totalsFor, commissionOf, rateFor, fmtDate, exportCSV, nextPayoutDate } from "../../lib/calc.js";

const TABS = ["all", "pending", "approved", "paid", "reversed"];

export default function Earnings() {
  const { session, partners, sales, services, payouts, settings } = useStore();
  const me = partners.find((p) => p.id === session.partnerId);
  const [tab, setTab] = useState("all");

  const mine = useMemo(() => sales.filter((s) => s.partnerId === session.partnerId), [sales, session.partnerId]);
  const rows = useMemo(
    () => mine.filter((s) => tab === "all" || s.status === tab).sort((a, b) => b.date.localeCompare(a.date)),
    [mine, tab]
  );
  const t = totalsFor(mine, settings, services);
  const svcName = (id) => services.find((s) => s.id === id)?.name || id;

  const myPayouts = payouts
    .map((p) => ({ ...p, mine: mine.filter((s) => p.saleIds.includes(s.id)) }))
    .filter((p) => p.mine.length);

  const first = nextPayoutDate(settings.payoutDay);
  const calendar = [0, 1, 2, 3].map((i) => {
    const d = new Date(first + "T00:00:00");
    d.setDate(d.getDate() + i * 7);
    return d.toISOString().slice(0, 10);
  });

  const statement = () =>
    exportCSV(
      `statement-${me?.code || "partner"}.csv`,
      mine.map((s) => ({
        date: s.date,
        service: svcName(s.serviceId),
        type: s.billing,
        sale_amount: s.amount,
        rate_pct: rateFor(s.billing, settings),
        commission: commissionOf(s, settings, services),
        status: s.status
      }))
    );

  if (!me) return <Empty title="No partner selected" />;

  return (
    <>
      <PageHead
        eyebrow="EARN"
        title="Earnings & Payouts"
        sub="Demonstration data. No real money is transferred."
        actions={<button className="btn" onClick={statement}><Download size={15} /> Download statement</button>}
      />

      <div className="stats">
        <Stat label="Total commission" value={money(t.total)} sub="pending + approved + paid" />
        <Stat label="Pending" value={money(t.pending)} sub="awaiting approval" />
        <Stat label="Approved" value={money(t.approved)} sub="next payout" />
        <Stat label="Paid" value={money(t.paid)} sub="simulated" />
      </div>

      <div className="stats">
        <Stat label="One-time earnings" value={money(t.oneTime)} sub={`${settings.oneTimeRate}% rate`} />
        <Stat label="Recurring earnings" value={money(t.recurring)} sub={`${settings.recurringRate}% rate`} />
        <Stat label="Reversed" value={money(t.reversed)} sub="refunds / cancellations" />
        <Stat label="Gross sales" value={money(t.gross)} sub={`${t.count} transactions`} />
      </div>

      <Panel title="Weekly payout calendar" sub={`Every ${settings.payoutDay}`}>
        <div className="row">
          {calendar.map((d, i) => (
            <div key={d} className="surface" style={{ padding: 14, minWidth: 130 }}>
              <small className="muted">{i === 0 ? "Next payout" : `Week +${i}`}</small>
              <div><b>{fmtDate(d)}</b></div>
              {i === 0 && <small className="muted">{money(t.approved)} payable</small>}
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        title="Commission history"
        actions={TABS.map((x) => (
          <button key={x} className={"btn sm" + (tab === x ? " primary" : "")} onClick={() => setTab(x)}>
            {x[0].toUpperCase() + x.slice(1)}
          </button>
        ))}
        pad={false}
      >
        {rows.length === 0 ? <Empty title="No commissions" body="Nothing matches this filter." /> : (
          <table>
            <thead><tr><th>Date</th><th>Service</th><th>Type</th><th>Sale</th><th>Rate</th><th>Commission</th><th>Status</th></tr></thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id}>
                  <td>{fmtDate(s.date)}</td>
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

      <Panel title="Payout history" sub="Simulated batches that included your commissions" pad={false}>
        {myPayouts.length === 0 ? <Empty title="No payouts yet" body="They appear after an admin prepares a batch." /> : (
          <table>
            <thead><tr><th>Batch</th><th>Payout date</th><th>Items</th><th>Your amount</th></tr></thead>
            <tbody>
              {myPayouts.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{fmtDate(p.date)}</td>
                  <td>{p.mine.length}</td>
                  <td><b>{money(p.mine.reduce((n, s) => n + commissionOf(s, settings, services), 0))}</b></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </>
  );
}
