import React from "react";
import { MainLayout } from "../../../components/admin/layout/MainLayout";
import { Card } from "../../../components/admin/ui/card";

export const DashboardPage: React.FC = () => {
  return (
    <MainLayout>
      <Card title="Dashboard">
        <p>Welcome to the admin dashboard!</p>
      </Card>
    </MainLayout>
  );
};
