import React from "react";
import { MainLayout } from "../../../components/admin/layout/MainLayout";
import { Card } from "@qieos/ui";

export const DashboardPage: React.FC = () => {
  return (
    <MainLayout>
      <Card title="Dashboard">
        <p>Welcome to the admin dashboard!</p>
      </Card>
    </MainLayout>
  );
};
