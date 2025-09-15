import React from "react";
import { MainLayout } from "../../../components/admin/layout/MainLayout";
import { Card } from "../../../components/admin/ui/card";

export const AuditorPage: React.FC = () => {
  return (
    <MainLayout>
      <Card title="Auditor">
        <p>Audit logs and reports coming soon.</p>
      </Card>
    </MainLayout>
  );
};
