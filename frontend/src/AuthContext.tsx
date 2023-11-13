import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { apiUrl } from "./api";

type UserCredentials = {
    username: string;
    password: string;
};

type AuthContextType = {
    login?: (payload: UserCredentials) => Promise<boolean>;
    isAuthenticated?: boolean;
    accessToken?: string | null;
    logout?: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({});

export const useAuthContext = () => useContext(AuthContext);

export default function AuthProvider({
    children,
}: {
    children: JSX.Element | JSX.Element[];
}) {
    const [accessToken, setAccessToken] = useState<string | null>(
        useMemo(() => {
            let accessToken = localStorage.getItem("access_token");
            if (isTokenExpired(accessToken)) {
                return null;
            } else {
                return accessToken;
            }
        }, [])
    );

    const isAuthenticated = !!accessToken;

    const login = async (payload: UserCredentials) => {
        const token = await loginUser(payload.username, payload.password);
        setAccessToken(token);
        return !!token;
    };

    const logout = async () => {
        logoutUser();
        setAccessToken(null);
    };

    useEffect(() => {
        if (!accessToken) {
            refreshAccessToken().then((newToken) =>
                setAccessToken((oldToken) => oldToken || newToken)
            );
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{
                logout,
                login,
                isAuthenticated,
                accessToken,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// Function to handle user login
async function loginUser(username: string, password: string) {
    try {
        const response = await fetch(apiUrl("api/token/"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            // Handle login failure
            return null;
        }
        type JwtTokens = {
            access: string;
            refresh: string;
        };
        const data: JwtTokens = await response.json();
        const { access, refresh } = data;

        // Store the tokens securely
        localStorage.setItem("access_token", access);
        localStorage.setItem("refresh_token", refresh);

        return access;
    } catch (error) {
        // Handle network errors or other issues
        console.error("Login error:", error);
        return null;
    }
}

// Function to check if the access token is expired
export function isTokenExpired(token: string | null) {
    if (!token) return true;

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        console.log(payload);
        // Check if the current time is past the token's expiration time
        return payload.exp * 1000 < Date.now();
    } catch (error) {
        // Handle decoding errors or invalid tokens
        console.error("Token decoding error:", error);
        return true;
    }
}

// Function to refresh the access token using the refresh token
export async function refreshAccessToken() {
    const refreshToken = localStorage.getItem("refresh_token");

    if (!refreshToken) {
        // Handle not having a refresh token
        return null;
    }

    try {
        const response = await fetch(apiUrl("api/token/refresh/"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!response.ok) {
            // Handle refresh token failure (e.g., if refresh token is expired)
            return null;
        }

        const data: { access: string } = await response.json();
        const newAccessToken = data.access;

        // Update the stored access token
        localStorage.setItem("access_token", newAccessToken);

        return newAccessToken;
    } catch (error) {
        // Handle network errors or other issues
        console.error("Token refresh error:", error);
        return null;
    }
}

function isLoggedIn() {
    const accessToken = localStorage.getItem("access_token");

    // Check if the access token exists and is not expired
    return !!accessToken && !isTokenExpired(accessToken);
}

function logoutUser() {
    // Clear stored tokens
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
}

// Assume you have the other authentication functions in this file

// Function to register a new user
async function registerUser(username: string, password: string) {
    try {
        const response = await fetch(apiUrl("api/register/"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            // Handle registration failure
            console.error("Registration failed");
            return null;
        }

        // Registration successful, you might want to handle the response data if needed
        const data = await response.json();
        console.log("Registration successful:", data);

        // Optionally, you can automatically log in the user after registration
        // const loginResult = await loginUser(username, password);
        // return loginResult;
    } catch (error) {
        // Handle network errors or other issues
        console.error("Registration error:", error);
        return null;
    }
}
