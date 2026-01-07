import { useId, useState } from "react";
import { useFormContext } from "react-hook-form";
import { FileText, Upload, X, Image as ImageIcon } from 'lucide-react';
import FieldShell from "../ui/FieldShell";

export default function DocumentField({ field }:{field:any}) {
  const { register, setValue, watch } = useFormContext();
  const autoId = useId();
  const id = field.key ?? field.id ?? autoId;
  const [preview, setPreview] = useState<string | null>(null);
  const currentValue = watch(field.key);
  
  const isImage = field.type === 'image';
  const icon = isImage ? <ImageIcon size={16} /> : <FileText size={16} />;
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (isImage && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
      }
      setValue(field.key, file.name);
    }
  };
  
  const handleClear = () => {
    setValue(field.key, '');
    setPreview(null);
  };
  
  return (
    <FieldShell
      fieldKey={field.key}
      label={field.label}
      required={field.required}
      helpText={field.help}
      icon={icon}
      disabled={field.disabled}
    >
      <div className="
        p-6 rounded-2xl
        bg-white/70 dark:bg-slate-900/60
        backdrop-blur-md
        border-2 border-dashed border-slate-300/50 dark:border-slate-600/50
        hover:border-slate-400/50 dark:hover:border-slate-500/50
        transition-all duration-200
      ">
        {currentValue || preview ? (
          <div className="space-y-3">
            {preview && (
              <img src={preview} alt="Preview" className="w-full h-32 object-cover rounded-xl" />
            )}
            <div className="flex items-center justify-between p-3 bg-slate-100/60 dark:bg-slate-800/60 rounded-xl">
              <div className="flex items-center gap-2">
                {isImage ? <ImageIcon size={20} /> : <FileText size={20} />}
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {currentValue}
                </span>
              </div>
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              >
                <X size={16} className="text-red-600" />
              </button>
            </div>
          </div>
        ) : (
          <label htmlFor={id} className="flex flex-col items-center gap-3 cursor-pointer">
            <div className="p-4 bg-slate-100/60 dark:bg-slate-800/60 rounded-full">
              <Upload size={24} className="text-slate-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Click para subir {isImage ? 'imagen' : 'archivo'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {field.accept || (isImage ? 'PNG, JPG, GIF' : 'PDF, DOC, DOCX')}
              </p>
            </div>
            <input
              type="file"
              id={id}
              className="hidden"
              accept={field.accept || (isImage ? 'image/*' : '.pdf,.doc,.docx')}
              onChange={handleFileChange}
              disabled={field.disabled}
            />
          </label>
        )}
      </div>
    </FieldShell>
  );
}
