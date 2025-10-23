const envApiUrl = process.env.NEXT_PUBLIC_API_URL;

if (!envApiUrl) {
	if (process.env.NODE_ENV !== 'production') {
		console.warn('WARNING: NEXT_PUBLIC_API_URL is not set. Defaulting to http://localhost:8000');
	}
}

export const API_URL: string = envApiUrl ?? 'http://localhost:8000';

export async function apiGet(path: string) {
	const res = await fetch(`${API_URL}${path}`);
	if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`);
	return res.json();
}

export async function apiPost<T = any>(path: string, data: T) {
	const res = await fetch(`${API_URL}${path}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	});
	
	if (!res.ok) {
		const error = await res.text().catch(() => res.statusText);
		throw new Error(`POST failed: ${res.status} ${error}`);
	}
	
	return res.json();
}

export async function apiPost1(url: string, data: any) {
  const res = await fetch(`${API_URL}${url}`, {
    method: "POST",
    body: data, // <-- raw FormData, NOT JSON
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error("Upload failed:", res.status, err);
    throw new Error(`Upload failed: ${res.status}`);
  }

  return await res.json();
}

export async function apiDelete(path: string, body?: unknown) {
	const opts: RequestInit = { method: 'DELETE' };
	if (body !== undefined) {
		opts.headers = { 'Content-Type': 'application/json' };
		opts.body = JSON.stringify(body);
	}

	const res = await fetch(`${API_URL}${path}`, opts);
	if (!res.ok) {
		const error = await res.text().catch(() => res.statusText);
		throw new Error(`DELETE failed: ${res.status} ${error}`);
	}

	// If there's content, parse JSON, otherwise return null
	const txt = await res.text();
	return txt ? JSON.parse(txt) : null;
}
