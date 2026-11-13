import { Select } from "./Select";

/** Toolbar dropdown: "Status: All ▾" — a native select with a muted inline label (40px). */
export function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <Select
      size="md"
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      options={options}
      leadingIcon={<span className="text-sm leading-5 font-medium">{label}:</span>}
      containerClassName="shrink-0"
      className="field-sizing-content font-medium"
    />
  );
}
