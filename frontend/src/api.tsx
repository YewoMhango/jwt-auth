import { isTokenExpired, refreshAccessToken } from "./AuthContext";

export const apiUrl = (path: string) => "http://127.0.0.1:8000/" + path;
// Function to make authenticated API requests with token refresh

export async function fetchData<T>(url: string, method = "GET", data = null) {
    let accessToken = localStorage.getItem("access_token");

    // If the access token is expired, attempt to refresh it
    if (isTokenExpired(accessToken)) {
        accessToken = await refreshAccessToken();
    }

    if (!accessToken) {
        // Handle not authenticated even after refresh
        return null;
    }

    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
    };

    try {
        const response = await fetch(apiUrl(url), {
            method,
            headers,
            body: data ? JSON.stringify(data) : null,
        });

        if (!response.ok) {
            // Handle API request failure
            return null;
        }

        const responseData: T = await response.json();
        return responseData;
    } catch (error) {
        // Handle network errors or other issues
        console.error("API request error:", error);
        return null;
    }
}
