import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { OrgProvider, useOrg } from "./OrgContext";

interface GuardedProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredFeature?: string;
}

// Inner component that uses the org context
function GuardedInner({
  children,
  requiredRole,
  requiredFeature,
}: GuardedProps) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, claims, loading: authLoading } = useAuth();
  const { org, userRole, loading: orgLoading, error: orgError } = useOrg();

  useEffect(() => {
    const checkAccess = async () => {
      if (authLoading || orgLoading) return;

      // First check if user is authenticated
      if (!user || !claims) {
        navigate(`/${slug}/login`, { replace: true });
        return;
      }

      // Check if org context loaded successfully
      if (orgError || !org) {
        // Error will be displayed in the UI
        return;
      }

      // Check role requirement if specified
      if (requiredRole && userRole !== requiredRole) {
        // Role mismatch will be displayed in the UI
        return;
      }

      // Check feature requirement if specified
      if (requiredFeature && !claims.features?.[requiredFeature]) {
        // Feature not available will be displayed in the UI
        return;
      }
    };

    checkAccess();
  }, [
    slug,
    user,
    claims,
    authLoading,
    orgLoading,
    org,
    userRole,
    navigate,
    requiredRole,
    requiredFeature,
  ]);

  if (authLoading || orgLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Check authentication
  if (!user || !claims) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Check org access
  if (orgError || !org) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
            <p className="mt-2 text-gray-600">
              {orgError ||
                "You do not have permission to access this workspace."}
            </p>
            {orgError?.includes("not found") && (
              <p className="mt-2 text-sm text-gray-500">
                The workspace "{slug}" does not exist or you may have the wrong
                URL.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => navigate(`/${slug}/login`)}
              className="block w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
            >
              Back to Login
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="block w-full bg-gray-200 text-gray-800 hover:bg-gray-300 px-4 py-2 rounded-md"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check role requirement
  if (requiredRole && userRole !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h2 className="text-2xl font-bold text-red-600">
              Insufficient Permissions
            </h2>
            <p className="mt-2 text-gray-600">
              You need {requiredRole} role to access this page. Your current
              role is {userRole}.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/${slug}/dashboard`)}
            className="block w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Check feature requirement
  if (requiredFeature && !claims.features?.[requiredFeature]) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h2 className="text-2xl font-bold text-red-600">
              Feature Not Available
            </h2>
            <p className="mt-2 text-gray-600">
              The {requiredFeature} feature is not enabled for your
              organization.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/${slug}/dashboard`)}
            className="block w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Main Guarded component that provides org context
export function Guarded(props: GuardedProps) {
  return (
    <OrgProvider>
      <GuardedInner {...props} />
    </OrgProvider>
  );
}
