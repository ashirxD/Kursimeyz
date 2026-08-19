import type { ReactNode } from 'react';

/**
 * Form primitives shared by the page editors under pages/admin — the About page
 * and the dashboard hero. They carry those editors' label sizing, helper-text
 * placement and character counters, so they belong together rather than being
 * re-derived per editor.
 */

const INPUT_CLASS =
    'w-full bg-oatmeal/30 px-4 py-3 rounded-xl border border-forest-moss/10 focus:outline-none focus:ring-2 focus:ring-clay/20 focus:border-clay/30 transition-all font-bold text-sm placeholder:text-forest-moss/30 text-forest-moss';

interface FieldShellProps {
    label: string;
    helper?: string;
    /** Shown top-right once the admin is within 20 characters of the cap. */
    counter?: string;
    children: ReactNode;
}

function FieldShell({ label, helper, counter, children }: FieldShellProps) {
    return (
        <div className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-2">
                <label className="block text-[10px] font-black text-forest-moss uppercase tracking-widest">
                    {label}
                </label>
                {counter && (
                    <span className="text-[9px] font-black text-forest-moss/30 tabular-nums">
                        {counter}
                    </span>
                )}
            </div>
            {children}
            {helper && (
                <p className="text-[10px] font-bold text-forest-moss-light/50">{helper}</p>
            )}
        </div>
    );
}

// The counter only appears near the limit, so the form is not littered with
// numbers the admin never needs to think about.
const nearLimit = (value: string, maxLength?: number) =>
    maxLength && value.length > maxLength - 20
        ? `${value.length} / ${maxLength}`
        : undefined;

interface TextFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    helper?: string;
    maxLength?: number;
}

export function TextField({
    label,
    value,
    onChange,
    placeholder,
    helper,
    maxLength,
}: TextFieldProps) {
    return (
        <FieldShell label={label} helper={helper} counter={nearLimit(value, maxLength)}>
            <input
                type="text"
                value={value}
                maxLength={maxLength}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                className={INPUT_CLASS}
            />
        </FieldShell>
    );
}

interface TextAreaFieldProps extends TextFieldProps {
    rows?: number;
}

export function TextAreaField({
    label,
    value,
    onChange,
    placeholder,
    helper,
    maxLength,
    rows = 3,
}: TextAreaFieldProps) {
    return (
        <FieldShell label={label} helper={helper} counter={nearLimit(value, maxLength)}>
            <textarea
                rows={rows}
                value={value}
                maxLength={maxLength}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                className={`${INPUT_CLASS} resize-y leading-relaxed`}
            />
        </FieldShell>
    );
}

interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    /** For screen readers — the visible label is whatever sits next to it. */
    ariaLabel: string;
}

export function Switch({ checked, onChange, ariaLabel }: SwitchProps) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={ariaLabel}
            onClick={(e) => {
                // Lives inside a <summary> sometimes; without this the click would
                // also open or close the disclosure it sits in.
                e.preventDefault();
                e.stopPropagation();
                onChange(!checked);
            }}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                checked ? 'bg-forest-moss' : 'bg-forest-moss/15'
            }`}
        >
            <span
                className={`absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-all ${
                    checked ? 'left-[1.375rem]' : 'left-0.5'
                }`}
            />
        </button>
    );
}

interface ChoiceFieldProps<T extends string> {
    label: string;
    value: T;
    options: Array<{ value: T; label: string; icon?: string }>;
    onChange: (value: T) => void;
    helper?: string;
}

/** A small segmented control, for the two- and three-way choices. */
export function ChoiceField<T extends string>({
    label,
    value,
    options,
    onChange,
    helper,
}: ChoiceFieldProps<T>) {
    return (
        <FieldShell label={label} helper={helper}>
            <div className="flex gap-2">
                {options.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => onChange(option.value)}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border-2 transition-all text-[11px] font-black uppercase tracking-widest ${
                            value === option.value
                                ? 'bg-white border-clay text-forest-moss shadow-soft'
                                : 'bg-oatmeal/30 border-transparent text-forest-moss/40 hover:text-forest-moss/70'
                        }`}
                    >
                        {option.icon && (
                            <span className="material-symbols-outlined !text-base">
                                {option.icon}
                            </span>
                        )}
                        {option.label}
                    </button>
                ))}
            </div>
        </FieldShell>
    );
}

interface EditorCardProps {
    icon: string;
    title: string;
    hint: string;
    defaultOpen?: boolean;
    /** Rendered in the header row, e.g. a section's on/off switch. */
    action?: ReactNode;
    children: ReactNode;
}

/**
 * A collapsible panel built on <details>, so the open/closed state is the
 * browser's business and the editor holds no UI state of its own.
 */
export function EditorCard({
    icon,
    title,
    hint,
    defaultOpen = false,
    action,
    children,
}: EditorCardProps) {
    return (
        <details
            open={defaultOpen}
            className="group bg-white rounded-3xl shadow-soft border border-white/50 overflow-hidden"
        >
            <summary className="flex items-center gap-4 p-5 md:p-6 cursor-pointer list-none select-none [&::-webkit-details-marker]:hidden">
                <div className="size-11 shrink-0 rounded-2xl bg-oatmeal/60 flex items-center justify-center">
                    <span className="material-symbols-outlined !text-2xl text-forest-moss">
                        {icon}
                    </span>
                </div>

                <div className="min-w-0 flex-1">
                    <h3 className="text-base font-black text-forest-moss tracking-tight truncate">
                        {title}
                    </h3>
                    <p className="text-forest-moss-light/60 font-bold text-[11px] truncate">
                        {hint}
                    </p>
                </div>

                {action}

                <span className="material-symbols-outlined text-forest-moss/30 transition-transform group-open:rotate-180">
                    expand_more
                </span>
            </summary>

            <div className="px-5 md:px-6 pb-6 pt-5 space-y-5 border-t border-forest-moss/5">
                {children}
            </div>
        </details>
    );
}

interface RepeatableRowProps {
    title: string;
    index: number;
    total: number;
    onMove: (from: number, to: number) => void;
    onRemove: (index: number) => void;
    children: ReactNode;
}

/** One entry in a list the admin can grow, shrink and reorder. */
export function RepeatableRow({
    title,
    index,
    total,
    onMove,
    onRemove,
    children,
}: RepeatableRowProps) {
    const iconButton =
        'size-7 rounded-full bg-white border border-forest-moss/10 flex items-center justify-center text-forest-moss/50 hover:text-forest-moss transition-all disabled:opacity-25 disabled:cursor-not-allowed';

    return (
        <div className="rounded-2xl border border-forest-moss/10 bg-oatmeal/20 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-forest-moss/40">
                    {title}
                </span>

                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        title="Move up"
                        disabled={index === 0}
                        onClick={() => onMove(index, index - 1)}
                        className={iconButton}
                    >
                        <span className="material-symbols-outlined !text-sm">
                            keyboard_arrow_up
                        </span>
                    </button>
                    <button
                        type="button"
                        title="Move down"
                        disabled={index === total - 1}
                        onClick={() => onMove(index, index + 1)}
                        className={iconButton}
                    >
                        <span className="material-symbols-outlined !text-sm">
                            keyboard_arrow_down
                        </span>
                    </button>
                    <button
                        type="button"
                        title="Remove"
                        onClick={() => onRemove(index)}
                        className="size-7 rounded-full bg-white border border-forest-moss/10 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
                    >
                        <span className="material-symbols-outlined !text-sm">delete</span>
                    </button>
                </div>
            </div>

            {children}
        </div>
    );
}

interface AddRowButtonProps {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    /** Shown instead of the label once the cap is reached. */
    disabledLabel?: string;
}

export function AddRowButton({
    label,
    onClick,
    disabled = false,
    disabledLabel,
}: AddRowButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-forest-moss/15 text-forest-moss/50 font-black text-[11px] uppercase tracking-widest hover:border-clay/50 hover:text-clay transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-forest-moss/15 disabled:hover:text-forest-moss/50"
        >
            <span className="material-symbols-outlined !text-lg">add</span>
            {disabled && disabledLabel ? disabledLabel : label}
        </button>
    );
}

