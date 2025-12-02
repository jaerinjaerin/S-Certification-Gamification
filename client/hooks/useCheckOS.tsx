"use client";

import { useState, useEffect } from "react";

// OS 감지 로직을 분리하여 재사용 가능하도록 구현
const detectOS = (): string => {
  const userAgent = navigator.userAgent;

  const osMap = [
    { regex: /Windows/i, name: "Windows" },
    { regex: /Android/i, name: "Android" },
    { regex: /Macintosh|MacIntel/i, name: "MacOS" },
    { regex: /iPhone|iPad|iPod/i, name: "iOS" },
  ];

  for (const { regex, name } of osMap) {
    if (regex.test(userAgent)) {
      return name;
    }
  }

  return "Unknown";
};

// 커스텀 훅
const useCheckOS = () => {
  const [os, setOs] = useState<string>("Unknown");

  useEffect(() => {
    setOs(detectOS());
  }, []);

  // OS별 상태를 명확히 분리
  const osFlags = {
    isWindows: os === "Windows",
    isAndroid: os === "Android",
    isMac: os === "MacOS",
    isIOS: os === "iOS",
    isUnknown: os === "Unknown",
  };

  return { os, ...osFlags };
};

export { useCheckOS };
