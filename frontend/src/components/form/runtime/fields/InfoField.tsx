'use client';

import { useEffect, useState } from 'react';
import { Info, AlertTriangle, AlertCircle } from 'lucide-react';

export default function InfoField({ field }:{field:any}) {
  const [sanitizedHtml, setSanitizedHtml] = useState('');
  
  useEffect(() => {
    if (typeof window !== 'undefined' && field?.html) {
      import('isomorphic-dompurify').then(({ default: DOMPurify }) => {
        setSanitizedHtml(DOMPurify.sanitize(field.html || ''));
      }).catch(() => {
        setSanitizedHtml(field.html || '');
      });
    }
  }, [field?.html]);
  
  if (!field) return null;
  
  const variant = field.variant || 'info';
  const icons = {
    info: <Info size={20} />,
    warning: <AlertTriangle size={20} />,
    error: <AlertCircle size={20} />
  };
  
  const styles = {
    info: 'bg-blue-50/80 dark:bg-blue-900/20 border-blue-200/50 dark:border-blue-700/50 text-blue-900 dark:text-blue-200',
    warning: 'bg-amber-50/80 dark:bg-amber-900/20 border-amber-200/50 dark:border-amber-700/50 text-amber-900 dark:text-amber-200',
    error: 'bg-red-50/80 dark:bg-red-900/20 border-red-200/50 dark:border-red-700/50 text-red-900 dark:text-red-200'
  };
  
  return (
    <div className={`
      p-4 rounded-2xl backdrop-blur-md border
      ${styles[variant as keyof typeof styles] || styles.info}
      flex items-start gap-3
    `}>
      <div className="flex-shrink-0 mt-0.5">
        {icons[variant as keyof typeof icons] || icons.info}
      </div>
      <div 
        className="flex-1 text-sm"
        dangerouslySetInnerHTML={{__html: sanitizedHtml}} 
      />
    </div>
  );
}
