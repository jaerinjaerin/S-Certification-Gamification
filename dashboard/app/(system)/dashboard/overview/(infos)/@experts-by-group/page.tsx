"use client";
import { useEffect, useState } from "react";
import InfoCardStyleContainer from "../_components/card-with-title";
import { useOverviewContext } from "../../_lib/provider";
import { serializeJsonToQuery } from "../../_lib/search-params";
import axios from "axios";
import { initialExpertsData } from "./_lib/state";

const OverviewExpertsByGroupInfo = () => {
  const { state } = useOverviewContext();
  const [expertData, setExpertData] =
    useState<ImprovedDataStructure>(initialExpertsData);

  useEffect(() => {
    if (state.fieldValues) {
      const searchParams = serializeJsonToQuery(state.fieldValues);
      const url = `/api/dashboard/overview/experts-by-group?${searchParams.toString()}`;
      //
      axios
        .get(url)
        .then((res) => {
          const data = res.data;
          console.log("🚀 ~ .then ~ data:", data);
          setExpertData(data.result);
        })
        .catch((err) => console.error(err));
    }
  }, [state.fieldValues]);

  return (
    <InfoCardStyleContainer title="Experts by group" iconName="users">
      {expertData.map((groupData) => {
        const groupSuffix =
          groupData.group === "plus" ? "" : `(${groupData.group})`;
        return (
          <div
            key={groupData.group}
            className="text-zinc-950 font-medium flex space-x-6"
          >
            {groupData.items.map((item) => {
              const title = `${item.title}${groupSuffix}`;
              return (
                <div key={title} className="flex items-center space-x-1">
                  <div className="uppercase">{title}</div>
                  <div className="font-bold text-size-20px">{item.value}</div>
                </div>
              );
            })}
          </div>
        );
      })}
    </InfoCardStyleContainer>
  );
};

export default OverviewExpertsByGroupInfo;
