import { useEffect, useState, useRef } from "react";
import type { MutableRefObject } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

interface ExitRequest {
  exit_method: string;
  status: string;
  requested_at: string;
  approved_at?: string;
}
interface Student {
  name: string;
  phone_number: string;
  accommodation: string;
}

const API = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function QRScanner() {
  const { token } = useAuth();
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [scannedId, setScannedId] = useState("");
  const [student, setStudent] = useState<Student | null>(null);
  const [latestRequest, setLatestRequest] = useState<ExitRequest | null>(null);
  const [activityLog, setActivityLog] = useState([]);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!scannerRef.current) {
      const scanner = new Html5QrcodeScanner("qr-reader", {
        fps: 10,
        qrbox: 250,
      }, false);

      scanner.render(
        (decodedText) => {
          if (decodedText !== scannedId) {
            setScannedId(decodedText);
          }
        },
        (err) => {
          console.warn("QR error", err);
          setError("❌ Failed to scan QR code.");
        }
      );
      scannerRef.current = scanner;
    }
  }, []);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!scannedId) return;

      try {
        const studentRes = await axios.get(`${API}/students/verify/${scannedId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudent(studentRes.data);

        try {
          const requestRes = await axios.get(`${API}/students/${scannedId}/latest-request`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setLatestRequest(requestRes.data);
        } catch (err: any) {
          if (err.response?.status === 404) {
            setLatestRequest(null); // No request found is OK
          } else {
            console.error(err);
            setError("❌ Unable to fetch latest request.");
          }
        }

        const logRes = await axios.get(`${API}/students/${scannedId}/activity-log`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setActivityLog(logRes.data);

        setShowModal(true);
      } catch (err) {
        console.error(err);
        setError("❌ Unable to fetch student details.");
      }
    };

    fetchDetails();
  }, [scannedId]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-xl font-bold text-center mb-4">Scan Student QR</h2>
      <div id="qr-reader" className="mx-auto max-w-md" />

      {error && <p className="text-red-600 mt-4 text-center">{error}</p>}

      {showModal && student && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h3 className="text-xl font-bold mb-2">{student.name}</h3>
            <p className="text-sm text-gray-700 mb-2">📞 {student.phone_number}</p>
            <p className="text-sm text-gray-700 mb-2">🏢 {student.accommodation || "No accommodation assigned"}</p>

            <div className="mt-4">
              <h4 className="font-semibold">Latest Exit Request</h4>
              {latestRequest ? (
                <>
                  <p>Method: {latestRequest.exit_method}</p>
                  <p>Status: {latestRequest.status}</p>
                  <p>Requested: {new Date(latestRequest.requested_at).toLocaleString()}</p>
                  {latestRequest.approved_at && (
                    <p>Approved: {new Date(latestRequest.approved_at).toLocaleString()}</p>
                  )}
                </>
              ) : (
                <p className="text-gray-500 italic">No previous exit requests found for this student.</p>
              )}
            </div>

            {activityLog.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold">Activity Log</h4>
                <ul className="text-sm list-disc pl-5 space-y-1">
                  {activityLog.map((entry: any, idx) => (
                    <li key={idx}>
                      {entry.exit_method} - {entry.status} @{" "}
                      {new Date(entry.requested_at).toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => {
                setShowModal(false);
                setScannedId("");
                setStudent(null);
              }}
              className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}