const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

function getToken() {
  return localStorage.getItem("bos_token");
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message = (data && data.error) || "Une erreur est survenue.";
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  return data;
}

export const api = {
  // auth
  register: (payload) => request("/auth/register", { method: "POST", body: payload, auth: false }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload, auth: false }),

  // products
  getProducts: () => request("/products"),
  createProduct: (payload) => request("/products", { method: "POST", body: payload }),
  updateProduct: (id, payload) => request(`/products/${id}`, { method: "PUT", body: payload }),
  deleteProduct: (id) => request(`/products/${id}`, { method: "DELETE" }),

  // clients
  getClients: () => request("/clients"),
  createClient: (payload) => request("/clients", { method: "POST", body: payload }),
  updateClient: (id, payload) => request(`/clients/${id}`, { method: "PUT", body: payload }),
  deleteClient: (id) => request(`/clients/${id}`, { method: "DELETE" }),

  // sales
  getSales: () => request("/sales"),
  createSale: (payload) => request("/sales", { method: "POST", body: payload }),

  // invoices
  getInvoices: () => request("/invoices"),
  updateInvoiceStatus: (id, status) => request(`/invoices/${id}`, { method: "PATCH", body: { status } }),

  // expenses
  getExpenses: () => request("/expenses"),
  createExpense: (payload) => request("/expenses", { method: "POST", body: payload }),
  deleteExpense: (id) => request(`/expenses/${id}`, { method: "DELETE" }),
};

export { getToken };
