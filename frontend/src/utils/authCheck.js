import toast from "react-hot-toast";

/**
 * Check if the user is currently authenticated (has token and user data).
 */
export function isUserLoggedIn() {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  if (!token || !userStr) return false;
  try {
    const user = JSON.parse(userStr);
    return !!user && !!user.id;
  } catch (e) {
    return false;
  }
}

/**
 * Ensures user is authenticated before executing a protected action.
 *
 * If authenticated:
 *   Executes `onAuthenticated` callback (if provided) and returns `true`.
 *
 * If NOT authenticated:
 *   Blocks the action, does NOT modify data/state, does NOT send API requests,
 *   and displays a clear toast notification: "Anda harus login terlebih dahulu untuk menggunakan fitur ini."
 *   Returns `false`.
 */
export function requireAuth(
  onAuthenticated,
  message = "Anda harus login terlebih dahulu untuk menggunakan fitur ini."
) {
  if (isUserLoggedIn()) {
    if (typeof onAuthenticated === "function") {
      onAuthenticated();
    }
    return true;
  }

  // Display toast notification
  toast.error(message, {
    duration: 4000,
    style: {
      borderRadius: "12px",
      background: "#0f172a",
      color: "#fff",
      fontSize: "14px",
      fontWeight: "500",
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
    },
  });

  return false;
}
