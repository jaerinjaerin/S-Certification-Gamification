/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import React, { useEffect, useState } from "react";

interface GoalProgressData {
  regionId: string;
  goal: number;
  experts: number;
  achievementRate: number;
}

const GoalProgressChart: React.FC<{ campaignId: string }> = ({
  campaignId,
}) => {
  const [data, setData] = useState<GoalProgressData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `/api/overview/goal-progress?campaignId=${campaignId}`
        );
        setData(response.data);
      } catch (error) {
        console.error("Error fetching goal progress:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [campaignId]);

  if (loading) return <p>Loading...</p>;
  if (!data.length) return <p>No data available</p>;

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Goal Progress</h2>
      <ul>
        {data.map((region: any) => (
          <li key={region.region}>
            <strong>Region:</strong> {region.region} | <strong>Goal:</strong>{" "}
            {region.totalUserCount} | <strong>Experts:</strong>{" "}
            {region.completedLogsCount}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GoalProgressChart;
