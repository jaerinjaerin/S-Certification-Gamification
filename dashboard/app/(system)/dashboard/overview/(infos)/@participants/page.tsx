"use client";
import { useEffect, useState } from "react";
import InfoCardStyleContent from "../_components/card-content";
import InfoCardStyleContainer from "../_components/card-with-title";
import { useOverviewContext } from "../../_lib/provider";
import { serializeJsonToQuery } from "../../_lib/search-params";
import axios from "axios";

const OverviewParticipantsInfo = () => {
  const { state } = useOverviewContext();
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    if (state.fieldValues) {
      const searchParams = serializeJsonToQuery(state.fieldValues);
      const url = `/api/dashboard/overview/participants?${searchParams.toString()}`;
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
    <InfoCardStyleContainer title="Participants" iconName="user">
      <InfoCardStyleContent
        info={count.toLocaleString()}
        caption="Total paricipants"
      />
    </InfoCardStyleContainer>
  );
};

export default OverviewParticipantsInfo;
