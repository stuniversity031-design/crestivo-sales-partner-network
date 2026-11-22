export const money = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(n) || 0);

export const pct = (n) => `${Math.round((Number(n) || 0) * 10) / 10}%`;

export const fmtDate = (d) => {
  if (!d) return "—";
  const x = new Date(d + "T00:00:00");
  return x.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const uid = (prefix) => `${prefix}-${Math.floor(Math.random() * 900000 + 100000)}`;

export const rateFor = (billing, settings) =>
  billing === "monthly" ? Number(settings.recurringRate) : Number(settings.oneTimeRate);

export const commissionOf = (sale, settings, services) => {
  if (sale.status === "reversed") return 0;
  const svc = services.find((s) => s.id === sale.serviceId);
  if (svc && svc.eligible === false) return 0;
  return Math.round(sale.amount * (rateFor(sale.billing, settings) / 100) * 100) / 100;
};

export const nextPayoutDate = (payoutDay = "Friday") => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const target = days.indexOf(payoutDay);
  const d = new Date();
  const diff = (target - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
};

export const totalsFor = (sales, settings, services) => {
  const t = { pending: 0, approved: 0, paid: 0, reversed: 0, gross: 0, oneTime: 0, recurring: 0, count: sales.length };
  sales.forEach((s) => {
    const c = commissionOf(s, settings, services);
    if (s.status === "reversed") {
      t.reversed += Math.round(s.amount * (rateFor(s.billing, settings) / 100) * 100) / 100;
      return;
    }
    t[s.status] += c;
    t.gross += s.amount;
    if (s.billing === "monthly") t.recurring += c;
    else t.oneTime += c;
  });
  t.total = t.pending + t.approved + t.paid;
  t.payable = t.approved;
  return t;
};

export const monthKey = (d) => d.slice(0, 7);

export const byMonth = (sales, settings, services) => {
  const map = {};
  sales.forEach((s) => {
    const k = monthKey(s.date);
    map[k] = map[k] || { month: k, revenue: 0, commission: 0 };
    if (s.status !== "reversed") {
      map[k].revenue += s.amount;
      map[k].commission += commissionOf(s, settings, services);
    }
  });
  return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
};

export const exportCSV = (filename, rows) => {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [keys.join(","), ...rows.map((r) => keys.map((k) => esc(r[k])).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
