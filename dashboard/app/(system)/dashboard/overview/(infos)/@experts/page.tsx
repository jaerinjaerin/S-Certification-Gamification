"use client";
import { useEffect, useState } from "react";
import InfoCardStyleContent from "../_components/card-content";
import InfoCardStyleContainer from "../_components/card-with-title";
import axios from "axios";
import { serializeJsonToQuery } from "../../_lib/search-params";
import { useOverviewContext } from "../../_lib/provider";

const OverviewExpertsInfo = () => {
  const { state } = useOverviewContext();
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    if (state.fieldValues) {
      const searchParams = serializeJsonToQuery(state.fieldValues);
      const url = `/api/dashboard/overview/experts?${searchParams.toString()}`;
      //
      axios
        .get(url)
        .then((res) => {
          const data = res.data;
          setCount(data.result.count);
        })
        .catch((err) => console.error(err));
    }
  }, [state.fieldValues]);

  return (
    <InfoCardStyleContainer title="Experts" iconName="userCheck">
      <InfoCardStyleContent
        info={count.toLocaleString()}
        caption="Total expert users"
      />
    </InfoCardStyleContainer>
  );
};

export default OverviewExpertsInfo;
