import React, { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, useSearchParams } from "react-router-dom";

export function AuthCallback() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { claims } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check if we have auth tokens in the URL
        const accessToken = searchParams.get("access_token");
        const refreshToken = searchParams.get("refresh_token");

        if (accessToken && refreshToken) {
          // Wait for claims to be loaded
          if (claims) {
            // Determine redirect URL based on user's client slug
            let redirectUrl: string;
            if (claims.client_slug) {
              redirectUrl = `https://${claims.client_slug}.qially.com`;
            } else {
              // Fallback to main site for users without a specific client slug
              redirectUrl = "https://qially.com";
            }

            // Redirect to the appropriate domain
            window.location.href = redirectUrl;
          }
        } else {
          // No tokens in URL, redirect to login
          navigate("/auth/login");
        }
      } catch (err: any) {
        setError(err.message || "Authentication failed");
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [claims, searchParams, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Completing sign in...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h2 className="text-2xl font-bold text-red-600">
              Authentication Error
            </h2>
            <p className="mt-2 text-gray-600">{error}</p>
          </div>
          <button
            onClick={() => navigate("/auth/login")}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
}
