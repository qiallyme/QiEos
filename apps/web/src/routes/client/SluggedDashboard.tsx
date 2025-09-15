import React from "react";
import { useOrg } from "../../components/OrgContext";
import { useAuth } from "../../hooks/useAuth";

export function SluggedDashboard() {
  const { org, userRole, loading, error } = useOrg();
  const { user, claims } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  if (error || !org) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="mt-2 text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to {org.name}
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                You are signed in as <strong>{user?.email}</strong> with{" "}
                <strong>{userRole}</strong> role.
              </p>

              <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Organization Details
                </h2>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Organization Name
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">{org.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Slug</dt>
                    <dd className="mt-1 text-sm text-gray-900">{org.slug}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Your Role
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">{userRole}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      User ID
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">{user?.id}</dd>
                  </div>
                </dl>
              </div>

              {claims && (
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Available Features
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(claims.features || {}).map(
                      ([feature, enabled]) => (
                        <div key={feature} className="flex items-center">
                          <div
                            className={`w-3 h-3 rounded-full mr-3 ${
                              enabled ? "bg-green-500" : "bg-gray-300"
                            }`}
                          ></div>
                          <span className="text-sm text-gray-900 capitalize">
                            {feature.replace("_", " ")}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-blue-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Slugged Route Authentication Working!
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        You are successfully authenticated for the{" "}
                        <strong>{org.slug}</strong> organization. This
                        demonstrates the slugged route-based multi-tenant
                        authentication system.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
