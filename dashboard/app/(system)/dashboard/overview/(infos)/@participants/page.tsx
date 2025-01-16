"use client";
import { useEffect, useState } from "react";
import InfoCardStyleContent from "../_components/card-content";
import InfoCardStyleContainer from "../_components/card-with-title";
import { useOverviewContext } from "../../_provider/provider";
import { fetchData } from "../../../_lib/fetch";

const OverviewParticipantsInfo = () => {
  const { state } = useOverviewContext();
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    if (state.fieldValues) {
      fetchData(state.fieldValues, "overview/info/participants", (data) => {
        setCount(data.result.count ?? 0);
      });
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
