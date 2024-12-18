"use client";

import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

export default function TestPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [domains, setDomains] = useState<any[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { data: session } = useSession();
  const [resultUser, setResultUser] = useState<any | null>(null);
  const [resultDomain, setResultDomain] = useState<any | null>(null);
  const [resultActivity, setResultActivity] = useState<any | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number | "">("");
  const [apiPath, setApiPath] = useState("");
  const [apiResult, setApiResult] = useState(null);

  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/sumtotal/user/profile`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch user profile");
      }

      const data = await response.json();

      if (data.organizations.length === 0) {
        setResultUser("Organizations 정보가 없습니다.");
        return;
      }

      const foundPrimaryOrganization = data.organizations.find(
        (org: any) => org.isPrimary
      );
      if (!foundPrimaryOrganization) {
        setResultUser("Primary Organization 정보가 없습니다.");
        return;
      }

      console.log("data", data);
      fetchUserPrimaryOrganization(foundPrimaryOrganization);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getUserJobAndChannel = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/users/job?org_ids=506631,751755`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to fetch user job and channel"
        );
      }

      const data = await response.json();
      console.log("data", data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/sumtotal/auth/refresh_token`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch user profile");
      }

      const data = await response.json();
      console.log("data", data);
      setMessage("토큰 갱신 완료");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPrimaryOrganization = async (organizationrg: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/sumtotal/user/org?id=${organizationrg.id}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to fetch user organization"
        );
      }

      const data = await response.json();

      if (data.data?.length === 0) {
        setResultUser("Organization 정보가 없습니다.");
        return;
      }

      console.log("data", data);

      const text9 = data.data[0]?.optionalInfo.text9;
      if (text9 === "4" || text9 === "5" || text9 === "6") {
        setResultUser("Job: FF");
      } else {
        setResultUser("Job: FSM/Other");
      }

      if (data.data[0]?.code != null) {
        setResultDomain(`DomainCode: ${data.data[0].code}`);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // API 호출 함수
  // const fetchActivities = async () => {
  //   setLoading(true);
  //   setError(null);

  //   try {
  //     const response = await fetch("/certification/api/sumtotal/activity", {
  //       cache: "no-store",
  //     });
  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(errorData.message || "Failed to fetch activities");
  //     }

  //     const data = await response.json();
  //     console.log("fetchActivities data", data);
  //     setActivities(data.data); // Extract and store activities array
  //   } catch (err: any) {
  //     setError(err.message || "An unexpected error occurred");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchAllActivities = async () => {
    setLoading(true);
    setError(null);
    setActivities([]); // Clear any existing activities

    try {
      let allActivities: any[] = []; // To accumulate all activity data
      let offset = 0; // Start from page 0
      const limit = 100; // Number of items per page

      while (true) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_PATH}/api/sumtotal/activity?limit=${limit}&offset=${offset}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch activities");
        }

        const data = await response.json();
        console.log(`Fetched activities: page=${offset}`, data);

        // Combine fetched activities with accumulated activities
        allActivities = [...allActivities, ...data.data];

        // Remove duplicates by activityId
        const activityMap = new Map();
        allActivities.forEach((activity) => {
          activityMap.set(activity.activityId, activity);
        });
        allActivities = Array.from(activityMap.values());

        console.log("allActivities", allActivities.length);

        // Check if we've fetched all pages
        if (allActivities.length >= data.pagination.total) {
          break;
        }

        // Increment the page number for the next request
        offset = allActivities.length;
      }

      setActivities(allActivities); // Store all activities

      if (allActivities != null && selectedActivity != null) {
        const foundActivity = allActivities.find(
          (activity) => activity.activityId === selectedActivity.activityId
        );
        setSelectedActivity(foundActivity);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // API 호출 함수
  const fetchDomains = async () => {
    setLoading(true);
    setError(null);
    setDomains([]); // Clear any existing domains

    try {
      let allDomains: any[] = []; // To accumulate all domain data
      let offset = 1; // Start from page 0
      const limit = 100; // Number of items per page

      while (true) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_PATH}/api/sumtotal/domains?limit=${limit}&offset=${offset}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch domains");
        }

        const data = await response.json();

        // Combine fetched domains with accumulated domains
        allDomains = [...allDomains, ...data.data];

        // Remove duplicates by domainId (or a unique identifier)
        const domainMap = new Map();
        allDomains.forEach((domain) => {
          domainMap.set(domain.domainId, domain); // Replace `domainId` with the actual unique key for domains
        });
        allDomains = Array.from(domainMap.values());

        console.log("allDomains", allDomains.length);

        // Check if we've fetched all pages
        if (allDomains.length >= data.pagination.total) {
          break;
        }

        // Increment the page number for the next request
        offset += 1;
      }

      console.log(`Fetched allDomains`, allDomains);
      saveAsJson(allDomains, "allDomains.json");

      setDomains(allDomains); // Store all domains
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const saveAsJson = (data, fileName = "data.json") => {
    // Convert the data to a JSON string
    const jsonString = JSON.stringify(data, null, 2); // `null, 2` for pretty printing

    // Create a Blob object
    const blob = new Blob([jsonString], { type: "application/json" });

    // Create a temporary anchor element
    const link = document.createElement("a");

    // Set the download URL and file name
    link.href = URL.createObjectURL(blob);
    link.download = fileName;

    // Append the anchor to the body (required for Firefox)
    document.body.appendChild(link);

    // Programmatically click the anchor to trigger the download
    link.click();

    // Remove the anchor from the document
    document.body.removeChild(link);

    // Revoke the Blob URL
    URL.revokeObjectURL(link.href);
  };

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/sumtotal/jobs`,
        {
          cache: "no-store",
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch jobs");
      }

      const data = await response.json();
      console.log("fetchJobs data", data);
      setDomains(data.data); // Extract and store activities array
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleActivitySelect = (activity: any) => {
    setSelectedActivity(activity);
  };

  const postActivitieRegister = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/sumtotal/activity/register`,
        {
          method: "PUT",
          cache: "no-store",
          body: JSON.stringify({
            activityId: selectedActivity.activityId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch activities");
      }

      const data = await response.json();
      console.log("data", data);
      setLoading(false);

      fetchAllActivities();
      // setActivities(JSON.stringify(data, null, 2)); // 응답 데이터를 JSON 포맷으로 텍스트 필드에 표시
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "An unexpected error occurred");
    }
  };

  const postActivitieEnd = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/sumtotal/activity/end`,
        {
          method: "POST",
          cache: "no-store",
          body: JSON.stringify({
            activityId: selectedActivity.activityId,
            status,
            elapsedSeconds: parseInt(elapsedSeconds as string, 10),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch activities");
      }

      const data = await response.json();
      console.log("data", data);
      if (data.status === "attended") {
        setResultActivity("Activity의 메달을 획득하였습니다.");
      }
      setLoading(false);

      fetchAllActivities();
      // setActivities(JSON.stringify(data, null, 2)); // 응답 데이터를 JSON 포맷으로 텍스트 필드에 표시
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "An unexpected error occurred");
      setResultActivity(err.message || "An unexpected error occurred");
    }
  };

  const fetchApi = async () => {
    if (!apiPath) {
      setError("Please provide an API path");
      return;
    }

    setLoading(true);
    setError("");
    setApiResult(null);

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_BASE_PATH
        }/api/sumtotal/custom?api_path=${encodeURIComponent(apiPath)}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch data");
      }

      const result = await response.json();
      console.log("data", result);
      setApiResult(result);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={() => signOut()}>Sign out</button>
      <h1>Activity 메달 획득 테스트</h1>
      <h3>유저 정보</h3>
      <ul>
        <li>
          <strong>이름:</strong> {session?.user.name}
        </li>
      </ul>
      <button onClick={fetchUserProfile} disabled={loading}>
        {loading ? "Loading..." : "유저 Job 정보 조회"}
      </button>
      {resultUser && (
        <div style={{ marginTop: "1rem" }}>
          <p>{resultUser}</p>
        </div>
      )}
      {resultDomain && (
        <div style={{ marginTop: "1rem" }}>
          <p>{resultDomain}</p>
        </div>
      )}
      <br />
      <button onClick={refreshToken} disabled={loading}>
        {loading ? "Loading..." : "토큰 갱신"}
      </button>
      {message && <p style={{ color: "blue" }}>Message: {message}</p>}
      <br />
      <button onClick={fetchAllActivities} disabled={loading}>
        {loading ? "Loading..." : "Activity 목록 조회"}
      </button>
      <br />
      <button onClick={fetchDomains} disabled={loading}>
        {loading ? "Loading..." : "Domain 목록 조회"}
      </button>
      <br />
      <button onClick={fetchJobs} disabled={loading}>
        {loading ? "Loading..." : "Job 목록 조회"}
      </button>
      <br />
      <br />
      <input
        type="text"
        placeholder="/api/v2/advanced/userprofile"
        value={apiPath}
        onChange={(e) => setApiPath(e.target.value)}
        style={{ marginBottom: "10px", padding: "5px", width: "300px" }}
      />
      <br />
      <button onClick={fetchApi} disabled={loading || apiPath == null}>
        {loading ? "Loading..." : "Call Api (API 직접 입력)"}
      </button>

      {activities.length > 0 && (
        <ul
          style={{
            maxHeight: "500px",
            overflowY: "auto",
            padding: "0",
            marginTop: "1rem",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
        >
          {activities.map((activity) => (
            <li
              key={activity.activityId}
              style={{ padding: "10px", borderBottom: "1px solid #ddd" }}
            >
              <span>{activity.activityName}</span>
              <button
                onClick={() => handleActivitySelect(activity)}
                style={{ marginLeft: "10px" }}
              >
                Select
              </button>
            </li>
          ))}
        </ul>
      )}

      {selectedActivity && (
        <div style={{ marginTop: "1rem" }}>
          <h2>선택된 Activity</h2>
          <p>
            <strong>Name:</strong> {selectedActivity.activityName}
          </p>
          <p>
            <strong>Type:</strong> {selectedActivity.activityType}
          </p>
          <p>
            <strong>Status:</strong> {selectedActivity.assignmentStatus}
          </p>
        </div>
      )}

      {selectedActivity && selectedActivity.assignmentStatus === "Assigned" && (
        <>
          <button onClick={postActivitieRegister} disabled={loading}>
            {loading ? "Loading..." : "Activity 등록"}
          </button>
          {/* <button onClick={postActivitieEnd} disabled={loading}>
            {loading ? "Loading..." : "Activity 종료"}
          </button> */}
        </>
      )}

      {(selectedActivity?.assignmentStatus === "Registered" ||
        selectedActivity?.assignmentStatus === "In progress - Registered") && (
        <>
          <div style={{ marginTop: "1rem" }}>
            <label htmlFor="statusSelect">
              <strong>Status:</strong>
            </label>
            <select
              id="statusSelect"
              value={status ?? ""}
              onChange={(e) => setStatus(e.target.value)}
              style={{ marginLeft: "10px" }}
            >
              <option value="Inprogress">In Progress</option>
              <option value="Attended">Attended</option>
              <option value="Cancelled">Cancel</option>
            </select>
          </div>

          <div style={{ marginTop: "1rem" }}>
            <label htmlFor="elapsedSeconds">
              <strong>Elapsed Seconds:</strong>
            </label>
            <input
              id="elapsedSeconds"
              type="number"
              value={elapsedSeconds}
              onChange={(e) =>
                setElapsedSeconds(
                  e.target.value === "" ? "" : parseInt(e.target.value, 10)
                )
              }
              style={{ marginLeft: "10px" }}
            />
          </div>
          <button onClick={postActivitieEnd} disabled={loading}>
            {loading ? "Loading..." : "Activity 이벤트 보내기"}
          </button>
        </>
      )}

      {resultActivity && (
        <div style={{ marginTop: "1rem" }}>
          <h2>결과</h2>
          <p>{resultActivity}</p>
        </div>
      )}

      {domains.length > 0 && (
        <ul
          style={{
            maxHeight: "500px",
            overflowY: "auto",
            padding: "0",
            marginTop: "1rem",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
        >
          {domains.map((domain) => (
            <li
              key={domain.domainId}
              style={{ padding: "10px", borderBottom: "1px solid #ddd" }}
            >
              <p>{domain.domainName}</p>
              <p>{domain.domainCode}</p>
              <p>{domain.parentDomainName}</p>
              <p>{domain.parentDomainId}</p>
              <p>{domain.isParentDomain}</p>
              <p>{domain.domainHierarchy}</p>
            </li>
          ))}
        </ul>
      )}

      {apiResult && (
        <div>
          <h2>Api Result:</h2>
          <pre>{JSON.stringify(apiResult, null, 2)}</pre>
        </div>
      )}

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      <button onClick={getUserJobAndChannel} disabled={loading}>
        {loading ? "Loading..." : "유저 Job 와 Channel 정보 조회"}
      </button>
    </div>
  );
}
