import { isAxiosError } from "axios";

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

import React, { useEffect, useRef, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import api from "@/api/axiosInstance"; 

const firebaseConfig = {
  apiKey: "AIzaSyD8hix0NuxQVeE-9CmRjW7MLlwel6MYwPI",
  authDomain: "login-otp-swp301.firebaseapp.com",
  projectId: "login-otp-swp301",
  storageBucket: "login-otp-swp301.firebasestorage.app",
  messagingSenderId: "336452696231",
  appId: "1:336452696231:web:c2db565166954183fbc382"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.languageCode = "vi";

const FirebaseOtpLogin: React.FC = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp" | "register">("phone");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const confirmationResultRef = useRef<any>(null);

  const log = (msg: string) => setMessage(msg);

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "normal",
      });
      window.recaptchaVerifier.render();
    }
  }, []);

  // 📨 Gửi OTP
  const sendOtp = async () => {
    if (!phone) return log("Nhập số điện thoại.");
    let e164 = phone;
    if (phone.startsWith("0")) e164 = "+84" + phone.substring(1);
    else if (!phone.startsWith("+84")) e164 = "+84" + phone;

    setLoading(true);
    log("Đang gửi OTP...");
    try {
      const result = await signInWithPhoneNumber(auth, e164, window.recaptchaVerifier);
      confirmationResultRef.current = result;
      setStep("otp");
      log("Đã gửi OTP. Kiểm tra tin nhắn SMS.");
    } catch (e: any) {
      log("Gửi OTP thất bại: " + (e.message || e));
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.render();
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Xác thực OTP
  const verifyOtp = async () => {
  const confirmationResult = confirmationResultRef.current;
  if (!confirmationResult || !otp) return log("Thiếu mã OTP.");
  setLoading(true);
  log("Đang xác thực...");
  try {
    const result = await confirmationResult.confirm(otp);
    const user = result.user;
    const idToken = await user.getIdToken(true);

    // Gọi backend để xác thực và lấy accessToken
    const resp = await api.post(`/auth/verify-firebase?idToken=${encodeURIComponent(idToken)}`);
    localStorage.setItem("accessToken", resp.data.accessToken);
    log("Đăng nhập thành công! Vui lòng hoàn tất hồ sơ.");

    // Nếu backend trả flag isNewUser
    if (resp.data.isNewUser) {
      setStep("register");
    } else {
      window.location.href = "/";
    }

  } catch (e: any) {
    if (isAxiosError(e)) {
      const status = e.response?.status;
      const message = e.response?.data?.message || e.message;

      if (status === 401) {
        // 🔥 Nếu backend trả 401 → user chưa tồn tại
        log("Tài khoản chưa tồn tại. Vui lòng hoàn tất hồ sơ đăng ký.");
        setStep("register"); // 👉 chuyển qua form đăng ký
        return;
      }

      log("Xác thực OTP thất bại: " + message);
    } else {
      log("Xác thực OTP thất bại: " + (e.message || String(e)));
    }
  } finally {
    setLoading(false);
  }
};


  // 👤 Đăng ký profile
  const registerProfile = async () => {
    if (!fullName) return log("Nhập họ tên.");
    setLoading(true);
    log("Đang xử lý...");
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        // Trường hợp token không có vì lý do nào đó, rollback luôn
        throw { response: { status: 401 } }; 
      }
      
      const resp = await api.post(
        "/auth/register-customer",
        {
          phoneNumber: phone,
          fullName,
          email,
          address,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      log("Hoàn tất! Tài khoản đã được tạo.");
      console.log("Final response:", resp.data);
      // Có thể chuyển hướng người dùng sau khi đăng ký thành công
      window.location.href = "/dashboard";
      
    } catch (e: any) {
      // =======================================================
      // ▼▼▼ THAY ĐỔI LOGIC XỬ LÝ LỖI Ở ĐÂY ▼▼▼
      // =======================================================
      if (isAxiosError(e) && e.response?.status === 401) {
        // Lỗi 401: Token không hợp lệ hoặc hết hạn -> Rollback!
        log("Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
        localStorage.removeItem("accessToken"); // Xóa token hỏng
        setStep("phone"); // Đưa về bước nhập SĐT

        // Reset các state để làm sạch form
        setPhone("");
        setOtp("");
        setFullName("");
        setEmail("");
        setAddress("");
        confirmationResultRef.current = null;
      } else {
        // Các lỗi khác (500, lỗi mạng, validation...)
        const errorMessage = isAxiosError(e) ? e.response?.data?.message || e.message : e.message || String(e);
        log("Đăng ký thất bại: " + errorMessage);
      }
      // =======================================================
      // ▲▲▲ KẾT THÚC THAY ĐỔI ▲▲▲
      // =======================================================
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-md space-y-4">
        <h1 className="text-2xl font-bold text-center mb-4">
          Đăng nhập bằng OTP (Firebase)
        </h1>

        {step === "phone" && (
          <>
            <input
              type="tel"
              placeholder="0xxxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring"
            />
            <div id="recaptcha-container" className="my-2 flex justify-center"></div>
            <button
              onClick={sendOtp}
              disabled={loading}
              className="w-full py-2 bg-black text-white rounded-2xl hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Đang gửi..." : "Gửi OTP"}
            </button>
          </>
        )}

        {step === "otp" && (
          <>
            <input
              type="number"
              placeholder="Nhập mã OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border rounded-xl px-3 py-2"
            />
            <button
              onClick={verifyOtp}
              disabled={loading}
              className="w-full py-2 bg-black text-white rounded-2xl hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Đang xác thực..." : "Xác thực & Đăng nhập"}
            </button>
          </>
        )}

        {step === "register" && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Hoàn tất hồ sơ</h2>
            <input
              type="text"
              placeholder="Họ tên (*)"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border rounded-xl px-3 py-2"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-xl px-3 py-2"
            />
            <input
              type="text"
              placeholder="Địa chỉ"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border rounded-xl px-3 py-2"
            />
            <button
              onClick={registerProfile}
              disabled={loading}
              className="w-full py-2 bg-black text-white rounded-2xl hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Đang lưu..." : "Lưu thông tin"}
            </button>
          </div>
        )}

        {message && <p className="text-sm text-gray-600 text-center">{message}</p>}
      </div>
    </div>
  );
};

export default FirebaseOtpLogin;