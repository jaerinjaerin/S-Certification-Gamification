"use client";
import { useState } from "react";
import InfoCardStyleContent from "../_components/card-content";
import InfoCardStyleContainer from "../_components/card-with-title";

const OverviewParticipantsInfo = () => {
  const [infoNum, setInfoNum] = useState<number>(1593);

  return (
    <InfoCardStyleContainer title="Participants" iconName="user">
      <InfoCardStyleContent
        info={infoNum.toLocaleString()}
        caption="Total paricipants"
      />
    </InfoCardStyleContainer>
  );
};

export default OverviewParticipantsInfo;
