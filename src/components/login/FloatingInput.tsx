import { forwardRef } from "react";

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="floating-input-group">
        <input
          ref={ref}
          className={`floating-input ${error ? 'border-destructive focus:border-destructive focus:ring-destructive/30' : ''} ${className}`}
          placeholder=" "
          {...props}
        />
        <label className={`floating-label ${error ? 'text-destructive' : ''}`}>
          {label}
        </label>
        {error && (
          <p className="text-destructive text-xs mt-1 px-1">{error}</p>
        )}
      </div>
    );
  }
);

FloatingInput.displayName = "FloatingInput";

export default FloatingInput;