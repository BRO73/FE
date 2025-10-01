import { Phone } from "lucide-react";

const AuthFooter = () => {
  return (
    <div className="support-footer">
      <div className="flex items-center gap-2">
        <Phone className="w-4 h-4" />
        <span>Hỗ trợ 1900 6522</span>
      </div>
      <div className="flag-vi">
        🇻🇳 <span>VI</span>
      </div>
    </div>
  );
};

export default AuthFooter;