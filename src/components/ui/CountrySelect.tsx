"use client";

import { Select } from "@/components/ui/Select";
import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  POPULAR_COUNTRIES,
  formatCountryLabel,
} from "@/lib/countries";

type CountrySelectProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  name?: string;
  containerClassName?: string;
  className?: string;
  required?: boolean;
};

export function CountrySelect({
  label = "Country",
  value,
  onChange,
  name = "country",
  containerClassName,
  className = "h-11",
  required,
}: CountrySelectProps) {
  const popularNames = new Set(POPULAR_COUNTRIES.map((c) => c.name));
  const rest = COUNTRIES.filter((c) => !popularNames.has(c.name));

  return (
    <Select
      label={label}
      name={name}
      value={value || DEFAULT_COUNTRY}
      onChange={(e) => onChange(e.target.value)}
      containerClassName={containerClassName}
      className={className}
      required={required}
    >
      <option value="">Select country</option>
      <optgroup label="Popular">
        {POPULAR_COUNTRIES.map((country) => (
          <option key={country.code} value={country.name}>
            {formatCountryLabel(country)}
          </option>
        ))}
      </optgroup>
      <optgroup label="All countries">
        {rest.map((country) => (
          <option key={country.code} value={country.name}>
            {formatCountryLabel(country)}
          </option>
        ))}
      </optgroup>
    </Select>
  );
}
