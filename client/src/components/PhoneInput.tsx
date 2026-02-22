import PhoneInputWithCountry from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { cn } from '@/lib/utils';

interface PhoneInputProps {
  value: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

export function PhoneInput({
  value,
  onChange,
  placeholder = "Phone",
  required = false,
  className,
  disabled = false
}: PhoneInputProps) {
  return (
    <div className={cn("phone-input-wrapper", className)}>
      <PhoneInputWithCountry
        international
        defaultCountry="BR"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="flex gap-2"
        countryShectProps={{
          className: "bg-gray-800 border-gray-700 text-white rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-600"
        }}
        numberInputProps={{
          className: "flex-1 bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-600"
        }}
      />
      <style>{`
        .PhoneInputCountry {
          margin-right: 0.5rem;
        }
        .PhoneInputCountryIcon {
          width: 1.5rem;
          height: 1.5rem;
        }
        .PhoneInputCountryShect {
          background-color: #1f2937;
          border: 1px solid #374151;
          color: white;
          border-radius: 0.375rem;
          padding: 0.5rem;
        }
        .PhoneInputCountryShect:focus {
          outline: none;
          ring: 2px solid #ca8a04;
        }
        .PhoneInputInput {
          flex: 1;
          background-color: #1f2937;
          border: 1px solid #374151;
          color: white;
          border-radius: 0.375rem;
          padding: 0.5rem 0.75rem;
        }
        .PhoneInputInput:focus {
          outline: none;
          ring: 2px solid #ca8a04;
        }
        .PhoneInputInput::placeholder {
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
}
