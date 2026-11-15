import type { HTMLInputTypeAttribute } from "react";
import styles from "./FormField.module.css";

export function FieldRequirement({ required = false }: { required?: boolean }) {
  return <span className={styles["SL-el_form-field__requirement"]} data-required={required} aria-hidden="true">{required ? "必須" : "任意"}</span>;
}

export function FormField({ id, name, label, value, onChange, required, hint, error, multiline, inputMode, type = "text", placeholder }: {
  id: string; name: string; label: string; value: string; onChange: (value: string) => void;
  required?: boolean; hint?: string; error?: string; multiline?: boolean; inputMode?: "text" | "numeric" | "decimal"; type?: HTMLInputTypeAttribute; placeholder?: string;
}) {
  const shared = { id, name, value, required, placeholder, "aria-invalid": error ? true as const : undefined, "aria-describedby": [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined };
  return <div className={styles["SL-el_form-field"]}>
    <label htmlFor={id}>{label}<FieldRequirement required={required} /></label>
    {multiline ? <textarea {...shared} rows={2} onChange={(event) => onChange(event.target.value)} /> : <input {...shared} type={type} inputMode={inputMode} onChange={(event) => onChange(event.target.value)} />}
    {hint && <p id={`${id}-hint`}>{hint}</p>}
    {error && <p id={`${id}-error`} role="alert" className={styles["SL-el_form-field__error"]}>{error}</p>}
  </div>;
}
