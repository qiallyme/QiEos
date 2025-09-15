import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth.tsx";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Guarded } from "./components/Guarded";
import { Login } from "./routes/auth/Login";
import { SluggedLogin } from "./routes/auth/SluggedLogin";
import { AuthCallback } from "./routes/auth/Callback";
import { TaskList } from "./modules/tasks/TaskList";
import { CreateTask } from "./modules/tasks/CreateTask";
import { ClientDashboard } from "./routes/client/Dashboard";
import { SluggedDashboard } from "./routes/client/SluggedDashboard";
import { Files } from "./routes/client/Files";
import { KnowledgeBase } from "./routes/client/KnowledgeBase";
import { Profile } from "./routes/client/Profile";
import { PublicKBPage } from "./routes/public/PublicKB";
import { LetterWizard } from "./routes/public/LetterWizard";
import { KB } from "./features/kb";

// New pages
import HomePage from "./pages/index";
import AboutPage from "./pages/about";
import ServicesPage from "./pages/services";
import ContactPage from "./pages/contact";
import TasksPagePublic from "./pages/tasks";
import ProjectsPagePublic from "./pages/projects";
import NotFoundPage from "./pages/404";
import TermsPage from "./pages/terms";
import PrivacyPage from "./pages/privacy";

// Layout components
import { Nav } from "./components/Nav";
import { Footer } from "./components/Footer";

// Admin pages
import { DashboardPage } from "./routes/admin/dashboard";
import { ProjectsPage as AdminProjectsPage } from "./routes/admin/projects";
import { ProjectDetailsPage } from "./routes/admin/projects/details";
import { TasksPage as AdminTasksPage } from "./routes/admin/tasks";
import { TenantsPage } from "./routes/admin/tenants";
import { CrmPage } from "./routes/admin/crm";
import { BillingPage } from "./routes/admin/billing-desk";
import { AuditorPage } from "./routes/admin/auditor";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Nav />
          <main>
            <Routes>
              {/* Marketing routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/letter-wizard" element={<LetterWizard />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />

              {/* App routes */}
              <Route path="/kb/*" element={<KB />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/tasks" element={<TasksPagePublic />} />
              <Route path="/projects" element={<ProjectsPagePublic />} />

              {/* Slugged routes */}
              <Route path="/:slug/login" element={<SluggedLogin />} />
              <Route path="/:slug/auth/callback" element={<AuthCallback />} />

              {/* Protected routes */}
              <Route
                path="/client/tasks"
                element={
                  <ProtectedRoute requiredFeature="tasks">
                    <TaskList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/client/tasks/new"
                element={
                  <ProtectedRoute requiredFeature="tasks">
                    <CreateTask />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/client/files"
                element={
                  <ProtectedRoute>
                    <Files />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/client/kb"
                element={
                  <ProtectedRoute>
                    <KnowledgeBase />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/client/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/client"
                element={
                  <ProtectedRoute>
                    <ClientDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/client/*"
                element={
                  <ProtectedRoute>
                    <div>Client Portal - Coming Soon</div>
                  </ProtectedRoute>
                }
              />

              {/* Slugged protected routes */}
              <Route
                path="/:slug/*"
                element={
                  <Guarded>
                    <Routes>
                      <Route path="dashboard" element={<SluggedDashboard />} />
                      <Route path="tasks" element={<TaskList />} />
                      <Route path="tasks/new" element={<CreateTask />} />
                      <Route path="files" element={<Files />} />
                      <Route path="kb" element={<KnowledgeBase />} />
                      <Route path="profile" element={<Profile />} />
                      <Route
                        path="/"
                        element={<Navigate to="dashboard" replace />}
                      />
                      <Route path="*" element={<div>Page not found</div>} />
                    </Routes>
                  </Guarded>
                }
              />

              <Route
                path="/internal/*"
                element={
                  <ProtectedRoute requiredRole="internal">
                    <div>Internal Portal - Coming Soon</div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Routes>
                      <Route path="dashboard" element={<DashboardPage />} />
                      <Route path="projects" element={<AdminProjectsPage />} />
                      <Route
                        path="projects/:id"
                        element={<ProjectDetailsPage />}
                      />
                      <Route path="tasks" element={<AdminTasksPage />} />
                      <Route path="tenants" element={<TenantsPage />} />
                      <Route path="crm" element={<CrmPage />} />
                      <Route path="billing" element={<BillingPage />} />
                      <Route path="auditor" element={<AuditorPage />} />
                      <Route
                        path="/"
                        element={<Navigate to="dashboard" replace />}
                      />
                    </Routes>
                  </ProtectedRoute>
                }
              />

              {/* Catch all */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
