export const DEFAULT_SETTINGS = {
  brand: "Crestivo",
  tagline: "Sales Partner Network",
  heroTitle: "Sell digital solutions. Earn 50% commission.",
  heroBody: "You find the opportunity. Crestivo builds the website, app, AI system or digital solution. You earn the commission.",
  primaryCta: "Become a Sales Partner",
  secondaryCta: "View What You Can Sell",
  payoutNote: "Approved commissions are released on the weekly payout cycle after client payment clears and the refund window is satisfied.",
  footerText: "Crestivo Digital Solutions",
  oneTimeRate: 50,
  recurringRate: 30,
  payoutDay: "Friday",
  refundWindowDays: 14
};

export const SERVICES = [
  { id: "s1", name: "Launch Website", category: "Websites", billing: "one-time", price: 1500, eligible: true, featured: true, status: "published", description: "Professional small-business website with a clean launch-ready experience." },
  { id: "s2", name: "Business Pro Website", category: "Websites", billing: "one-time", price: 3000, eligible: true, featured: false, status: "published", description: "Custom business website with forms, integrations and editable content." },
  { id: "s3", name: "AI Business System", category: "AI Systems", billing: "one-time", price: 5000, eligible: true, featured: true, status: "published", description: "Website plus AI functionality, automation and custom integrations." },
  { id: "s4", name: "Custom Web App", category: "Web Applications", billing: "one-time", price: 7500, eligible: true, featured: true, status: "published", description: "Tailored web application, portal, dashboard or internal business system." },
  { id: "s5", name: "Premium Promo Animation", category: "Animations", billing: "one-time", price: 750, eligible: true, featured: false, status: "published", description: "Short-form promotional animation and supporting creative assets." },
  { id: "s6", name: "Business Automation", category: "Business Automation", billing: "one-time", price: 3000, eligible: true, featured: false, status: "published", description: "Forms, notifications, workflow automation and connected systems." },
  { id: "s7", name: "Custom Dashboard", category: "Custom Dashboards", billing: "one-time", price: 4000, eligible: true, featured: false, status: "published", description: "Executive dashboards with live data and interactive reporting." },
  { id: "s8", name: "Integrations Package", category: "Integrations", billing: "one-time", price: 2000, eligible: true, featured: false, status: "published", description: "Connect payments, CRM, email and third-party platforms." },
  { id: "s9", name: "Monthly Maintenance", category: "Maintenance", billing: "monthly", price: 250, eligible: true, featured: false, status: "published", description: "Hosting, updates, monitoring and small content changes." },
  { id: "s10", name: "Recurring Support", category: "Support", billing: "monthly", price: 500, eligible: true, featured: false, status: "published", description: "Priority support and ongoing improvements." }
];

export const PARTNERS = [
  { id: "CRV-1048", name: "Sarah Johnson", email: "sarah@example.com", company: "Johnson Growth Co.", phone: "212-555-0148", status: "active", joined: "2026-03-04", code: "SARAH48" },
  { id: "CRV-1052", name: "Marcus Reed", email: "marcus@example.com", company: "Reed Consulting", phone: "646-555-0152", status: "active", joined: "2026-04-11", code: "MARCUS52" },
  { id: "CRV-1061", name: "Jasmine Carter", email: "jasmine@example.com", company: "Carter Digital", phone: "917-555-0161", status: "pending", joined: "2026-10-28", code: "JAZ61" },
  { id: "CRV-1070", name: "Daniel Okafor", email: "daniel@example.com", company: "Okafor Ventures", phone: "718-555-0170", status: "active", joined: "2026-06-19", code: "DANO70" },
  { id: "CRV-1077", name: "Elena Vargas", email: "elena@example.com", company: "Vargas Media", phone: "347-555-0177", status: "suspended", joined: "2026-05-02", code: "ELENA77" }
];

export const STAGES = ["New", "Under Review", "Qualified", "Contacted", "Proposal", "Negotiation", "Won", "Lost"];

export const LEADS = [
  { id: "L-2001", name: "Bright Dental Group", contact: "Dr. Amy Lin", email: "amy@brightdental.com", partnerId: "CRV-1048", serviceId: "s2", value: 3000, stage: "Won", followUp: "", notes: "Signed after second call.", created: "2026-08-12" },
  { id: "L-2002", name: "Northside Fitness", contact: "Tom Berg", email: "tom@northsidefit.com", partnerId: "CRV-1048", serviceId: "s3", value: 5000, stage: "Won", followUp: "", notes: "AI intake bot approved.", created: "2026-08-30" },
  { id: "L-2003", name: "Harbor Law Firm", contact: "Jill Moore", email: "jill@harborlaw.com", partnerId: "CRV-1048", serviceId: "s1", value: 1500, stage: "Proposal", followUp: "2026-11-20", notes: "Awaiting proposal review.", created: "2026-10-02" },
  { id: "L-2004", name: "Reed & Sons Plumbing", contact: "Carl Reed", email: "carl@reedplumbing.com", partnerId: "CRV-1052", serviceId: "s4", value: 7500, stage: "Won", followUp: "", notes: "Dispatch portal build.", created: "2026-07-21" },
  { id: "L-2005", name: "Uptown Bakery", contact: "Rosa Diaz", email: "rosa@uptownbakery.com", partnerId: "CRV-1052", serviceId: "s1", value: 1500, stage: "Qualified", followUp: "2026-11-22", notes: "Needs online ordering.", created: "2026-10-15" },
  { id: "L-2006", name: "Metro Realty", contact: "Greg Hall", email: "greg@metrorealty.com", partnerId: "CRV-1070", serviceId: "s6", value: 3000, stage: "Negotiation", followUp: "2026-11-19", notes: "Negotiating scope.", created: "2026-10-20" },
  { id: "L-2007", name: "Sunrise Cafe", contact: "Ana Cruz", email: "ana@sunrisecafe.com", partnerId: "CRV-1070", serviceId: "s5", value: 750, stage: "Contacted", followUp: "2026-11-18", notes: "Wants promo video.", created: "2026-11-01" },
  { id: "L-2008", name: "Apex Logistics", contact: "Ben Fox", email: "ben@apexlog.com", partnerId: "CRV-1048", serviceId: "s7", value: 4000, stage: "Under Review", followUp: "2026-11-21", notes: "", created: "2026-11-09" },
  { id: "L-2009", name: "Peak Climbing Gym", contact: "Lia Park", email: "lia@peakgym.com", partnerId: "CRV-1052", serviceId: "s2", value: 3000, stage: "Lost", followUp: "", notes: "Chose competitor.", created: "2026-09-05" },
  { id: "L-2010", name: "Greenleaf Organics", contact: "Sam Ortiz", email: "sam@greenleaf.com", partnerId: "CRV-1070", serviceId: "s1", value: 1500, stage: "New", followUp: "2026-11-23", notes: "", created: "2026-11-14" }
];

// Sales = won deals. status: pending | approved | paid | reversed
export const SALES = [
  { id: "S-3001", leadId: "L-2001", partnerId: "CRV-1048", serviceId: "s2", amount: 3000, billing: "one-time", date: "2026-08-25", status: "paid" },
  { id: "S-3002", leadId: "L-2002", partnerId: "CRV-1048", serviceId: "s3", amount: 5000, billing: "one-time", date: "2026-09-12", status: "paid" },
  { id: "S-3003", leadId: "L-2004", partnerId: "CRV-1052", serviceId: "s4", amount: 7500, billing: "one-time", date: "2026-08-18", status: "paid" },
  { id: "S-3004", leadId: "L-2001", partnerId: "CRV-1048", serviceId: "s9", amount: 250, billing: "monthly", date: "2026-10-01", status: "paid" },
  { id: "S-3005", leadId: "L-2001", partnerId: "CRV-1048", serviceId: "s9", amount: 250, billing: "monthly", date: "2026-11-01", status: "approved" },
  { id: "S-3006", leadId: "L-2004", partnerId: "CRV-1052", serviceId: "s10", amount: 500, billing: "monthly", date: "2026-11-05", status: "pending" },
  { id: "S-3007", leadId: "L-2002", partnerId: "CRV-1048", serviceId: "s10", amount: 500, billing: "monthly", date: "2026-11-10", status: "pending" },
  { id: "S-3008", leadId: "L-2009", partnerId: "CRV-1052", serviceId: "s2", amount: 3000, billing: "one-time", date: "2026-09-20", status: "reversed" }
];

export const ANNOUNCEMENTS = [
  { id: "a1", title: "Weekly payouts every Friday", body: "Approved commissions are released each Friday.", date: "2026-11-10", published: true }
];

export const FAQS = [
  { id: "f1", q: "How much do I earn?", a: "50% on one-time services and 30% recurring on monthly services.", published: true },
  { id: "f2", q: "When am I paid?", a: "Weekly, after client payment clears and the refund window passes.", published: true }
];

export const RESOURCES = [
  { id: "r1", type: "Script", title: "Cold Outreach Script", body: "Hi [Name], I help local businesses launch modern websites and AI systems. Do you have 10 minutes this week?", published: true },
  { id: "r2", type: "Discovery", title: "Discovery Questions", body: "1. What is your biggest operational bottleneck?\n2. How do customers find you today?\n3. What is your budget range?", published: true },
  { id: "r3", type: "Objection", title: "Handling 'Too Expensive'", body: "Anchor on return: a website that books one extra client a month pays for itself.", published: true }
];
