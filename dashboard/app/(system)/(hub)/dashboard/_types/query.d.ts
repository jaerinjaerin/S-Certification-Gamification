type JsonValue = string | number | boolean | Date | JsonObject;

interface JsonObject {
  [key: string]: JsonValue | JsonValue[];
}

interface QueryParams {
  [key: string]: string | undefined;
}

interface ParsedDateRange {
  from: Date;
  to: Date;
}
