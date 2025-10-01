import { ButtonHTMLAttributes, ReactNode } from "react";

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: ReactNode;
  variant?: "auth" | "secondary";
}

const LoadingButton = ({ 
  loading = false, 
  children, 
  variant = "auth",
  disabled,
  className = "",
  ...props 
}: LoadingButtonProps) => {
  const baseClass = variant === "auth" ? "btn-auth" : "btn-secondary";
  
  return (
    <button
      className={`${baseClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="loading-spinner" />
      )}
      <span className={loading ? 'opacity-70' : ''}>{children}</span>
    </button>
  );
};

export default LoadingButton;