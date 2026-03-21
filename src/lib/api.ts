export const apiGatewayUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

export async function refreshAuthToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
        handleAuthFailure();
        return false;
    }

    try {
        const refreshRes = await fetch(`${apiGatewayUrl}/api/v1/auth/refresh-token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
        });

        if (refreshRes.ok) {
            const data = await refreshRes.json();
            if (data.accessToken) localStorage.setItem("token", data.accessToken);
            if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
            return true;
        } else {
            handleAuthFailure();
            return false;
        }
    } catch (e) {
        console.error("Token refresh error", e);
        handleAuthFailure();
        return false;
    }
}

export async function fetchWithAuth(url: string, init?: RequestInit): Promise<Response> {
    let token = localStorage.getItem("token");
    const headers = new Headers(init?.headers);

    if (token && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    let response = await fetch(url, { ...init, headers });

    if (response.status === 401) {
        const refreshed = await refreshAuthToken();
        if (refreshed) {
            token = localStorage.getItem("token");
            if (token) headers.set("Authorization", `Bearer ${token}`);
            response = await fetch(url, { ...init, headers });
        }
    }

    return response;
}

export function handleAuthFailure() {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");

    // Only redirect if not already on the auth page
    if (window.location.pathname !== '/auth') {
        window.location.href = '/auth';
    }
}
