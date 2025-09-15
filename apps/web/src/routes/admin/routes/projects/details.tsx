import React from "react";
import { MainLayout } from "../../../../components/admin/layout/MainLayout";
import { Card } from "../../../../components/admin/ui/card";
import { Button } from "../../../../components/admin/ui/button";
import { FiEdit, FiPlus } from "react-icons/fi";

const project = {
  name: "QiEOS Platform",
  description: "The core platform for managing clients, projects, and billing.",
  team: "Core",
  status: "In Progress",
  tasks: [
    { id: 1, title: "Develop authentication flow", status: "Completed" },
    { id: 2, title: "Fix login button bug", status: "In Progress" },
    { id: 3, title: "Design database schema", status: "Pending" },
  ],
  activity: [
    {
      id: 1,
      user: "John Smith",
      action: "completed task: Develop authentication flow",
      time: "2 hours ago",
    },
    {
      id: 2,
      user: "Jane Doe",
      action: "added a new comment",
      time: "1 day ago",
    },
    { id: 3, user: "Admin", action: "created the project", time: "1 week ago" },
  ],
};

export const ProjectDetailsPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-gray-600">{project.description}</p>
        </div>
        <Button>
          <FiEdit className="mr-2" />
          Edit Project
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card>
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Tasks</h2>
              <Button size="sm">
                <FiPlus className="mr-2" />
                Add Task
              </Button>
            </div>
            <ul>
              {project.tasks.map((task) => (
                <li
                  key={task.id}
                  className="p-4 border-b last:border-b-0 flex justify-between"
                >
                  <span>{task.title}</span>
                  <span>{task.status}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div>
          <Card>
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">Activity Feed</h2>
            </div>
            <ul>
              {project.activity.map((item) => (
                <li key={item.id} className="p-4 border-b last:border-b-0">
                  <p className="font-medium">
                    {item.user}{" "}
                    <span className="text-gray-600">{item.action}</span>
                  </p>
                  <p className="text-sm text-gray-500">{item.time}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};
