"use client";
import { use, useEffect, useState } from "react";
import InfoCardStyleContent from "../_components/card-content";
import InfoCardStyleContainer from "../_components/card-with-title";
import axios from "axios";

const getdata = axios
  .get("/api/dashboard/overview/participants")
  .then((res) => res.data)
  .catch((err) => console.error(err));

const OverviewParticipantsInfo = () => {
  const data = use(getdata);
  const [infoNum, setInfoNum] = useState<number>(0);

  useEffect(() => {
    if (data) {
      setInfoNum(data.result.count);
    }
  }, [data]);

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
