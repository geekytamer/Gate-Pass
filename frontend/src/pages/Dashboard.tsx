import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function DashboardPage() {
  const { logout, user } = useAuth();

  const isAdmin = user?.role === "admin";
  const isUniversityAdmin = user?.role === "university_admin";
  const isStaff = user?.role === "staff";

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-3xl font-bold mb-2">Welcome, {user?.name} 👋</h1>
      <p className="text-gray-600 mb-8 text-sm">
        You are logged in as <code>{user?.role}</code>
      </p>

      <div className="flex flex-col space-y-4 w-full max-w-xs">
        {isAdmin && (
          <>
            <Link
              to="/admin/universities"
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded shadow"
            >
              Manage Universities
            </Link>
            <Link
              to="/admin/accommodations"
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded shadow"
            >
              Manage Accommodations
            </Link>
          </>
        )}

        {isUniversityAdmin && (
          <>
            <Link
              to="/university/students"
              className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded shadow"
            >
              Students
            </Link>
            <Link
              to="/university/register-student"
              className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded shadow"
            >
              Register Student
            </Link>
            <Link
              to="/university/buses"
              className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded shadow"
            >
              Manage Buses
            </Link>
            <Link
              to="/university/requests"
              className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded shadow"
            >
              Exit Requests
            </Link>
          </>
        )}

        {isStaff && (
          <Link
            to="/staff/scan"
            className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded shadow"
          >
            Scan QR Code
          </Link>
        )}

        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded shadow mt-6"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
