"use client";

import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";

interface LocalStorageContextType {
  activityId: string | null;
  userJob: string | null;
  setActivityId: Dispatch<SetStateAction<string | null>>;
  setUserJob: Dispatch<SetStateAction<string | null>>;
}

const LocalStorageContext = createContext<LocalStorageContextType | undefined>(
  undefined
);

export const LocalStorageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [activityId, setActivityId] = useState<string | null>(null);
  const [userJob, setUserJob] = useState<string | null>(null);

  const getCookie = (key: string) => {
    const cookies = document.cookie.split("; ");
    console.info("[CookieProvider] cookies", cookies);
    for (const cookie of cookies) {
      const [cookieKey, cookieValue] = cookie.split("=");
      if (cookieKey === key) {
        return decodeURIComponent(cookieValue);
      }
    }
    return null;
  };

  const loadFromCookies = () => {
    const activityIdKey = "activityId";
    const userJobKey = "userJob";

    const storedActivityId = getCookie(activityIdKey);
    const storedUserJob = getCookie(userJobKey);

    console.info("[CookieProvider] storedActivityId", storedActivityId);
    console.info("[CookieProvider] storedUserJob", storedUserJob);

    return {
      activityId: storedActivityId || null,
      userJob: storedUserJob || null,
    };
  };

  const readyDatas = async () => {
    let { activityId, userJob } = loadFromCookies();
    console.info("[LocalStorageProvider] activityId", activityId, userJob);
    // if (!activityId) {
    //   const searchParams = useSearchParams();

    //   activityId = searchParams.get("activityId");
    // }

    // if (!activityId) {
    //   setActivityId(activityId);
    // }

    // if (!userJob) {
    //   const searchParams = useSearchParams();

    //   userJob = searchParams.get("job");
    // }

    // if (!userJob) {
    //   setUserJob(userJob);
    // }
  };

  useEffect(() => {
    readyDatas();
  }, []);

  return (
    <LocalStorageContext.Provider
      value={{
        activityId,
        userJob,
        setActivityId: (value) => {
          setActivityId(value);
        },
        setUserJob: (value) => {
          setUserJob(value);
        },
      }}
    >
      {children}
    </LocalStorageContext.Provider>
  );
};

export const useLocalStorage = () => {
  const context = useContext(LocalStorageContext);
  if (context === undefined) {
    throw new Error(
      "useLocalStorage는 LocalStorageProvider 내에서만 사용할 수 있습니다."
    );
  }
  return context;
};
