export const serializeJsonToQuery = (json: JsonObject): URLSearchParams => {
  const searchParams = new URLSearchParams();

  const processObject = (keyPrefix: string, obj: JsonObject) => {
    Object.entries(obj).forEach(([key, value]) => {
      const fullKey = keyPrefix ? `${keyPrefix}.${key}` : key;

      if (value instanceof Date) {
        // Date 객체 처리
        if (!isNaN(value.getTime())) {
          searchParams.append(fullKey, value.toISOString());
        }
      } else if (typeof value === "object" && value !== null) {
        // 중첩된 객체 재귀 처리
        processObject(fullKey, value as JsonObject);
      } else {
        // 기본 값 처리
        searchParams.append(fullKey, String(value));
      }
    });
  };

  processObject("", json);

  return searchParams;
};
