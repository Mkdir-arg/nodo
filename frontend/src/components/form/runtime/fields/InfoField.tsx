'use client';

import { useEffect, useState } from 'react';

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
  
  return (
    <div className="p-2" dangerouslySetInnerHTML={{__html: sanitizedHtml}} />
  );
}
