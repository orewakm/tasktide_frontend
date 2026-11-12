import { useId, type InputHTMLAttributes } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    // Hide the label visually but keep it for screen readers.
    hideLabel?: boolean;
    hint?: string;
    error?: string;
}

export const inputClass =
    'w-full rounded-lg border bg-surface px-3 text-sm text-ink transition-[border-color,box-shadow] duration-150 placeholder:text-muted focus:border-accent focus:ring-3 focus:ring-accent/15 focus-visible:outline-none';

export function TextField({ label, hideLabel, hint, error, className = '', ...inputProps }: TextFieldProps) {
    const id = useId();
    const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            <label htmlFor={id} className={hideLabel ? 'sr-only' : 'text-[13px] font-medium text-ink'}>
                {label}
            </label>
            <input
                id={id}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy}
                {...inputProps}
                className={`${inputClass} h-10 ${error ? 'border-danger' : 'border-line'}`}
            />
            {error ? (
                <p id={`${id}-error`} className="text-[13px] text-danger">
                    {error}
                </p>
            ) : hint ? (
                <p id={`${id}-hint`} className="text-[13px] text-muted">
                    {hint}
                </p>
            ) : null}
        </div>
    );
}
