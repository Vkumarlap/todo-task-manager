
const API =
  import.meta.env.VITE_API_BASE_URL ||
  "https://todomanager-backend-3u9i.onrender.com/api/tasks";

async function request(path = "", options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;

    try {
      const data = await response.json();
      message =
        data.errors?.title ||
        data.message ||
        message;

      if (typeof message === "object") {
        message = Object.values(message).join(", ");
      }
    } catch {}

    throw new Error(message);
  }

  if (response.status === 204) return null;

  return response.json();
}

export const taskService = {
  list: (params = {}) => {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== "ALL") {
        query.set(key, value);
      }
    });

    const queryString = query.toString();
    return request(queryString ? `?${queryString}` : "");
  },

  get: (id) => request(`/${id}`),

  create: (task) =>
    request("", {
      method: "POST",
      body: JSON.stringify(task),
    }),

  update: (id, task) =>
    request(`/${id}`, {
      method: "PUT",
      body: JSON.stringify(task),
    }),

  setStatus: (id, status) =>
    request(`/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  delete: (id) =>
    request(`/${id}`, {
      method: "DELETE",
    }),
};