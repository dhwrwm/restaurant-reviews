const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

const NO_REFRESH_RETRY_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
];

let refreshPromise: Promise<boolean> | null = null;

function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function fetcher<T>(path: string, init?: RequestInit): Promise<T> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE_URL}${normalizedPath}`;
  const request = () =>
    fetch(url, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
      ...init,
    });

  let response = await request();

  if (
    response.status === 401 &&
    !NO_REFRESH_RETRY_PATHS.includes(normalizedPath) &&
    (await refreshAccessToken())
  ) {
    response = await request();
  }

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message ?? "Something went wrong");
  }

  return response.json();
}
