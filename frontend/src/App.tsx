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

function App() {
  return (
    <AuthProvider>
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
