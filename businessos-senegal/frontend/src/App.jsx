import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Produits from "./pages/Produits";
import Ventes from "./pages/Ventes";
import Clients from "./pages/Clients";
import Factures from "./pages/Factures";
import Finances from "./pages/Finances";

function Protected({ children }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/connexion" element={<Login />} />
          <Route path="/inscription" element={<Register />} />

          <Route path="/" element={<Protected><Dashboard /></Protected>} />
          <Route path="/produits" element={<Protected><Produits /></Protected>} />
          <Route path="/ventes" element={<Protected><Ventes /></Protected>} />
          <Route path="/clients" element={<Protected><Clients /></Protected>} />
          <Route path="/factures" element={<Protected><Factures /></Protected>} />
          <Route path="/finances" element={<Protected><Finances /></Protected>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
      <Analytics />
    </BrowserRouter>
  );
}
