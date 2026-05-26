const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

function buildHeaders(token) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options)
  const bodyText = await response.text()
  let body
  try {
    body = bodyText ? JSON.parse(bodyText) : null
  } catch {
    body = bodyText
  }
  if (!response.ok) {
    const fallback = `Request failed (${response.status})`
    if (typeof body === 'string' && body.trim()) throw new Error(body)
    throw new Error(body?.message ?? fallback)
  }
  return body
}

export function getApiBaseUrl() { return API_BASE_URL }

export function registerUser(payload) {
  return request('/api/auth/register', {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  })
}

export function loginUser(payload) {
  return request('/api/auth/login', {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  })
}

export function generateRoadmap(payload, token) {
  return request('/api/roadmap/generate', {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  })
}

export function generateInterview(payload, token) {
  return request('/api/interview/generate', {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  })
}

export function evaluateAnswer(payload, token) {
  return request('/api/interview/evaluate', {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  })
}

export function getAdminMetrics(token) {
  return request('/api/admin/metrics', {
    method: 'GET',
    headers: buildHeaders(token),
  })
}

export function getAdminUsers(token) {
  return request('/api/admin/users', {
    method: 'GET',
    headers: buildHeaders(token),
  })
}

export function getAdminInsights(token) {
  return request('/api/admin/insights', {
    method: 'GET',
    headers: buildHeaders(token),
  })
}

export function resetAdminPassword(userId, newPassword, token) {
  return request('/api/admin/reset-password', {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify({
      userId,
      newPassword
    }),
  })
}

export function resetUserPassword(payload, token) {
  return request('/api/admin/reset-password', {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  })
}

export function getInterviewHistory(userId, token) {
  return request(`/api/interview/history/${userId}`, {
    method: 'GET',
    headers: buildHeaders(token),
  })
}

export function getSessionDetails(sessionId, token) {
  return request(`/api/interview/session/${sessionId}`, {
    method: 'GET',
    headers: buildHeaders(token),
  })
}

export function getRoadmapHistory(userId, token) {
  return request(`/api/roadmap/history/${userId}`, {
    method: 'GET',
    headers: buildHeaders(token),
  })
}

export function changePassword(payload, token) {
  return request('/api/auth/change-password', {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  })
}
