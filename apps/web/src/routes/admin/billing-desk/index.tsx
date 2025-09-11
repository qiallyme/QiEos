import React from "react";
import { MainLayout } from "../../../components/admin/layout/MainLayout";
import { Card, Button } from "@qieos/ui";
import { FiPlus, FiDownload } from "react-icons/fi";

export const BillingPage: React.FC = () => {
  return (
    <MainLayout>
      <Card title="Billing Desk">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Invoices</h2>
          <div className="space-x-2">
            <Button>
              <FiPlus className="mr-2" /> New Invoice
            </Button>
            <Button variant="secondary">
              <FiDownload className="mr-2" /> Export
            </Button>
          </div>
        </div>
        <p>Billing features coming soon.</p>
      </Card>
    </MainLayout>
  );
};
