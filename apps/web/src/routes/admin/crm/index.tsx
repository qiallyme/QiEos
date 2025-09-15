import React, { useState, useEffect } from "react";
import { MainLayout } from "../../../components/admin/layout/MainLayout";
import { Card } from "../../../components/admin/ui/card";
import { Button } from "../../../components/admin/ui/button";
import { FiPlus, FiEdit, FiTrash2, FiMail, FiPhone } from "react-icons/fi";
import { api } from "../../../lib/api";

interface Contact {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  created_at: string;
  companies?: {
    name: string;
    slug: string;
  };
}

export const CrmPage: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/crm/contacts");
      setContacts(response.contacts || []);
    } catch (error) {
      console.error("Failed to load contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const createContact = async () => {
    try {
      const response = await api.post("/crm/contacts", {
        email: "new@example.com",
        first_name: "New",
        last_name: "Contact",
        phone: "+1234567890",
        role: "external",
      });

      // Reload contacts
      await loadContacts();
    } catch (error) {
      console.error("Failed to create contact:", error);
    }
  };

  const deleteContact = async (contactId: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) {
      return;
    }

    try {
      await api.delete(`/crm/contacts/${contactId}`);
      // Reload contacts
      await loadContacts();
    } catch (error) {
      console.error("Failed to delete contact:", error);
    }
  };

  return (
    <MainLayout>
      <Card title="CRM">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Contacts</h2>
          <Button onClick={createContact}>
            <FiPlus className="mr-2" /> New Contact
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading contacts...</p>
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">
              No contacts found. Create your first contact to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contacts.map((contact) => (
                  <tr key={contact.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {contact.first_name} {contact.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <FiMail className="mr-2" />
                        {contact.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <FiPhone className="mr-2" />
                        {contact.phone || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contact.companies?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {contact.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button size="sm" variant="outline">
                        <FiEdit className="mr-1" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteContact(contact.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <FiTrash2 className="mr-1" /> Delete
                      </Button>
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
