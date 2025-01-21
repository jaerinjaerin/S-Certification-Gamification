"use client";
import { useEffect, useState } from "react";
import InfoCardStyleContent from "../_components/card-content";
import InfoCardStyleContainer from "../_components/card-with-title";
import { useOverviewContext } from "../../_provider/provider";
import { fetchData } from "../../../_lib/fetch";

const OverviewAchievementInfo = () => {
  const { state } = useOverviewContext();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (state.fieldValues) {
      fetchData(state.fieldValues, "overview/info/achievement", (data) => {
        setCount(data.result.count ?? 0);
      });
    }
  }, [state.fieldValues]);

  return (
    <InfoCardStyleContainer title="Achievement" iconName="badgeCheck">
      <InfoCardStyleContent
        info={count}
        unit="%"
        caption="Achievement of a goal"
      />
    </InfoCardStyleContainer>
  );
};

export default OverviewAchievementInfo;
