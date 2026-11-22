import React from "react";
import { DollarSign, Wallet, Clock, CheckCircle2, Target, TrendingUp, Repeat, CalendarDays } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useStore } from "../../state/store.jsx";
import { PageHead, Stat, Panel, StatusPill } from "../../components/ui.jsx";
import { money, totalsFor, byMonth, fmtDate, pct, nextPayoutDate } from "../../lib/calc.js";

const tip = { background: "#1b1b20", border: "1px solid rgba(236,228,210,.18)", borderRadius: 8, color: "#f3ede0" };

export default function PartnerDashboard() {
  const { session, partners, leads, sales, services, settings } = useStore();
  const me = partners.find((p) => p.id === session.partnerId);
  const mySales = sales.filter((s) => s.partnerId === session.partnerId);
  const myLeads = leads.filter((l) => l.partnerId === session.partnerId);
  const t = totalsFor(mySales, settings, services);
  const trend = byMonth(mySales, settings, services);
  const won = myLeads.filter((l) => l.stage === "Won").length;
  const closed = myLeads.filter((l) => ["Won", "Lost"].includes(l.stage)).length;
  const active = myLeads.filter((l) => !["Won", "Lost"].includes(l.stage)).length;
  const svcName = (id) => services.find((s) => s.id === id)?.name || "Service";

  return (
    <>
      <PageHead eyebrow="PARTNER PORTAL" title={`Welcome back, ${me?.name?.split(" ")[0] || "Partner"}`} sub="Your referrals, commissions and next payout at a glance." />

      <div className="grid4">
        <Stat label="Revenue generated" value={money(t.gross)} sub={`${t.count} sales`} icon={DollarSign} />
        <Stat label="Total commission" value={money(t.total)} sub="pending + approved + paid" icon={Wallet} />
        <Stat label="Pending" value={money(t.pending)} sub="awaiting approval" icon={Clock} />
        <Stat label="Approved" value={money(t.approved)} sub="in next payout" icon={CheckCircle2} />
      </div>
      <div className="grid4">
        <Stat label="Paid (simulated)" value={money(t.paid)} sub="no real funds moved" icon={TrendingUp} />
        <Stat label="One-time earnings" value={money(t.oneTime)} sub={`${settings.oneTimeRate}% rate`} icon={DollarSign} />
        <Stat label="Recurring earnings" value={money(t.recurring)} sub={`${settings.recurringRate}% rate`} icon={Repeat} />
        <Stat label="Conversion rate" value={pct(closed ? (won / closed) * 100 : 0)} sub={`${active} active leads`} icon={Target} />
      </div>

      <div className="split">
        <Panel title="Monthly trend" sub="Revenue and your commission">
          <div style={{ height: 260 }}>
            <ResponsiveContainer>
              <AreaChart data={trend}>
                <defs><linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#c9a85c" stopOpacity={0.5} /><stop offset="100%" stopColor="#c9a85c" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid stroke="rgba(236,228,210,.07)" vertical={false} />
                <XAxis dataKey="month" stroke="#7d786e" fontSize={11} />
                <YAxis stroke="#7d786e" fontSize={11} />
                <Tooltip contentStyle={tip} formatter={(v) => money(v)} />
                <Area type="monotone" dataKey="revenue" stroke="#c9a85c" fill="url(#g2)" strokeWidth={2} />
                <Area type="monotone" dataKey="commission" stroke="#7ea6d6" fill="none" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Next payout" sub="Simulated weekly schedule">
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <CalendarDays size={28} color="#c9a85c" />
            <h2 style={{ margin: "10px 0 4px" }}>{fmtDate(nextPayoutDate(settings.payoutDay))}</h2>
            <p className="dim">{settings.payoutDay} · {money(t.approved)} approved</p>
            <p className="muted" style={{ marginTop: 10, fontSize: 12 }}>Demonstration only. No real money is transferred.</p>
          </div>
        </Panel>
      </div>

      <Panel title="Recent sales" pad={false}>
        <div className="scrollx">
          <table className="tbl">
            <thead><tr><th>Date</th><th>Service</th><th>Type</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {mySales.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6).map((s) => (
                <tr key={s.id}><td>{fmtDate(s.date)}</td><td>{svcName(s.serviceId)}</td><td>{s.billing}</td><td>{money(s.amount)}</td><td><StatusPill status={s.status} /></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
