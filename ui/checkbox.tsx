import { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa";

export interface CheckboxProps {
  uuid: string;
  setChecked: (checked: any) => void;
  checked?: boolean;
  className?: string;
}

export const Checkbox = ({
  uuid,
  checked,
  setChecked,
  className,
}: CheckboxProps) => {
  return (
    <button
      id={uuid}
      onClick={() => setChecked((checked) => !checked)}
      className={`w-8 h-8 bg-white hover:bg-slate-900 rounded p-2 text-violet-600 hover:text-white transition-all ${className}`}
    >
      {checked && <FaCheck />}
    </button>
  );
};
