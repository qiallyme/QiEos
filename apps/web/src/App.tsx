import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./routes/auth/Login";
import { TaskList } from "./modules/tasks/List";
import { CreateTask } from "./modules/tasks/CreateTask";
import { ClientDashboard } from "./routes/client/Dashboard";
import { Files } from "./routes/client/Files";
import { KnowledgeBase } from "./routes/client/KnowledgeBase";
import { Profile } from "./routes/client/Profile";
import { Home } from "./routes/public/Home";
import { PublicKBPage } from "./routes/public/PublicKB";
import { About } from "./routes/public/About";
import { Services } from "./routes/public/Services";
import { Contact } from "./routes/public/Contact";
import { LetterWizard } from "./routes/public/LetterWizard";
import { Terms } from "./routes/public/Terms";
import { Privacy } from "./routes/public/Privacy";
import { MarketingLayout } from "./components/MarketingLayout";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Marketing routes */}
          <Route element={<MarketingLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/letter-wizard" element={<LetterWizard />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
          </Route>

          {/* App routes */}
          <Route path="/kb" element={<PublicKBPage />} />
          <Route path="/auth/login" element={<Login />} />

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
                <div>Admin Portal - Coming Soon</div>
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
