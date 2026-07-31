import { useState } from "react";
import { inputCls, labelCls } from "../utils/formStyles";

function editFieldTestId(label: string): string {
  return `edit-field-${label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}`;
}

export function EditText({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  min,
  max,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  min?: string | number;
  max?: string | number;
  maxLength?: number;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input
        type={type}
        data-testid={editFieldTestId(label)}
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

export function EditSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: T[];
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <select
        data-testid={editFieldTestId(label)}
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

export function EditCombo({
  label,
  value,
  options,
  onChange,
  placeholder,
  maxLength,
}: {
  label: string;
  value: string | null;
  options: string[];
  onChange: (v: string | null) => void;
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
      <label className={labelCls}>{label}</label>
      <select
        data-testid={editFieldTestId(label)}
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
          data-testid={`${editFieldTestId(label)}-custom`}
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
