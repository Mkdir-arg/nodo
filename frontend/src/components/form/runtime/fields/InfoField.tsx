export default function InfoField({ field }:{field:any}) {
  return (
    <div className="p-2" dangerouslySetInnerHTML={{__html: field.html || ''}} />
  );
}
