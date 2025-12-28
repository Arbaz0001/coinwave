// src/services/api.js
export async function fetchUsers() {
  const res = await fetch("/api/admin/users");
  return res.json();
}

export async function updateUser(userId, data) {
  return fetch(`/api/admin/users/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function fetchTransactions() {
  const res = await fetch("/api/admin/transactions");
  return res.json();
}

export async function fetchPendingPayments() {
  const res = await fetch("/api/admin/pending-payments");
  return res.json();
}

export async function approvePayment(id) {
  return fetch(`/api/admin/pending-payments/${id}/approve`, { method: "POST" });
}

export async function denyPayment(id, reason = "Denied by admin") {
  return fetch(`/api/admin/pending-payments/${id}/deny`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });
}

export async function addManualPayment(data) {
  return fetch(`/api/admin/manual-payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}
