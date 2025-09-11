import React from "react";
import { MainLayout } from "../../../components/admin/layout/MainLayout";
import { Card, Button } from "@qieos/ui";
import { FiEdit, FiPlus } from "react-icons/fi";

export const ProjectDetailsPage: React.FC = () => {
  return (
    <MainLayout>
      <Card title="Project Details">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Sample Project</h2>
          <div className="space-x-2">
            <Button variant="secondary">
              <FiEdit className="mr-2" /> Edit
            </Button>
            <Button>
              <FiPlus className="mr-2" /> New Task
            </Button>
          </div>
        </div>
        <p>Details coming soon.</p>
      </Card>
    </MainLayout>
  );
};
