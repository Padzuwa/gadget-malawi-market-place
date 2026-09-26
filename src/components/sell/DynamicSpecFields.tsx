'use client';
// This component renders dynamic specification fields for a product based on the selected category. It fetches the relevant fields from the category-specs library and renders them as form inputs. The values of the fields are managed by the parent component via the `values` prop and the `onChange` callback.
import { getSpecsForCategory } from '@/lib/category-specs';

type Props = {
  categoryName: string;
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
};

export function DynamicSpecFields({ categoryName, values, onChange }: Props) {
  const fields = getSpecsForCategory(categoryName);

  if (fields.length === 0) return null;

  return (
    <div className="gm-form-grid">
      {fields.map((field) => {
        const value = values[field.key] ?? '';

        if (field.type === 'select') {
          return (
            <div key={field.key} className="gm-field">
              <label className="gm-label" htmlFor={`spec-${field.key}`}>
                {field.label}
                {field.required ? ' *' : ''}
              </label>
              <select
                id={`spec-${field.key}`}
                className="gm-select"
                required={field.required}
                value={value}
                onChange={(e) => onChange(field.key, e.target.value)}
              >
                <option value="">Select…</option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          );
        }

        return (
          <div key={field.key} className="gm-field">
            <label className="gm-label" htmlFor={`spec-${field.key}`}>
              {field.label}
              {field.required ? ' *' : ''}
            </label>
            <input
              id={`spec-${field.key}`}
              className="gm-input"
              type={field.type === 'number' ? 'number' : 'text'}
              required={field.required}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => onChange(field.key, e.target.value)}
            />
          </div>
        );
      })}
    </div>
  );
}