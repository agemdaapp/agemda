'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Toggle({
  checked: controlledChecked,
  onChange,
  label,
  disabled = false,
}: ToggleProps) {
  const [uncontrolledChecked, setUncontrolledChecked] = useState(false);
  const checked = controlledChecked !== undefined ? controlledChecked : uncontrolledChecked;

  const handleChange = () => {
    if (disabled) return;
    const newValue = !checked;
    if (onChange) {
      onChange(newValue);
    } else {
      setUncontrolledChecked(newValue);
    }
  };

  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={cn(
            'w-11 h-6 rounded-full transition-colors duration-200',
            checked ? 'bg-black' : 'bg-gray-300',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <div
            className={cn(
              'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200',
              checked && 'translate-x-5'
            )}
          />
        </div>
      </div>
      {label && (
        <span className={cn('text-sm font-medium', disabled && 'opacity-50')}>
          {label}
        </span>
      )}
    </label>
  );
}

