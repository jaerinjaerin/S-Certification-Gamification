import { FilterState } from "@/app/playground/overview/page";
import axios from "axios";
import React, { useEffect, useState } from "react";

interface RegionData {
  region: string;
  participants: number;
  experts: number;
}

const ParticipantsVsExperts: React.FC<{ filters: FilterState }> = ({
  filters,
}) => {
  const [regionData, setRegionData] = useState<RegionData[]>([]);
  const [loading, setLoading] = useState(true);

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
          `/api/overview/participants-vs-experts?${params.toString()}`
        );
        setRegionData(response.data);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Participants vs Experts</h2>
      <ul>
        {regionData.map((region) => (
          <li key={region.region}>
            <strong>Region:</strong> {region.region} |{" "}
            <strong>Participants:</strong> {region.participants} |{" "}
            <strong>Experts:</strong> {region.experts}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ParticipantsVsExperts;
