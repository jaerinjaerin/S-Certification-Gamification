"use client";
import { useState } from "react";
import InfoCardStyleContainer from "../_components/card-with-title";

type GroupedData = {
  group: string;
  items: {
    title: string;
    value: number;
  }[];
};

type ImprovedDataStructure = GroupedData[];

const expertsData: ImprovedDataStructure = [
  {
    group: "plus",
    items: [
      { title: "ff", value: 100 },
      { title: "fsm", value: 400 },
    ],
  },
  {
    group: "ses",
    items: [
      { title: "ff", value: 100 },
      { title: "fsm", value: 400 },
    ],
  },
];

const OverviewExpertsByGroupInfo = () => {
  const [infoNum, setInfoNum] = useState(expertsData);

  return (
    <InfoCardStyleContainer title="Experts by group" iconName="users">
      {infoNum.map((groupData) => {
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
