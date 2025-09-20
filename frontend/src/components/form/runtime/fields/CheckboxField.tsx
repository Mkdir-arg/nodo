import { useFormContext } from "react-hook-form";

export default function CheckboxField({ field }: { field: any }) {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[field.key];

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id={field.key}
          {...register(field.key)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor={field.key} className="text-sm font-medium text-gray-700">
          {field.label}
        </label>
      </div>
      {field.help && (
        <p className="text-xs text-gray-500">{field.help}</p>
      )}
      {error && (
        <p className="text-xs text-red-600">{error.message}</p>
      )}
    </div>
  );
}