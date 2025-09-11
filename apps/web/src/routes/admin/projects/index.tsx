import React from "react";
import { MainLayout } from "../../../components/admin/layout/MainLayout";
import { Card, Button } from "@qieos/ui";
import { FiPlus, FiEye } from "react-icons/fi";

export const ProjectsPage: React.FC = () => {
  return (
    <MainLayout>
      <Card title="Projects">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Projects</h2>
          <Button>
            <FiPlus className="mr-2" /> New Project
          </Button>
        </div>
        <p>Project list coming soon.</p>
      </Card>
    </MainLayout>
  );
};
