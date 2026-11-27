import React, { useEffect, useState } from "react";
import { useStore } from "./state/store.jsx";
import { useAuth } from "./state/auth.jsx";
import Shell, { NAV } from "./components/Shell.jsx";
import { PageHead, Empty } from "./components/ui.jsx";
import Login from "./pages/Login.jsx";
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import Partners from "./pages/admin/Partners.jsx";
import Leads from "./pages/admin/Leads.jsx";
import Pipeline from "./pages/admin/Pipeline.jsx";
import Commissions from "./pages/admin/Commissions.jsx";
import Settings from "./pages/admin/Settings.jsx";
import Services from "./pages/admin/Services.jsx";
import Editor from "./pages/admin/Editor.jsx";
import PartnerDashboard from "./pages/partner/Dashboard.jsx";
import Referral from "./pages/partner/Referral.jsx";
import Earnings from "./pages/partner/Earnings.jsx";
import Enablement from "./pages/partner/Enablement.jsx";
import MyPipeline from "./pages/partner/MyPipeline.jsx";
import ProfilePage from "./pages/partner/ProfilePage.jsx";
import Client from "./pages/Client.jsx";

function Soon({ id }) {
  return (
    <>
      <PageHead eyebrow="IN BUILD" title={id.toUpperCase()} sub="This screen is built in an upcoming step." />
      <Empty title="Coming next" body="Navigation works. Content arrives in a later step." />
    </>
  );
}

const ROUTES = {
  admin: { dashboard: AdminDashboard, partners: Partners, leads: Leads, pipeline: Pipeline, commissions: Commissions, settings: Settings, services: Services, editor: Editor, client: Client },
  partner: { dashboard: PartnerDashboard, referral: Referral, earnings: Earnings, enablement: Enablement, pipeline: MyPipeline, profile: ProfilePage, client: Client }
};

export default function App() {
  const { user, profile, loading, signOut } = useAuth();
  const { session, setRole } = useStore();
  const [page, setPage] = useState("dashboard");

  useEffect(() => {
    if (!profile) return;
    const pid = profile.partner_id || session.partnerId;
    if (session.role !== profile.role || session.partnerId !== pid) setRole(profile.role, pid);
  }, [profile, session.role, session.partnerId]);

  if (loading) return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>Loading…</div>;
  if (!user) return <Login />;
  if (!profile) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", textAlign: "center" }}>
        <div>
          <h3>Account not set up</h3>
          <p className="muted">Contact your administrator.</p>
          <button className="btn" onClick={signOut}>Sign out</button>
        </div>
      </div>
    );
  }
  if (session.role !== profile.role) return null;

  const valid = NAV[profile.role].flatMap((g) => g.items).some((i) => i[0] === page);
  const current = valid ? page : "dashboard";
  const Page = ROUTES[profile.role][current];
  return (
    <Shell page={current} setPage={setPage}>
      {Page ? <Page /> : <Soon id={current} />}
    </Shell>
  );
}
