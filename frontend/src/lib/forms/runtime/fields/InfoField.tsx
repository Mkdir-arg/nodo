"use client";

type Props = {
  field: { label?: string; html?: string; [key: string]: any };
};

export default function InfoField({ field }: Props) {
  return (
    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl shadow-sm">
      {field.label && (
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <h4 className="font-semibold text-blue-900 text-sm">{field.label}</h4>
        </div>
      )}
      {field.html ? (
        <div 
          className="text-sm text-blue-800 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: field.html }}
        />
      ) : (
        <p className="text-sm text-blue-800 leading-relaxed">Texto informativo</p>
      )}
    </div>
  );
}