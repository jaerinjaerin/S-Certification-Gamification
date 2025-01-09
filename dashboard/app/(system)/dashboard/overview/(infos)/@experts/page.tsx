"use client";
import { use, useEffect, useState } from "react";
import InfoCardStyleContent from "../_components/card-content";
import InfoCardStyleContainer from "../_components/card-with-title";
import axios from "axios";

const getdata = axios
  .get("/api/dashboard/overview/experts")
  .then((res) => res.data)
  .catch((err) => console.error(err));

const OverviewExpertsInfo = () => {
  const data = use(getdata);
  const [infoNum, setInfoNum] = useState<number>(0);

  useEffect(() => {
    if (data) {
      setInfoNum(data.result.count);
    }
  }, [data]);

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
