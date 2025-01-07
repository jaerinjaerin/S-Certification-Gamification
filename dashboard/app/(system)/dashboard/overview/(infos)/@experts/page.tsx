"use client";
import { useState } from "react";
import InfoCardStyleContent from "../_components/card-content";
import InfoCardStyleContainer from "../_components/card-with-title";

const OverviewExpertsInfo = () => {
  const [infoNum, setInfoNum] = useState<number>(1200);

  return (
    <InfoCardStyleContainer title="Experts" iconName="userCheck">
      <InfoCardStyleContent
        info={infoNum.toLocaleString()}
        caption="Total expert users"
      />
    </InfoCardStyleContainer>
  );
};

export default OverviewExpertsInfo;
