import React from "react";
import { MainLayout } from "../../../components/admin/layout/MainLayout";
import { Card } from "../../../components/admin/ui/card";
import { AdminQuicklinks } from "../../../components/admin/AdminQuicklinks";

export const DashboardPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <Card title="Dashboard">
          <p>Welcome to the admin dashboard!</p>
        </Card>

        <AdminQuicklinks />
      </div>
    </MainLayout>
  );
};
