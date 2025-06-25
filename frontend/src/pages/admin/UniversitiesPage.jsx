// src/pages/admin/UniversitiesPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css"; // Import default styles

const API = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUniversities = async () => {
    try {
      const res = await axios.get(`${API}/admin/universities`, { withCredentials: true });
      setUniversities(res.data);
    } catch (err) {
      toast.error("Failed to fetch universities");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
  confirmAlert({
    title: "Are you sure?",
    message: "This will permanently delete the university.",
    buttons: [
      {
        label: "Yes",
        onClick: async () => {
          try {
            await axios.delete(`${API}/admin/universities/${id}`, { withCredentials: true });
            toast.success("University deleted");
            fetchUniversities();
          } catch (err) {
            toast.error("Failed to delete university");
          }
        },
      },
      {
        label: "Cancel",
      },
    ],
  });
};

  useEffect(() => {
    fetchUniversities();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Universities</h1>
        <button
          onClick={() => navigate("/admin/universities/create")}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          + Add University
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2">Name</th>
              <th className="p-2">ID</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {universities.map((uni) => (
              <tr key={uni.id} className="border-t">
                <td className="p-2">{uni.name}</td>
                <td className="p-2">{uni.id}</td>
                <td className="p-2 space-x-2">
                  <Link
                    to={`/admin/universities/${uni.id}`}
                    className="text-blue-600 underline"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDelete(uni.id)}
                    className="text-red-600 underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}