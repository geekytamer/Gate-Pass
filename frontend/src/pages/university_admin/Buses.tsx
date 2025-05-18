import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function BusesPage() {
  const { token } = useAuth();

  const [buses, setBuses] = useState([]);
  const [accommodations, setAccommodations] = useState([]);
  const [form, setForm] = useState({
    name: "",
    destination_district: "",
    accommodation_id: "",
  });
  const [busToDelete, setBusToDelete] = useState<string | null>(null);

  
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const busRes = await axios.get(`${API}/university/buses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBuses(busRes.data);

        const accRes = await axios.get(`${API}/accommodations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAccommodations(accRes.data);
      } catch (err) {
        console.error("Error loading buses or accommodations", err);
      }
    };

    fetchData();
  }, [token]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/university/buses`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({ name: "", destination_district: "", accommodation_id: "" });
      const res = await axios.get(`${API}/university/buses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBuses(res.data);
    } catch {
      alert("❌ Failed to add bus.");
    }
  };

  const handleDelete = async () => {
    if (!busToDelete) return;
    try {
      await axios.delete(`${API}/university/buses/${busToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBuses(buses.filter((b: any) => b.id !== busToDelete));
      setBusToDelete(null);
    } catch {
      alert("❌ Failed to delete bus.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Buses</h1>

      <form
        onSubmit={handleBusSubmit}
        className="space-y-4 mb-10 bg-white p-6 shadow rounded max-w-xl"
      >
        <h2 className="text-lg font-semibold">Add New Bus</h2>

        <input
          type="text"
          name="name"
          placeholder="Bus Name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded"
        />

        <input
          type="text"
          name="destination_district"
          placeholder="Destination"
          value={form.destination_district}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded"
        />

        <select
          name="accommodation_id"
          value={form.accommodation_id}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Select Accommodation</option>
          {accommodations.map((acc: any) => (
            <option key={acc.id} value={acc.id}>
              {acc.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add Bus
        </button>
      </form>

      <table className="w-full bg-white shadow rounded">
        <thead className="bg-gray-200 text-left text-sm">
          <tr>
            <th className="p-2">Name</th>
            <th className="p-2">Destination</th>
            <th className="p-2">Accommodation</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {buses.map((bus: any) => (
            <tr key={bus.id} className="border-t">
              <td className="p-2">{bus.name}</td>
              <td className="p-2">{bus.destination_district}</td>
              <td className="p-2">{bus.accommodation_name || "N/A"}</td>
              <td className="p-2">
                <button
                  onClick={() => setBusToDelete(bus.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Delete Confirmation Modal */}
      {busToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <p className="mb-4 text-lg font-medium">
              Are you sure you want to delete this bus?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setBusToDelete(null)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
