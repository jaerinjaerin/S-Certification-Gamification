import { FilterState } from "@/app/dashboard/overview/page";
import axios from "axios";
import React, { useEffect, useState } from "react";

interface StatisticsData {
  participants: number;
  experts: number;
  goal: string;
  expertsByGroup: { jobId: string; count: number }[];
}

const fsmJobIds = new Set(["1", "2", "3", "7", "8", "10"]);

const jobGroupNames: { [key: string]: string } = {
  FF: "Field Force",
  FSM: "Field Sales Manager",
};

const StatisticsTable: React.FC<{ filters: FilterState }> = ({ filters }) => {
  const [data, setData] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Construct query string with date range properly formatted
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
          if (key === "dateRange" && value) {
            params.append("startDate", value.start);
            params.append("endDate", value.end);
          } else if (value) {
            params.append(key, value);
          }
        });

        const response = await axios.get(
          `/api/overview/statistics-summary?${params.toString()}`
        );
        setData(response.data);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  if (loading) return <p>Loading...</p>;

  if (!data) return <p>No data available</p>;

  // Group and aggregate experts by FSM or FF
  const groupedExperts = data.expertsByGroup.reduce<{
    [key: string]: number;
  }>(
    (acc, group) => {
      const groupName = fsmJobIds.has(group.jobId) ? "FSM" : "FF";
      acc[groupName] = (acc[groupName] || 0) + group.count;
      return acc;
    },
    { FF: 0, FSM: 0 }
  );

  return (
    <div>
      <div>
        <h3>Participants: {data.participants}</h3>
        <h3>Experts: {data.experts}</h3>
        <h3>Goal: {data.goal}</h3>
        <div>
          <h3>Experts by Group</h3>
          <ul>
            {Object.entries(groupedExperts).map(([group, count]) => (
              <li key={group}>
                {jobGroupNames[group]}: {count}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StatisticsTable;
