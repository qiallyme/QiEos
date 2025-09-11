import React from "react";
import { MainLayout } from "../../components/layout/MainLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { FiPlus, FiEye } from "react-icons/fi";

const projects = [
  {
    id: 1,
    name: "QiEOS Platform",
    status: "In Progress",
    team: "Core",
    lastUpdate: "2 hours ago",
  },
  {
    id: 2,
    name: "Qially Marketing Site",
    status: "Completed",
    team: "Web",
    lastUpdate: "1 day ago",
  },
  {
    id: 3,
    name: "Internal Admin Panel",
    status: "In Progress",
    team: "Internal",
    lastUpdate: "30 minutes ago",
  },
  {
    id: 4,
    name: "API Integrations",
    status: "On Hold",
    team: "Backend",
    lastUpdate: "1 week ago",
  },
];

export const ProjectsPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Button>
          <FiPlus className="mr-2" />
          New Project
        </Button>
      </div>
      <Card>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="p-4">Project Name</th>
              <th className="p-4">Status</th>
              <th className="p-4">Team</th>
              <th className="p-4">Last Update</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr
                key={project.id}
                className="border-b last:border-b-0 hover:bg-gray-50"
              >
                <td className="p-4 font-medium">{project.name}</td>
                <td className="p-4">{project.status}</td>
                <td className="p-4">{project.team}</td>
                <td className="p-4 text-gray-600">{project.lastUpdate}</td>
                <td className="p-4">
                  <Button variant="outline" size="sm">
                    <FiEye className="mr-2" />
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </MainLayout>
  );
};
