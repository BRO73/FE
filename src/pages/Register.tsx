import { useState } from "react";
import { Link } from "react-router-dom";
import AuthHeader from "@/components/login/AuthHeader";
import AuthFooter from "@/components/login/AuthFooter";
import FloatingInput from "@/components/login/FloatingInput";
import LoadingButton from "@/components/login/LoadingButton";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const [formData, setFormData] = useState({
    storeName: "",
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.storeName.trim()) {
      newErrors.storeName = "Tên cửa hàng không được để trống";
    }
    if (!formData.username.trim()) {
      newErrors.username = "Tên đăng nhập không được để trống";
    } else if (formData.username.length < 3) {
      newErrors.username = "Tên đăng nhập phải có ít nhất 3 ký tự";
    }
    if (!formData.password) {
      newErrors.password = "Mật khẩu không được để trống";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }
    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone.replace(/[^\d]/g, ''))) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2500));
      toast({
        title: "Đăng ký thành công!",
        description: `Chào mừng ${formData.username} gia nhập KiotViet.`,
      });
    } catch (error) {
      toast({
        title: "Đăng ký thất bại",
        description: "Có lỗi xảy ra, vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md">
        <AuthHeader />
        
        <div className="auth-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <FloatingInput
              name="storeName"
              type="text"
              label="Tên cửa hàng"
              value={formData.storeName}
              onChange={handleInputChange}
              error={errors.storeName}
            />

            <FloatingInput
              name="username"
              type="text"
              label="Tên đăng nhập"
              value={formData.username}
              onChange={handleInputChange}
              error={errors.username}
            />

            <FloatingInput
              name="password"
              type="password"
              label="Mật khẩu"
              value={formData.password}
              onChange={handleInputChange}
              error={errors.password}
            />

            <FloatingInput
              name="confirmPassword"
              type="password"
              label="Xác nhận mật khẩu"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              error={errors.confirmPassword}
            />

            <FloatingInput
              name="email"
              type="email"
              label="Email (tùy chọn)"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
            />

            <FloatingInput
              name="phone"
              type="tel"
              label="Số điện thoại (tùy chọn)"
              value={formData.phone}
              onChange={handleInputChange}
              error={errors.phone}
              placeholder="0123456789"
            />

            <div className="pt-4">
              <LoadingButton
                type="submit"
                loading={loading}
              >
                Đăng ký
              </LoadingButton>
            </div>
          </form>

          <div className="text-center mt-6">
            <Link to="/login" className="btn-link">
              Đã có tài khoản? Đăng nhập ngay
            </Link>
          </div>
        </div>

        <AuthFooter />
      </div>
    </div>
  );
};

export default Register;