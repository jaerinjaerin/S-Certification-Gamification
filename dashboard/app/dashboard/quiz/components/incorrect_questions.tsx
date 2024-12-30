import axios from "axios";
import React, { useEffect, useState } from "react";
import { FilterState } from "../page";

interface IncorrectQuestion {
  questionId: string;
  questionText: string;
  product: string;
  category: string;
  questionType: string;
  importance: string;
  errorRate: string;
}

const IncorrectQuestions: React.FC<{ filters: FilterState }> = ({
  filters,
}) => {
  const [data, setData] = useState<IncorrectQuestion[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // const [total, setTotal] = useState<number>(0);

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
          `/api/dashboard/quiz/incorrect-questions?${params.toString()}`
        );
        // if (!response.ok) {
        //   throw new Error("Failed to fetch data");
        // }

        console.log("response", response);
        console.log("response", response.data);

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
  }, [filters, page]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!data) return <p>No data available.</p>;

  return (
    <div>
      <h2>Quizzes Ranked by Highest Incorrect Answer Rate</h2>
      <table>
        <thead>
          <tr>
            <th>NO</th>
            <th>Question</th>
            <th>Target Product</th>
            <th>Category</th>
            <th>Question Type</th>
            <th>Importance</th>
            <th>Error Rate</th>
          </tr>
        </thead>
        <tbody>
          {data.map((question, index) => (
            <tr key={question.questionId}>
              <td>{(page - 1) * 10 + index + 1}</td>
              <td>{question.questionText}</td>
              <td>{question.product}</td>
              <td>{question.category}</td>
              <td>{question.questionType}</td>
              <td>{question.importance}</td>
              <td>{question.errorRate}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* <div>
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button
          onClick={() =>
            setPage((prev) => (data.length === 10 ? prev + 1 : prev))
          }
          disabled={data.length < 10}
        >
          Next
        </button>
      </div> */}
    </div>
  );
};

export default IncorrectQuestions;
