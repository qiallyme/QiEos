import React from "react";
import { MainLayout } from "../../../../components/admin/layout/MainLayout";
import { Card } from "../../../../components/admin/ui/card";
import { Button } from "../../../../components/admin/ui/button";

export const AuditorPage: React.FC = () => {
  return (
    <MainLayout>
      <Card title="Auditor">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Audit Logs</h2>
          <Button>Export</Button>
        </div>
        <p>Audit logs and reports coming soon.</p>
      </Card>
    </MainLayout>
  );
};
