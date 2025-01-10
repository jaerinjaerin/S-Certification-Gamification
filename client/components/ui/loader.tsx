import { useState } from "react";
import Spinner from "./spinner";

export default function useLoader() {
  const [loading, setLoading] = useState(false);

  const renderLoader = () => {
    if (loading) {
      return <Spinner />;
    }
  };
  return { loading, setLoading, renderLoader };
}
