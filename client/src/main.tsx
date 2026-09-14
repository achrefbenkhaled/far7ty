import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { LanguageThemeProvider } from './context/LanguageThemeContext';
import { ManageAuthProvider } from './context/ManageAuthContext';
import './styles.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <LanguageThemeProvider>
        <ManageAuthProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ManageAuthProvider>
      </LanguageThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
