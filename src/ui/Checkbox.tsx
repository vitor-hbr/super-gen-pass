import { FaCheck } from "react-icons/fa";

export interface CheckboxProps {
  uuid: string;
  onChange: (checked: boolean) => void;
  checked?: boolean;
  className?: string;
}

export const Checkbox = ({
  uuid,
  checked,
  onChange,
  className,
}: CheckboxProps) => {
  return (
    <button
      id={uuid}
      onClick={() => onChange(!checked)}
      className={`grid h-6 w-6 place-items-center rounded-lg border transition-all ${
        checked
          ? "border-violet-600 bg-violet-600 text-white"
          : "border-white/20 bg-white/5 text-transparent hover:border-violet-500/50 hover:bg-white/10"
      } ${className}`}
      type="button"
    >
      <FaCheck
        className={`h-3 w-3 ${checked ? "scale-100" : "scale-0"} transition-transform duration-200`}
      />
    </button>
  );
};
