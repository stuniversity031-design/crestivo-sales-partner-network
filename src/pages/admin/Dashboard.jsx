import React, { useMemo, useState } from "react";
import { Users, Target, Wallet, TrendingUp, DollarSign, Clock, CheckCircle2, Repeat } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";
import { useStore } from "../../state/store.jsx";
import { PageHead, Stat, Panel, StatusPill } from "../../components/ui.jsx";
import { money, totalsFor, byMonth, fmtDate, pct } from "../../lib/calc.js";

const tip = { background: "#1b1b20", border: "1px solid rgba(236,228,210,.18)", borderRadius: 8, color: "#f3ede0" };

export default function AdminDashboard() {
  const { partners, leads, sales, services, settings, activity } = useStore();
  const [range, setRange] = useState("all");

  const filtered = useMemo(() => {
    if (range === "all") return sales;
    const days = Number(range);
    const cut = new Date(); cut.setDate(cut.getDate() - days);
    const c = cut.toISOString().slice(0, 10);
    return sales.filter((s) => s.date >= c);
  }, [sales, range]);

  const t = totalsFor(filtered, settings, services);
  const trend = byMonth(filtered, settings, services);
  const won = leads.filter((l) => l.stage === "Won").length;
  const qualified = leads.filter((l) => ["Qualified", "Contacted", "Proposal", "Negotiation"].includes(l.stage)).length;
  const closed = leads.filter((l) => ["Won", "Lost"].includes(l.stage)).length;
  const conv = closed ? (won / closed) * 100 : 0;
  const recurringRev = filtered.filter((s) => s.billing === "monthly" && s.status !== "reversed").reduce((a, s) => a + s.amount, 0);

  const perf = partners.map((p) => {
    const ps = filtered.filter((s) => s.partnerId === p.id);
    const pt = totalsFor(ps, settings, services);
    return { name: p.name.split(" ")[0], revenue: pt.gross, commission: pt.total };
  });

  const alerts = [];
  const pendingApps = partners.filter((p) => p.status === "pending").length;
  if (pendingApps) alerts.push(`${pendingApps} partner application(s) awaiting review`);
  if (t.approved > 0) alerts.push(`${money(t.approved)} approved and ready for payout batch`);
  const due = leads.filter((l) => l.followUp && l.followUp <= new Date().toISOString().slice(0, 10)).length;
  if (due) alerts.push(`${due} lead follow-up(s) due`);

  return (
    <>
      <PageHead eyebrow="ADMIN CONTROL CENTER" title="Network Overview" sub="Live view of partners, pipeline and commission liability."
        actions={
          <select value={range} onChange={(e) => setRange(e.target.value)} style={{ width: 170 }}>
            <option value="all">All time</option><option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option><option value="180">Last 180 days</option>
          </select>
        } />

      <div className="grid4">
        <Stat label="Total partners" value={partners.length} sub={`${partners.filter((p) => p.status === "active").length} active`} icon={Users} />
        <Stat label="Pending applications" value={pendingApps} sub="awaiting review" icon={Clock} />
        <Stat label="Total leads" value={leads.length} sub={`${qualified} qualified opportunities`} icon={Target} />
        <Stat label="Converted sales" value={won} sub={`${pct(conv)} close rate`} icon={CheckCircle2} />
      </div>
      <div className="grid4">
        <Stat label="Gross revenue" value={money(t.gross)} sub={`${t.count} transactions`} icon={DollarSign} />
        <Stat label="Recurring revenue" value={money(recurringRev)} sub="monthly services" icon={Repeat} />
        <Stat label="Commission liability" value={money(t.pending + t.approved)} sub="pending + approved" icon={Wallet} />
        <Stat label="Paid commissions" value={money(t.paid)} sub={`${money(t.payable)} payable now`} icon={TrendingUp} />
      </div>

      <div className="split">
        <Panel title="Revenue & commission trend" sub="By month">
          <div style={{ height: 280 }}>
            <ResponsiveContainer>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#c9a85c" stopOpacity={0.5} /><stop offset="100%" stopColor="#c9a85c" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(236,228,210,.07)" vertical={false} />
                <XAxis dataKey="month" stroke="#7d786e" fontSize={11} />
                <YAxis stroke="#7d786e" fontSize={11} />
                <Tooltip contentStyle={tip} formatter={(v) => money(v)} />
                <Area type="monotone" dataKey="revenue" stroke="#c9a85c" fill="url(#g1)" strokeWidth={2} />
                <Area type="monotone" dataKey="commission" stroke="#7ea6d6" fill="none" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Operational alerts">
          {alerts.length === 0 && <p className="muted">All clear.</p>}
          {alerts.map((a, i) => <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid var(--line)" }}><span className="pill warn">Alert</span> <span className="dim">{a}</span></div>)}
        </Panel>
      </div>

      <div className="split">
        <Panel title="Partner performance" sub="Revenue vs commission">
          <div style={{ height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={perf}>
                <CartesianGrid stroke="rgba(236,228,210,.07)" vertical={false} />
                <XAxis dataKey="name" stroke="#7d786e" fontSize={11} />
                <YAxis stroke="#7d786e" fontSize={11} />
                <Tooltip contentStyle={tip} formatter={(v) => money(v)} />
                <Bar dataKey="revenue" fill="#c9a85c" radius={[4, 4, 0, 0]} />
                <Bar dataKey="commission" fill="#7ea6d6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Recent activity">
          {activity.length === 0 && <p className="muted">No activity yet. Actions you take appear here.</p>}
          {activity.slice(0, 8).map((a) => <div key={a.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--line)" }}>{a.text}<small className="muted" style={{ display: "block" }}>{fmtDate(a.date)}</small></div>)}
        </Panel>
      </div>
    </>
  );
}
