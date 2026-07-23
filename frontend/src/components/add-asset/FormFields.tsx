import { useState } from "react";
import { inputCls, labelCls } from "../../utils/formStyles";

export const Req = () => <span className="text-red-400 ml-0.5">*</span>;

export function FText({
  label,
  value,
  onChange,
  req,
  type = "text",
  placeholder,
  colSpan,
  min,
  max,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  req?: boolean;
  type?: string;
  placeholder?: string;
  colSpan?: boolean;
  min?: number;
  max?: number;
  maxLength?: number;
}) {
  return (
    <div className={colSpan ? "col-span-full" : ""}>
      <label className={labelCls}>
        {label}
        {req && <Req />}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        min={min}
        max={max}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
      />
    </div>
  );
}

export function FSelect<T extends string>({
  label,
  value,
  options,
  onChange,
  req,
}: {
  label: string;
  value: T;
  options: readonly T[] | T[];
  onChange: (v: T) => void;
  req?: boolean;
}) {
  return (
    <div>
      <label className={labelCls}>
        {label}
        {req && <Req />}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className={`${inputCls} cursor-pointer`}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

export function FCombo({
  label,
  value,
  options,
  onChange,
  req,
  placeholder,
  maxLength,
}: {
  label: string;
  value: string | null;
  options: string[];
  onChange: (v: string | null) => void;
  req?: boolean;
  placeholder?: string;
  maxLength?: number;
}) {
  const startsCustom = value !== null && value !== "" && !options.includes(value);
  const [customMode, setCustomMode] = useState(startsCustom);
  const [customText, setCustomText] = useState(startsCustom ? (value ?? "") : "");
  const selectVal = customMode ? "__custom__" : (value ?? "");

  function handleSelect(v: string) {
    if (v === "__custom__") {
      setCustomMode(true);
    } else if (v === "") {
      setCustomMode(false);
      onChange(null);
    } else {
      setCustomMode(false);
      onChange(v);
    }
  }
  function handleCustom(v: string) {
    setCustomText(v);
    onChange(v || null);
  }

  return (
    <div>
      <label className={labelCls}>
        {label}
        {req && <Req />}
      </label>
      <select
        value={selectVal}
        onChange={(e) => handleSelect(e.target.value)}
        className={`${inputCls} cursor-pointer`}
      >
        <option value="">—</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
        <option value="__custom__">Custom…</option>
      </select>
      {customMode && (
        <input
          autoFocus
          type="text"
          value={customText}
          placeholder={placeholder ?? "Enter value"}
          maxLength={maxLength}
          onChange={(e) => handleCustom(e.target.value)}
          className={`${inputCls} mt-2`}
        />
      )}
    </div>
  );
}
