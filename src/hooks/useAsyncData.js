import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Runs an async loader and tracks { data, loading, error }. It loads on mount
 * and again whenever `deps` change; call reload() to run it again, or
 * reload({ quiet: true }) to refresh in the background (keeps the current data
 * and shows no loading state). An older call that finishes late is ignored.
 */
export default function useAsyncData(loader, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const latest = useRef(0);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const reload = useCallback(async ({ quiet = false } = {}) => {
    latest.current += 1;
    const id = latest.current;
    if (!quiet) {
      setState((current) => ({ ...current, loading: true, error: null }));
    }
    try {
      const data = await loaderRef.current();
      if (id === latest.current) {
        setState({ data, loading: false, error: null });
      }
    } catch (error) {
      console.log("async load error", error);
      if (id === latest.current) {
        setState((current) => ({ data: quiet ? current.data : null, loading: false, error }));
      }
    }
    // deps are supplied by the caller, exactly like useEffect's.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    reload();
    return () => {
      latest.current += 1; // ignore results after unmount / dep change
    };
  }, [reload]);

  return { ...state, reload };
}
