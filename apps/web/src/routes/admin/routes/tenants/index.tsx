import React from "react";
import { MainLayout } from "../../../../components/admin/layout/MainLayout";
import { Card } from "@qieos/ui";
import { Button } from "@qieos/ui";
import { FiPlus } from "react-icons/fi";

const tenants = [
  {
    id: "acme-corp",
    name: "Acme Corporation",
    status: "Active",
    users: 25,
    plan: "Enterprise",
  },
  {
    id: "stark-industries",
    name: "Stark Industries",
    status: "Active",
    users: 150,
    plan: "Enterprise",
  },
  {
    id: "wayne-enterprises",
    name: "Wayne Enterprises",
    status: "Trial",
    users: 5,
    plan: "Pro",
  },
  {
    id: "cyberdyne-systems",
    name: "Cyberdyne Systems",
    status: "Inactive",
    users: 0,
    plan: "Free",
  },
];

export const TenantsPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tenants</h1>
        <Button>
          <FiPlus className="mr-2" />
          New Tenant
        </Button>
      </div>
      <Card>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="p-4">Tenant Name</th>
              <th className="p-4">Status</th>
              <th className="p-4">Plan</th>
              <th className="p-4">Users</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant) => (
              <tr
                key={tenant.id}
                className="border-b last:border-b-0 hover:bg-gray-50"
              >
                <td className="p-4 font-medium">{tenant.name}</td>
                <td className="p-4">{tenant.status}</td>
                <td className="p-4">{tenant.plan}</td>
                <td className="p-4 text-gray-600">{tenant.users}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </MainLayout>
  );
};
