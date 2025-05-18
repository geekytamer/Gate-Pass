import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function StudentDetailsPage() {
  const { token } = useAuth();
  const { id } = useParams();
  const [student, setStudent] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axios.get(`${API}/students/${id}/details`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudent(res.data);
      } catch (err) {
        setError("❌ Failed to fetch student details");
        console.error(err);
      }
    };

    fetchDetails();
  }, [id]);

  if (error) return <p className="text-red-500 text-center mt-6">{error}</p>;
  if (!student) return <p className="text-center mt-6">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow mt-6">
      <h2 className="text-2xl font-bold mb-4">{student.name}</h2>
      <p>📞 Phone: {student.phone_number}</p>
      <p>🏢 Accommodation: {student.accommodation || "N/A"}</p>

      {student.parent && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Parent</h3>
          <p>Name: {student.parent.name}</p>
          <p>Phone: {student.parent.phone_number}</p>
        </div>
      )}

      {student.current_request && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Current Request</h3>
          <p>Method: {student.current_request.exit_method}</p>
          <p>Status: {student.current_request.status}</p>
          <p>Requested: {new Date(student.current_request.requested_at).toLocaleString()}</p>
          {student.current_request.approved_at && (
            <p>Approved: {new Date(student.current_request.approved_at).toLocaleString()}</p>
          )}
        </div>
      )}

      {student.activity_log.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <ul className="list-disc ml-6">
            {student.activity_log.map((entry: any, idx: number) => (
              <li key={idx}>
                {entry.exit_method} - {entry.status} at{" "}
                {new Date(entry.requested_at).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}