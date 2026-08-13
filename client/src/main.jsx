import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { applyTheme, getStoredTheme } from './lib/theme.js';
import './styles/base.css';

/* index.html has already set data-theme before first paint. This second pass
   exists only to reconcile the <meta name="theme-color"> pair, which the inline
   script deliberately leaves alone — rewriting head tags before the stylesheet
   has loaded would cost a paint for no benefit. */
applyTheme(getStoredTheme());

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
