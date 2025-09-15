import React, { useState, useEffect } from "react";
import { MainLayout } from "../../../components/admin/layout/MainLayout";
import { Card } from "../../../components/admin/ui/card";
import { Button } from "../../../components/admin/ui/button";
import { FiPlus, FiDownload, FiEye, FiEdit, FiSend } from "react-icons/fi";
import { api } from "../../../lib/api";

interface Invoice {
  id: string;
  invoice_number: string;
  status: string;
  total_amount: number;
  due_date: string;
  created_at: string;
  companies?: {
    name: string;
    slug: string;
  };
}

export const BillingPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const response = await api.get("/billing/invoices");
      setInvoices((response as any).invoices || []);
    } catch (error) {
      console.error("Failed to load invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  const createInvoice = async () => {
    try {
      const response = await api.post("/billing/invoices", {
        description: "New Invoice",
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        line_items: [
          {
            description: "Service Fee",
            quantity: 1,
            unit_price: 100.0,
            total_price: 100.0,
          },
        ],
      });

      // Reload invoices
      await loadInvoices();
    } catch (error) {
      console.error("Failed to create invoice:", error);
    }
  };

  const sendInvoice = async (invoiceId: string) => {
    try {
      await api.post(`/billing/invoices/${invoiceId}/send`);
      // Reload invoices
      await loadInvoices();
    } catch (error) {
      console.error("Failed to send invoice:", error);
    }
  };

  const exportInvoices = async () => {
    try {
      // For now, just download as JSON
      const dataStr = JSON.stringify(invoices, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoices-${new Date().toISOString().split("T")[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export invoices:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "text-green-600 bg-green-100";
      case "sent":
        return "text-blue-600 bg-blue-100";
      case "overdue":
        return "text-red-600 bg-red-100";
      case "draft":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <MainLayout>
      <Card title="Billing Desk">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Invoices</h2>
          <div className="space-x-2">
            <Button onClick={createInvoice}>
              <FiPlus className="mr-2" /> New Invoice
            </Button>
            <Button variant="secondary" onClick={exportInvoices}>
              <FiDownload className="mr-2" /> Export
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading invoices...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">
              No invoices found. Create your first invoice to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.invoice_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.companies?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${invoice.total_amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          invoice.status
                        )}`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invoice.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button size="sm" variant="outline">
                        <FiEye className="mr-1" /> View
                      </Button>
                      <Button size="sm" variant="outline">
                        <FiEdit className="mr-1" /> Edit
                      </Button>
                      {invoice.status === "draft" && (
                        <Button
                          size="sm"
                          onClick={() => sendInvoice(invoice.id)}
                        >
                          <FiSend className="mr-1" /> Send
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </MainLayout>
  );
};
