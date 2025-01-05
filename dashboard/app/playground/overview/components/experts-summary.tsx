import { FilterState } from "@/app/playground/overview/page";
import axios from "axios";
import React, { useEffect, useState } from "react";

interface ExpertData {
  totalExperts: number;
  sPlusUsers: number;
  nonSPlusUsers: number;
  breakdown: {
    sPlus: { FF: number; FSM: number; FF_SES: number; FSM_SES: number };
    nonSPlus: { FF: number; FSM: number; FF_SES: number; FSM_SES: number };
  };
}

const ExpertsSummary: React.FC<{ filters: FilterState }> = ({ filters }) => {
  const [data, setData] = useState<ExpertData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  // const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
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
          `/api/overview/experts-summary?${params.toString()}`
        );

        setData(response.data);
      } catch (error) {
        console.error("Error fetching goal progress:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  if (loading) {
    return <p>Loading...</p>;
  }

  // if (error) {
  //   return <p>Error: {error}</p>;
  // }

  if (!data) {
    return <p>No data available.</p>;
  }

  return (
    <div>
      <h2>Experts Summary</h2>
      <p>Total Experts: {data.totalExperts}</p>
      <p>S+ Users: {data.sPlusUsers}</p>
      <p>Non S+ Users: {data.nonSPlusUsers}</p>

      <h3>Breakdown</h3>
      <h4>S+ Users</h4>
      <ul>
        <li>FF: {data.breakdown.sPlus.FF}</li>
        <li>FSM: {data.breakdown.sPlus.FSM}</li>
        <li>FF (SES): {data.breakdown.sPlus.FF_SES}</li>
        <li>FSM (SES): {data.breakdown.sPlus.FSM_SES}</li>
      </ul>

      <h4>Non S+ Users</h4>
      <ul>
        <li>FF: {data.breakdown.nonSPlus.FF}</li>
        <li>FSM: {data.breakdown.nonSPlus.FSM}</li>
        <li>FF (SES): {data.breakdown.nonSPlus.FF_SES}</li>
        <li>FSM (SES): {data.breakdown.nonSPlus.FSM_SES}</li>
      </ul>
    </div>
  );
};

export default ExpertsSummary;
