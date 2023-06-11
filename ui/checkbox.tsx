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
      className={`grid h-6 w-6 place-items-center rounded bg-white p-1 text-violet-600 transition-all hover:bg-slate-900 hover:text-white ${className}`}
    >
      {checked && <FaCheck className="h-4 w-4" />}
    </button>
  );
};
