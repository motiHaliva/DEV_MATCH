type ButtonProps = {
  text?: string;
  variant?: "google" | "primary" | "icon" | "blue" | "green"|"text";
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
};

const variantClasses = {
  google: "text-text-black border border-black rounded-md hover:bg-brand-grayLight w-full",
  primary: "bg-black text-white rounded-md w-full",
  icon: "p-2 rounded-full hover:bg-gray-100",
  blue: "bg-gradient-to-r from-brand-gradientStart to-brand-gradientEnd text-white px-6 py-2 rounded-lg font-semibold shadow hover:scale-105 transition w-2/3 cursor-pointer",
  green: "bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:scale-105 transition w-2/3 cursor-pointer",
  text: "bg-transparent text-blue-500 hover:text-blue-700 text-xs font-semibold"

};

const Button = ({
  text,
  variant = "google",
  icon,
  onClick,
  className = "",
  type = "button",
  disabled = false,
}: ButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 ${variantClasses[variant]} ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {icon}
      {text}
    </button>
  );
};

export default Button;