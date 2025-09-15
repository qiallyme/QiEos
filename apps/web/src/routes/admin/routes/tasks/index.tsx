import React from "react";
import { MainLayout } from "../../../../components/admin/layout/MainLayout";
import { Card } from "../../../../components/admin/ui/card";
import { Button } from "../../../../components/admin/ui/button";
import { FiPlus } from "react-icons/fi";

const tasks = [
  {
    id: 1,
    title: "Design new dashboard layout",
    project: "Internal Admin Panel",
    assignee: "Jane Doe",
    status: "In Progress",
    dueDate: "2025-09-15",
  },
  {
    id: 2,
    title: "Develop authentication flow",
    project: "QiEOS Platform",
    assignee: "John Smith",
    status: "Completed",
    dueDate: "2025-09-10",
  },
  {
    id: 3,
    title: "Write API documentation",
    project: "API Integrations",
    assignee: "Peter Jones",
    status: "Pending",
    dueDate: "2025-09-20",
  },
  {
    id: 4,
    title: "Create marketing materials",
    project: "Qially Marketing Site",
    assignee: "Mary Johnson",
    status: "On Hold",
    dueDate: "2025-10-01",
  },
  {
    id: 5,
    title: "Fix login button bug",
    project: "QiEOS Platform",
    assignee: "John Smith",
    status: "In Progress",
    dueDate: "2025-09-12",
  },
];

export const TasksPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <Button>
          <FiPlus className="mr-2" />
          New Task
        </Button>
      </div>
      <Card>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="p-4">Task Title</th>
              <th className="p-4">Project</th>
              <th className="p-4">Assignee</th>
              <th className="p-4">Status</th>
              <th className="p-4">Due Date</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr
                key={task.id}
                className="border-b last:border-b-0 hover:bg-gray-50"
              >
                <td className="p-4 font-medium">{task.title}</td>
                <td className="p-4">{task.project}</td>
                <td className="p-4">{task.assignee}</td>
                <td className="p-4">{task.status}</td>
                <td className="p-4 text-gray-600">{task.dueDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </MainLayout>
  );
};
