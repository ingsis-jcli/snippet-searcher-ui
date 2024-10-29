import React from 'react';
import App from './App.tsx'
import './index.css'
import {createRoot} from "react-dom/client";
import {PaginationProvider} from "./contexts/paginationProvider.tsx";
import {SnackbarProvider} from "./contexts/snackbarProvider.tsx";
import {Auth0Provider} from "@auth0/auth0-react";

const auth0Domain = window.env?.VITE_AUTH0_DOMAIN || '';
const auth0ClientId = window.env?.VITE_AUTH0_CLIENT_ID || '';

createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Auth0Provider
            domain={auth0Domain}
            clientId={auth0ClientId}
            authorizationParams={{
                redirect_uri: window.location.origin,
                audience:"snippet-searcher",
                scope: "read:snippets write-snippets",
            }}
        >
            <PaginationProvider>
                <SnackbarProvider>
                    <App/>
                </SnackbarProvider>
            </PaginationProvider>
        </Auth0Provider>
    </React.StrictMode>,
)
