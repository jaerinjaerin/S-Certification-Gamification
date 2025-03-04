/* eslint-disable @typescript-eslint/no-explicit-any */
type TargetFromExcelProps = {
  code: string;
  total: number;
  ff: number;
  ffSes: number;
  fsm: number;
  fsmSes: number;
};

type TargetTransformProps = TargetFromExcelProps & {
  domainId: string;
  targetId: string;
};

type TargetProps = {
  id: string;
  domainId: string;
  domain: string;
  total: string;
  ff: number;
  ffSes: number;
  fsm: number;
  fsmSes: number;
};

type TargetDataProps = {
  targets: TargetProps[] | null;
};

type TargetConvertedProps = {
  file: File;
  json?: Record<string, string | number>[];
  metadata: Record<string, any>;
};
