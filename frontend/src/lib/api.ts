export async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`);
  if (!res.ok) {
    throw new Error('API error');
  }
  return res.json() as Promise<T>;
}
