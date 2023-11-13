import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { useAuthContext } from "./AuthContext";
import { fetchData } from "./api";

export default function App() {
    let { isAuthenticated } = useAuthContext();

    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>
                    {isAuthenticated ? <LoggedInView /> : <NotLoggedInView />}
                </p>
                <ApiTesting />
            </header>
        </div>
    );
}

function ApiTesting() {
    let [results, setResults] = useState("");
    let [color, setColor] = useState("white");

    const testApi = () =>
        fetchData<{ successful: boolean }>("api/test", "GET").then((res) => {
            setResults(JSON.stringify(res));
            setColor(res === null ? "red" : "white");
        });

    return (
        <div>
            <p>
                <button onClick={testApi}>Test api</button>
            </p>
            {results ? (
                <p>
                    <code
                        style={{
                            padding: "12px 24px",
                            backgroundColor: "black",
                            color,
                        }}
                    >
                        {results}
                    </code>
                </p>
            ) : null}
        </div>
    );
}

function LoggedInView() {
    let { logout } = useAuthContext();

    return (
        <div>
            <p>Logged In</p>
            {logout ? <button onClick={logout}>Logout</button> : null}
        </div>
    );
}

function NotLoggedInView() {
    let { login } = useAuthContext();
    let [loading, setLoading] = useState(false);

    const onSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
        event.preventDefault();

        if (!login) return;

        let username = (
            event.currentTarget.elements.namedItem(
                "username"
            ) as HTMLInputElement
        ).value;
        let password = (
            event.currentTarget.elements.namedItem(
                "password"
            ) as HTMLInputElement
        ).value;

        setLoading(true);
        await login({ username, password });
        setLoading(false);
    };

    return (
        <div>
            <p>Not Logged In</p>
            {loading ? (
                <p>Logging in...</p>
            ) : (
                <form onSubmit={onSubmit}>
                    <input type="text" placeholder="Username" id="username" />
                    <input
                        type="password"
                        placeholder="Password"
                        id="password"
                    />
                    <button type="submit">Log in</button>
                </form>
            )}
        </div>
    );
}
