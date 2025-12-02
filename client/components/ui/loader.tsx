import { useCallback, useState } from "react";
import Spinner from "./spinner";

export default function useLoader() {
  const [loading, setLoading] = useState(false);

  const startLoading = useCallback(() => {
    setLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setLoading(false);
  }, []);

  const Loader = useCallback(
    (overrideLoading?: boolean) => {
      const show = overrideLoading ?? loading;

      if (!show) return null;

      return <Spinner />;
    },
    [loading]
  );

  return { loading, setLoading, startLoading, stopLoading, Loader };
}
