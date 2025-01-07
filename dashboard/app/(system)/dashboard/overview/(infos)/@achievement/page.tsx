"use client";
import { useState } from "react";
import InfoCardStyleContent from "../_components/card-content";
import InfoCardStyleContainer from "../_components/card-with-title";

const OverviewAchievementInfo = () => {
  const [infoNum, setInfoNum] = useState<number>(0);
  return (
    <InfoCardStyleContainer title="Achievement" iconName="badgeCheck">
      <InfoCardStyleContent
        info={`${infoNum.toLocaleString()}%`}
        caption="Achievement of a goal"
      />
    </InfoCardStyleContainer>
  );
};

export default OverviewAchievementInfo;
