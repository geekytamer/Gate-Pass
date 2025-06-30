import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";

interface ExitRequest {
  exit_method: string;
  status: string;
  requested_at: string;
  approved_at?: string;
}
interface Student {
  id: string;
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
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (!scannerRef.current) {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: 250 },
        false
      );
      scanner.render(
        (decodedText) => {
          if (decodedText !== scannedId) {
            setScannedId(decodedText);
          }
        },
        (err) => {
          console.warn("QR error", err);
          setError(t("scanner.error"));
        }
      );
      scannerRef.current = scanner;
    }
  }, [t, scannedId]);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!scannedId) return;

      try {
        const studentRes = await axios.get(`${API}/students/verify/${scannedId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudent({ ...studentRes.data, id: scannedId });

        try {
          const requestRes = await axios.get(`${API}/students/${scannedId}/latest-request`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setLatestRequest(requestRes.data);
        } catch (err: any) {
          if (err.response?.status === 404) {
            setLatestRequest(null);
          } else {
            console.error(err);
            setError(t("scanner.latest_request_error"));
          }
        }

        const logRes = await axios.get(`${API}/students/${scannedId}/activity-log`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setActivityLog(logRes.data);
        setShowModal(true);
      } catch (err) {
        console.error(err);
        setError(t("scanner.student_fetch_error"));
      }
    };

    fetchDetails();
  }, [scannedId, token, t]);

  const handleCheckIn = async () => {
    if (!student) return;
    try {
      await axios.post(`${API}/students/${student.id}/check-in`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(t("scanner.checkin_success"));
      resetScannerState();
    } catch (err) {
      toast.error(t("scanner.checkin_fail"));
    }
  };

  const handleCheckOut = async () => {
    if (!student) return;
    try {
      await axios.post(`${API}/students/${student.id}/check-out`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(t("scanner.checkout_success"));
      resetScannerState();
    } catch (err) {
      toast.error(t("scanner.checkout_fail"));
    }
  };

  const resetScannerState = () => {
    setShowModal(false);
    setScannedId("");
    setStudent(null);
    setLatestRequest(null);
    setActivityLog([]);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6" dir={i18n.dir()}>
      <Toaster />
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-center">{t("scanner.title")}</h2>
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded"
          onClick={() =>
            i18n.changeLanguage(i18n.language === "en" ? "ar" : "en")
          }
        >
          {i18n.language === "en" ? "العربية" : "English"}
        </button>
      </div>
      <div id="qr-reader" className="mx-auto max-w-md" />
      {error && <p className="text-red-600 mt-4 text-center">{error}</p>}

      {showModal && student && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h3 className="text-xl font-bold mb-2">{student.name}</h3>
            <p className="text-sm text-gray-700 mb-2">📞 {student.phone_number}</p>
            <p className="text-sm text-gray-700 mb-2">
              🏢 {student.accommodation || t("scanner.no_accommodation")}
            </p>

            <div className="mt-4">
              <h4 className="font-semibold">{t("scanner.latest_request")}</h4>
              {latestRequest ? (
                <>
                  <p>{t("scanner.method")}: {latestRequest.exit_method}</p>
                  <p>{t("scanner.status")}: {latestRequest.status}</p>
                  <p>{t("scanner.requested")}: {new Date(latestRequest.requested_at).toLocaleString()}</p>
                  {latestRequest.approved_at && (
                    <p>{t("scanner.approved")}: {new Date(latestRequest.approved_at).toLocaleString()}</p>
                  )}
                </>
              ) : (
                <p className="text-gray-500 italic">{t("scanner.no_request_found")}</p>
              )}
            </div>

            {activityLog.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold">{t("scanner.activity_log")}</h4>
                <ul className="text-sm list-disc pl-5 space-y-1">
                  {activityLog.map((entry: any, idx) => (
                    <li key={idx}>
                      {entry.exit_method} - {entry.status} @ {new Date(entry.requested_at).toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCheckIn}
                disabled={!latestRequest || latestRequest.status !== "completed"}
                className={`px-4 py-2 rounded text-white ${
                  !latestRequest || latestRequest.status !== "completed"
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                ✅ {t("scanner.checkin")}
              </button>

              <button
                onClick={handleCheckOut}
                disabled={!latestRequest || latestRequest.status !== "approved"}
                className={`px-4 py-2 rounded text-white ${
                  !latestRequest || latestRequest.status !== "approved"
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-yellow-600 hover:bg-yellow-700"
                }`}
              >
                🚪 {t("scanner.checkout")}
              </button>

              <button
                onClick={resetScannerState}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                {t("scanner.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}