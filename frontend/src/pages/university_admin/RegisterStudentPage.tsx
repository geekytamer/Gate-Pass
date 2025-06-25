import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function RegisterStudentPage() {
  const { token } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    student_name: "",
    student_phone: "",
    accommodation_id: "",
    parent_name: "",
    parent_phone: "",
  });

  type Accommodation = { id: string; name: string };
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  console.log(API);

  useEffect(() => {
    const fetchAccommodations = async () => {
      try {
        const accommodationsURL = new URL("/accommodations", API).toString();
        const res = await axios.get(accommodationsURL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAccommodations(res.data);
      } catch (err) {
        console.error("Failed to load accommodations", err);
      }
    };
    fetchAccommodations();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      await axios.post(
        `${API}/students/register-with-parent`,
        {
          student_name: formData.student_name,
          student_phone: formData.student_phone,
          accommodation_id: formData.accommodation_id,
          parent: {
            name: formData.parent_name,
            phone_number: formData.parent_phone,
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError("❌ Failed to register student and parent.");
    }
    setLoading(false);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Student Information</h2>
            <input
              type="text"
              name="student_name"
              placeholder="Student Name"
              value={formData.student_name}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
            <input
              type="text"
              name="student_phone"
              placeholder="Student Phone"
              value={formData.student_phone}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
            <select
              name="accommodation_id"
              value={formData.accommodation_id}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            >
              <option value="">-- Select Accommodation --</option>
              {accommodations.map((acc: any) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Parent Information</h2>
            <input
              type="text"
              name="parent_name"
              placeholder="Parent Name"
              value={formData.parent_name}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
            <input
              type="text"
              name="parent_phone"
              placeholder="Parent Phone"
              value={formData.parent_phone}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
        );
      case 3:
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Review Information</h2>
            <ul className="text-sm space-y-2">
              <li><strong>Student Name:</strong> {formData.student_name}</li>
              <li><strong>Student Phone:</strong> {formData.student_phone}</li>
              <li>
                <strong>Accommodation:</strong>{" "}
                {
                  accommodations.find((a: any) => a.id === formData.accommodation_id)?.name ||
                  "N/A"
                }
              </li>
              <li><strong>Parent Name:</strong> {formData.parent_name}</li>
              <li><strong>Parent Phone:</strong> {formData.parent_phone}</li>
            </ul>
          </div>
        );
      default:
        return null;
    }
  };

  if (success) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <h2 className="text-green-600 text-xl font-bold">
          ✅ Student and Parent Registered Successfully!
        </h2>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <form className="space-y-6 bg-white p-6 shadow rounded">
        {renderStep()}
        {error && <p className="text-red-600">{error}</p>}
        <div className="flex justify-between pt-4">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Back
            </button>
          )}
          {step < 3 && (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="ml-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Next
            </button>
          )}
          {step === 3 && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="ml-auto bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}