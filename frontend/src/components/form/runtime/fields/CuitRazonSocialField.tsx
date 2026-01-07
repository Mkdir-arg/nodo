import { useId, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Building2, Search, Loader2 } from 'lucide-react';
import FieldShell from "../ui/FieldShell";
import { baseInputStyles } from "../ui/styles";

export default function CuitRazonSocialField({ field }:{field:any}) {
  const { register, setValue, watch } = useFormContext();
  const autoId = useId();
  const baseId = field.key ?? field.id ?? autoId;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const cuit = watch(`${field.key}.cuit`);
  
  const handleSearch = async () => {
    if (!cuit) return;
    setLoading(true);
    setError('');
    
    try {
      // Mock API call - reemplazar con API real
      await new Promise(resolve => setTimeout(resolve, 1000));
      setValue(`${field.key}.razon_social`, 'EMPRESA EJEMPLO SA');
    } catch (e) {
      setError('No se pudo obtener la razón social');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <FieldShell
        fieldKey={`${field.key}.cuit`}
        label="CUIT"
        required={field.required}
        icon={<Building2 size={16} />}
      >
        <div className="flex gap-2">
          <input
            id={`${baseId}-cuit`}
            className={`${baseInputStyles} flex-1`}
            {...register(`${field.key}.cuit`)}
            placeholder="20-12345678-9"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={loading || !cuit}
            className="
              px-4 py-3 rounded-2xl
              bg-blue-600 hover:bg-blue-700
              text-white font-medium
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
              flex items-center gap-2
            "
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            Buscar
          </button>
        </div>
      </FieldShell>
      
      {error && (
        <div className="p-3 rounded-xl bg-red-50/80 dark:bg-red-900/20 border border-red-200/50 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}
      
      <FieldShell
        fieldKey={`${field.key}.razon_social`}
        label="Razón Social"
        icon={<Building2 size={16} />}
        readonly
      >
        <input
          id={`${baseId}-razon`}
          className={baseInputStyles}
          {...register(`${field.key}.razon_social`)}
          readOnly
          placeholder="Se completará automáticamente"
        />
      </FieldShell>
    </div>
  );
}
