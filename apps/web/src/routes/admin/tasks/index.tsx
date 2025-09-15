import React from "react";
import { MainLayout } from "../../../components/admin/layout/MainLayout";
import { Card } from "../../../components/admin/ui/card";
import { Button } from "../../../components/admin/ui/button";
import { FiPlus } from "react-icons/fi";

export const TasksPage: React.FC = () => {
  return (
    <MainLayout>
      <Card title="Tasks">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Tasks</h2>
          <Button>
            <FiPlus className="mr-2" /> New Task
          </Button>
        </div>
        <p>Admin task list coming soon.</p>
      </Card>
    </MainLayout>
  );
};
