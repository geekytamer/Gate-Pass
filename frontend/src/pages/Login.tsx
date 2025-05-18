import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API = process.env.REACT_APP_API_URL 

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault(); // ❗ Prevent page refresh
      try {
        const formData = new URLSearchParams();
        formData.append("username", phone); // must be named exactly 'username'
        formData.append("password", password); // must be named exactly 'password'

        const res = await axios.post(`${API}/auth/token`, formData, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        });

          const access_token = res.data.access_token;
        login(access_token);

        const me = await axios.get(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        localStorage.setItem("user", JSON.stringify(me.data)); // ✅ Save user
        window.location.href = "/dashboard";
      } catch (err) {
        alert(err);
        setError("Invalid phone number or password.");
      }
    };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4 text-center">GatePass Login</h2>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <input
          className="w-full p-2 border rounded mt-4"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          type="password"
          className="w-full p-2 border rounded mt-4"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="w-full mt-4 bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </div>
    </div>
  );
}
