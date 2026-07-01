import { useEffect, useState } from "react";
import { fetchNotifications } from "../apis/notifications";

export function useNotifications(type = "all", priority = "all", limit = 5) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchNotifications({ type, priority, limit });
        if (!active) return;

        setNotifications(data.notifications ?? []);
      } catch (err) {
        if (!active) return;

        setNotifications([]);
        setError(err?.message || "Failed to load notifications");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [type, priority, limit]);

  return { notifications, loading, error };
}
