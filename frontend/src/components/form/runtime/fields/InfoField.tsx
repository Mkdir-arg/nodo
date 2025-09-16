import DOMPurify from 'isomorphic-dompurify';

export default function InfoField({ field }:{field:any}) {
  if (!field) return null;
  
  try {
    const sanitizedHtml = DOMPurify.sanitize(field.html || '');
    return (
      <div className="p-2" dangerouslySetInnerHTML={{__html: sanitizedHtml}} />
    );
  } catch {
    return <div className="p-2 text-red-500">Error al procesar contenido</div>;
  }
}
