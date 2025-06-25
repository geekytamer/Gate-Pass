// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./pages/Login";
import DashboardPage from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import RegisterStudent from "./pages/university_admin/RegisterStudentPage";
import QRScanner from "./pages/staff/QRScanner";
import StudentsPage from "./pages/university_admin/Students";
import BusesPage from "./pages/university_admin/Buses";
import StudentDetailsPage from "./pages/university_admin/StudentDetailsPage";
import { ToastContainer } from "react-toastify";
import AdminDashboard from "./pages/admin/Dashboard";
import UniversitiesPage from "./pages/admin/UniversitiesPage";
import UniversityDetailsPage from "./pages/admin/UniversityDetailsPage";
import "react-toastify/dist/ReactToastify.css";
import CreateUniversityPage from "./pages/admin/CreateUniversityPage";
import CreateStaffPage from "./pages/admin/CreateStaffPage";
import EditStaffPage from "./pages/admin/EditStaffPage";

function App() {
  return (
    <AuthProvider>
      <ToastContainer position="top-right" autoClose={3000} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/university/register-student"
            element={
              <RoleProtectedRoute allowedRoles={["university_admin"]}>
                <RegisterStudent />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/staff/scan"
            element={
              <RoleProtectedRoute allowedRoles={["staff"]}>
                <QRScanner />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/university/students"
            element={
              <RoleProtectedRoute allowedRoles={["university_admin"]}>
                <StudentsPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/university/buses"
            element={
              <RoleProtectedRoute allowedRoles={["university_admin"]}>
                <BusesPage />
              </RoleProtectedRoute>
            }
          />
          <Route path="/university/students/:id" element={
            <RoleProtectedRoute allowedRoles={["university_admin"]}>
                <StudentDetailsPage />
              </RoleProtectedRoute>
            } />
            <Route
              path="/admin/dashboard"
              element={
                <RoleProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/admin/universities"
              element={
                <RoleProtectedRoute allowedRoles={["admin"]}>
                  <UniversitiesPage />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/admin/universities/:id"
              element={
                <RoleProtectedRoute allowedRoles={["admin"]}>
                  <UniversityDetailsPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/admin/universities/create"
              element={
                <RoleProtectedRoute allowedRoles={["admin"]}>
                  <CreateUniversityPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/admin/universities/:id/staff/create"
              element={
                <RoleProtectedRoute allowedRoles={["admin"]}>
                  <CreateStaffPage />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/admin/universities/:id/staff/:staffId/edit"
              element={
                <RoleProtectedRoute allowedRoles={["admin"]}>
                  <EditStaffPage />
                </RoleProtectedRoute>
              }
            />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
