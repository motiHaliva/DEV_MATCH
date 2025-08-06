import type { ChangeEvent } from "react";

export const RadioField = ({ id, name, value, checked, onChange, label }: {
    id: string;
    name: string;
    value: string;
    checked: boolean;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    label: string;
}) => (
    <div className="flex items-center">
        <input
            type="radio"
            id={id}
            name={name}
            value={value}
            checked={checked}
            onChange={onChange}
            className="ml-2"
        />
        <label htmlFor={id} className="text-gray-700 cursor-pointer">
            {label}
        </label>
    </div>
);