import React, { useState } from "react";
import { useStore } from "./state/store.jsx";
import Shell, { NAV } from "./components/Shell.jsx";
import { PageHead, Empty } from "./components/ui.jsx";
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
  const { session } = useStore();
  const [page, setPage] = useState("dashboard");
  const valid = NAV[session.role].flatMap((g) => g.items).some((i) => i[0] === page);
  const current = valid ? page : "dashboard";
  const Page = ROUTES[session.role][current];
  return (
    <Shell page={current} setPage={setPage}>
      {Page ? <Page /> : <Soon id={current} />}
    </Shell>
  );
}
