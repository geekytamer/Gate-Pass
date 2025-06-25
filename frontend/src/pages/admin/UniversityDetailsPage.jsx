import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function UniversityDetailsPage() {
  const { id: universityId } = useParams();
  const navigate = useNavigate();
  const [university, setUniversity] = useState(null);
  const [staff, setStaff] = useState([]);
  const [name, setName] = useState("");

  const fetchData = async () => {
    try {
      const [uniRes, staffRes] = await Promise.all([
        axios.get(`${API}/admin/universities/${universityId}`, { withCredentials: true }),
        axios.get(`${API}/admin/universities/${universityId}/staff`, { withCredentials: true }),
      ]);
      setUniversity(uniRes.data);
      setName(uniRes.data.name);
      setStaff(staffRes.data);
    } catch {
      toast.error("Failed to load university");
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${API}/admin/universities/${universityId}`, { name }, { withCredentials: true });
      toast.success("University updated");
      fetchData();
    } catch {
      toast.error("Update failed");
    }
  };

  const handleDelete = () => {
    confirmAlert({
      title: "Delete University",
      message: "Are you sure you want to delete this university?",
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            try {
              await axios.delete(`${API}/admin/universities/${universityId}`, { withCredentials: true });
              toast.success("Deleted");
              navigate("/admin/universities");
            } catch {
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
    fetchData();
  }, []);

  if (!university) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">University Details</h2>

      <div>
        <label className="block mb-2 font-semibold">University Name</label>
        <input
          className="border px-3 py-2 rounded w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          onClick={handleUpdate}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Update
        </button>
        <button
          onClick={handleDelete}
          className="ml-2 mt-2 bg-red-600 text-white px-4 py-2 rounded"
        >
          Delete University
        </button>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-semibold">Staff Members</h3>
          <Link to={`/admin/universities/${universityId}/staff/create`}>
            <button className="bg-green-600 text-white px-4 py-2 rounded">
              + Add Staff
            </button>
          </Link>
        </div>
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Phone</th>
              <th className="p-2">Role</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-2">{s.name}</td>
                <td className="p-2">{s.phone_number}</td>
                <td className="p-2">{s.role}</td>
                <td className="p-2">
                  <Link
                    to={`/admin/universities/${universityId}/staff/${s.id}/edit`}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}