import React from "react";
import { MainLayout } from "../../../../components/admin/layout/MainLayout";
import { Card } from "../../../../components/admin/ui/card";
import { Button } from "../../../../components/admin/ui/button";
import { FiPlus, FiDownload } from "react-icons/fi";

const invoices = [
  {
    id: "INV-001",
    client: "Acme Corporation",
    amount: "$2,500.00",
    status: "Paid",
    date: "2025-08-15",
  },
  {
    id: "INV-002",
    client: "Stark Industries",
    amount: "$10,000.00",
    status: "Paid",
    date: "2025-08-20",
  },
  {
    id: "INV-003",
    client: "Wayne Enterprises",
    amount: "$1,500.00",
    status: "Pending",
    date: "2025-09-01",
  },
  {
    id: "INV-004",
    client: "Acme Corporation",
    amount: "$2,500.00",
    status: "Pending",
    date: "2025-09-15",
  },
];

export const BillingPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Billing</h1>
        <Button>
          <FiPlus className="mr-2" />
          New Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <div className="p-4">
            <h2 className="text-xl font-semibold">Monthly Recurring Revenue</h2>
            <p className="text-3xl font-bold">$12,500</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <h2 className="text-xl font-semibold">Overdue Invoices</h2>
            <p className="text-3xl font-bold">2</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <h2 className="text-xl font-semibold">Active Subscriptions</h2>
            <p className="text-3xl font-bold">12</p>
          </div>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-4">Recent Invoices</h2>
      <Card>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="p-4">Invoice ID</th>
              <th className="p-4">Client</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr
                key={invoice.id}
                className="border-b last:border-b-0 hover:bg-gray-50"
              >
                <td className="p-4 font-medium">{invoice.id}</td>
                <td className="p-4">{invoice.client}</td>
                <td className="p-4">{invoice.amount}</td>
                <td className="p-4">{invoice.status}</td>
                <td className="p-4 text-gray-600">{invoice.date}</td>
                <td className="p-4">
                  <Button variant="outline" size="sm">
                    <FiDownload className="mr-2" />
                    Download
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
