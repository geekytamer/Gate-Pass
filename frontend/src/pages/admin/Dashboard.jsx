import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("/api/admin/statistics");
        setStats(res.data);
      } catch (error) {
        console.error("Failed to fetch statistics:", error);
      }
    };

    fetchStats();
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <StatCard label="Universities" count={stats.universities} />
        <StatCard label="Students" count={stats.students} />
        <StatCard label="Staff" count={stats.staff} />
        <StatCard label="Accommodations" count={stats.accommodations} />
        <StatCard label="Buses" count={stats.buses} />
      </div>
    </div>
  );
};

const StatCard = ({ label, count }) => (
  <div className="bg-white rounded shadow p-5">
    <div className="text-gray-500 text-sm">{label}</div>
    <div className="text-2xl font-bold">{count}</div>
  </div>
);

export default AdminDashboard;