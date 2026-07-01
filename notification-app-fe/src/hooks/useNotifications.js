import { useEffect, useState } from "react";
import { fetchNotifications } from "../apis/notifications";

export function useNotifications(filter = "all", page = 1, limit = 5) {
  const [notifications, setNotifications] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchNotifications({ filter, page, limit });

        if (!active) return;

        setNotifications(data.notifications ?? []);
        setTotal(data.total ?? 0);
        setTotalPages(data.totalPages ?? 1);
      } catch (err) {
        if (!active) return;

        setNotifications([]);
        setTotal(0);
        setTotalPages(1);
        setError(err?.message || "Failed to load notifications");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [filter, page, limit]);

  return { notifications, total, totalPages, loading, error };
}
