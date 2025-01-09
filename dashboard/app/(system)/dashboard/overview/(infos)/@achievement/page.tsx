"use client";
import { use, useEffect, useState } from "react";
import InfoCardStyleContent from "../_components/card-content";
import InfoCardStyleContainer from "../_components/card-with-title";
import axios from "axios";

const getdata = axios
  .get("/api/dashboard/overview/achievement")
  .then((res) => res.data)
  .catch((err) => console.error(err));

const OverviewAchievementInfo = () => {
  const data = use(getdata);
  const [infoNum, setInfoNum] = useState<number>(0);

  useEffect(() => {
    console.log(`data`, data);

    if (data) {
      // setInfoNum(data.result.percent);
    }
  }, [data]);

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
