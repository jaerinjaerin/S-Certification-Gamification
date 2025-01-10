import axios from "axios";
import { useEffect, useState } from "react";
import { FilterState } from "../page";

const CategoryErrorRate: React.FC<{ filters: FilterState }> = ({ filters }) => {
  const [data, setData] = useState([]);
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
          `/api/dashboard/quiz/error-rate-by-category?${params.toString()}`
        );
        // if (!response.ok) {
        //   throw new Error("Failed to fetch data");
        // }

        // console.log("response", response);
        // console.log("response", response.data);

        setData(response.data.data);
        // setData(result.data);
        // setTotal(response.data.pagination);
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

  if (!data) {
    return <div>No data available.</div>;
  }

  // console.log("data", data);

  return (
    <div>
      <h2>Error Rate by Category</h2>
      <p>
        The data shows categories with the highest incorrect answers by user
        group.
      </p>

      {data &&
        data.map((group: any) => (
          <div key={group.groupName}>
            <h3>{group.groupName}</h3>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Total Answers</th>
                  <th>Correct Answers</th>
                  <th>Incorrect Answers</th>
                  <th>Error Rate (%)</th>
                </tr>
              </thead>
              <tbody>
                {group.categories.map((category: any) => (
                  <tr key={category.category}>
                    <td>{category.category}</td>
                    <td>{category.totalAnswers}</td>
                    <td>{category.correctAnswers}</td>
                    <td>{category.incorrectAnswers}</td>
                    <td>{category.errorRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
    </div>
  );
};

export default CategoryErrorRate;
