import React from "react";
import { NavLink } from "react-router-dom";
import {
  FiGrid,
  FiBriefcase,
  FiCheckSquare,
  FiUsers,
  FiBarChart2,
  FiDollarSign,
  FiShield,
} from "react-icons/fi";

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: FiGrid },
  { name: "Projects", href: "/admin/projects", icon: FiBriefcase },
  { name: "Tasks", href: "/admin/tasks", icon: FiCheckSquare },
  { name: "Tenants", href: "/admin/tenants", icon: FiUsers },
  { name: "CRM", href: "/admin/crm", icon: FiBarChart2 },
  { name: "Billing", href: "/admin/billing", icon: FiDollarSign },
  { name: "Auditor", href: "/admin/auditor", icon: FiShield },
];

export const Sidebar: React.FC = () => {
  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-2xl font-bold">QiEOS Admin</h2>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    isActive ? "bg-gray-900" : "hover:bg-gray-700"
                  }`
                }
              >
                <item.icon className="mr-3 h-6 w-6" />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};
