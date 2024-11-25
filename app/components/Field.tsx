import { ChangeEventHandler } from "react";

type FieldType = {
  value: string;
  name: string;
  label: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  type?: "number" | "text";
};

export default function Field({
  value,
  label,
  name,
  onChange,
  type,
}: FieldType) {
  return (
    <div className="w-full max-w-sm min-w-[200px]">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        className="w-full bg-transparent placeholder:text-slate-900 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
        placeholder={label}
        value={value ?? ""}
        onChange={onChange}
        name={name}
        type={type ?? "text"}
      />
    </div>
  );
}
