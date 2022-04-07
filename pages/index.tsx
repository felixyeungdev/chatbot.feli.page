import { useUser } from "@auth0/nextjs-auth0";
import { NextPage } from "next";
import React from "react";
import { auth0 } from "utils/auth0";

const HomePage: NextPage = () => {
    const { user } = useUser();
    return (
        <div>
            <h1>HomePage</h1>
            <a className="btn btn-sm" href={auth0.urls.login}>
                Login
            </a>
            <a className="btn btn-sm" href={auth0.urls.logout}>
                Logout
            </a>

            <code>
                <pre>{JSON.stringify(user, null, 2)}</pre>
            </code>
        </div>
    );
};

export default HomePage;
