import React from "react";
import { MainLayout } from "../../components/layout/MainLayout";
import { Card } from "../../components/ui/card";

export const DashboardPage: React.FC = () => {
  return (
    <MainLayout>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="p-4">
            <h2 className="text-xl font-semibold">Total Users</h2>
            <p className="text-3xl font-bold">1,234</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <h2 className="text-xl font-semibold">Revenue</h2>
            <p className="text-3xl font-bold">$56,789</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <h2 className="text-xl font-semibold">New Signups</h2>
            <p className="text-3xl font-bold">123</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <h2 className="text-xl font-semibold">Open Tickets</h2>
            <p className="text-3xl font-bold">45</p>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};
