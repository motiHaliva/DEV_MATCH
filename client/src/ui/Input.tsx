import React from "react";

type InputProps = {
  label?: string;
  variant?: "outline" | "search";
  icon?: React.ReactNode;
  type?: string;
  placeholder?: string;
  className?: string;
  value?: string;
  name?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;

};

const variantClasses = {
  outline: "border border-gray-400 rounded-md",
  search: "bg-gray-100 rounded-full px-4 py-2"
};

const Input = ({
  label,
  variant = "outline",
  icon,
  type = "text",
  placeholder = "",
  className = "",
  value = "",
  name = "",
  onChange,

}: InputProps) => {
  return (
    <div className={` ${className} py-2 `}>
      <label className="block mb-2 font-semibold">{label}</label>

      <div className="relative ">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </span>
        )}

        <input
          onChange={onChange}

          value={value}
          type={type}
          name={name}
          placeholder={placeholder}
          className={`w-full pl-9 py-2 placeholder:text-gray-400 hover:bg-brand-grayLight ${variantClasses[variant]}`}
        />
      </div>
    </div>
  );
};

export default Input;
