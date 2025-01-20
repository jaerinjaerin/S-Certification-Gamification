"use client";
import { useEffect, useState } from "react";
import { useUserContext } from "../../_provider/provider";
import { fetchData } from "../../../_lib/fetch";

const UserDomain = () => {
  const { state } = useUserContext();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (state.fieldValues) {
      fetchData(state.fieldValues, "user/info/domain", (data) => {
        console.log("🚀 ~ fetchData ~ data:", data);
        setData(data.result);
        setLoading(false);
      });
      //
    }
  }, [state.fieldValues]);

  return <div className="border rounded-xl p-6">Domain</div>;
};

export default UserDomain;
