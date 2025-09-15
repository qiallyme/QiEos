import React from "react";
import { MainLayout } from "../../../components/admin/layout/MainLayout";
import { Card } from "../../../components/admin/ui/card";
import { Button } from "../../../components/admin/ui/button";
import { FiPlus } from "react-icons/fi";

export const CrmPage: React.FC = () => {
  return (
    <MainLayout>
      <Card title="CRM">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">CRM</h2>
          <Button>
            <FiPlus className="mr-2" /> New Contact
          </Button>
        </div>
        <p>CRM board coming soon.</p>
      </Card>
    </MainLayout>
  );
};
