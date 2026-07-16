import { useState, useEffect, useCallback } from "react";

export function useToast() {
  const [toast, setToast] = useState(null);

  const notify = useCallback((msg, kind = "success") => {
    setToast({ msg, kind, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  return { toast, notify };
}
