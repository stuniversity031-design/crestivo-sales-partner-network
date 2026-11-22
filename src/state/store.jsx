import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { DEFAULT_SETTINGS, SERVICES, PARTNERS, LEADS, SALES, ANNOUNCEMENTS, FAQS, RESOURCES } from "../data/seed.js";
import { uid, todayISO } from "../lib/calc.js";

const KEY = "crestivo_v2";
const Ctx = createContext(null);

const load = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
};

const initial = () =>
  load() || {
    settings: DEFAULT_SETTINGS,
    published: DEFAULT_SETTINGS,
    services: SERVICES,
    partners: PARTNERS,
    leads: LEADS,
    sales: SALES,
    announcements: ANNOUNCEMENTS,
    faqs: FAQS,
    resources: RESOURCES,
    payouts: [],
    notifications: [{ id: "n1", text: "Welcome to the Crestivo prototype. All data is simulated.", read: false, date: todayISO() }],
    activity: [],
    revisions: [],
    session: { role: "admin", partnerId: "CRV-1048" },
    prefs: { sidebarOpen: true }
  };

export function StoreProvider({ children }) {
  const [state, setState] = useState(initial);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }, [state]);

  const toast = useCallback((text, kind = "good") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, text, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const patch = useCallback((fn) => setState((s) => ({ ...s, ...fn(s) })), []);

  const log = (s, text) => ({
    activity: [{ id: uid("A"), text, date: todayISO() }, ...s.activity].slice(0, 100)
  });

  const actions = useMemo(() => ({
    setRole: (role, partnerId) => patch((s) => ({ session: { role, partnerId: partnerId || s.session.partnerId } })),
    setPref: (k, v) => patch((s) => ({ prefs: { ...s.prefs, [k]: v } })),

    // Settings (draft vs published)
    saveDraft: (settings) => patch(() => ({ settings })),
    publishSettings: (settings) => patch((s) => ({
      settings,
      published: settings,
      revisions: [{ id: uid("R"), date: new Date().toISOString(), snapshot: s.published }, ...s.revisions].slice(0, 20),
      ...log(s, "Published content and commission settings")
    })),
    restoreRevision: (id) => patch((s) => {
      const r = s.revisions.find((x) => x.id === id);
      return r ? { settings: r.snapshot, published: r.snapshot } : {};
    }),

    // Services
    addService: (svc) => patch((s) => ({ services: [...s.services, { ...svc, id: uid("s") }], ...log(s, `Added service ${svc.name}`) })),
    updateService: (svc) => patch((s) => ({ services: s.services.map((x) => (x.id === svc.id ? svc : x)), ...log(s, `Updated service ${svc.name}`) })),
    deleteService: (id) => patch((s) => ({ services: s.services.filter((x) => x.id !== id) })),

    // Partners
    addPartner: (p) => patch((s) => ({
      partners: [...s.partners, { ...p, id: uid("CRV"), joined: todayISO(), code: (p.name.split(" ")[0] + Math.floor(Math.random() * 90 + 10)).toUpperCase() }],
      ...log(s, `Added partner ${p.name}`)
    })),
    updatePartner: (p) => patch((s) => ({ partners: s.partners.map((x) => (x.id === p.id ? { ...x, ...p } : x)) })),
    setPartnerStatus: (id, status) => patch((s) => {
      const p = s.partners.find((x) => x.id === id);
      return {
        partners: s.partners.map((x) => (x.id === id ? { ...x, status } : x)),
        ...log(s, `${p?.name} set to ${status}`)
      };
    }),

    // Leads
    addLead: (l) => patch((s) => ({
      leads: [{ ...l, id: uid("L"), created: todayISO(), stage: "New" }, ...s.leads],
      notifications: [{ id: uid("n"), text: `New lead: ${l.name}`, read: false, date: todayISO() }, ...s.notifications],
      ...log(s, `Lead submitted: ${l.name}`)
    })),
    updateLead: (l) => patch((s) => ({ leads: s.leads.map((x) => (x.id === l.id ? { ...x, ...l } : x)) })),
    moveLead: (id, stage) => patch((s) => {
      const lead = s.leads.find((x) => x.id === id);
      let sales = s.sales;
      if (stage === "Won" && lead && !s.sales.some((x) => x.leadId === id && x.billing === "one-time")) {
        const svc = s.services.find((x) => x.id === lead.serviceId);
        sales = [...s.sales, {
          id: uid("S"), leadId: id, partnerId: lead.partnerId, serviceId: lead.serviceId,
          amount: lead.value, billing: svc?.billing || "one-time", date: todayISO(), status: "pending"
        }];
      }
      return {
        leads: s.leads.map((x) => (x.id === id ? { ...x, stage } : x)),
        sales,
        ...log(s, `${lead?.name} moved to ${stage}`)
      };
    }),
    deleteLeads: (ids) => patch((s) => ({ leads: s.leads.filter((x) => !ids.includes(x.id)) })),

    // Sales / commissions
    setSaleStatus: (ids, status) => patch((s) => ({
      sales: s.sales.map((x) => (ids.includes(x.id) ? { ...x, status } : x)),
      ...log(s, `${ids.length} commission(s) marked ${status}`)
    })),
    createPayoutBatch: (ids, total, date) => patch((s) => ({
      payouts: [{ id: uid("PB"), saleIds: ids, total, date, createdOn: todayISO(), simulated: true }, ...s.payouts],
      sales: s.sales.map((x) => (ids.includes(x.id) ? { ...x, status: "paid" } : x)),
      notifications: [{ id: uid("n"), text: `Simulated payout batch created (${ids.length} items)`, read: false, date: todayISO() }, ...s.notifications],
      ...log(s, `Simulated payout batch created`)
    })),

    // Content collections
    saveCollection: (key, items) => patch(() => ({ [key]: items })),

    // Notifications
    markAllRead: () => patch((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

    resetAll: () => { localStorage.removeItem(KEY); window.location.reload(); }
  }), [patch]);

  return <Ctx.Provider value={{ ...state, ...actions, toast, toasts }}>{children}</Ctx.Provider>;
}

export const useStore = () => useContext(Ctx);
