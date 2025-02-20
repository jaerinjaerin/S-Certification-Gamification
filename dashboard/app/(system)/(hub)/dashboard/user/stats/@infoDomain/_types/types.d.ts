type DomainProps = {
  domain: { id: string; name: string };
  region: { id: string; name: string };
  subsidiary: { id: string; name: string };
  goal: number;
  expert: string;
  achievement: number;
  expertDetail: {
    date: Date;
    country: string;
    plus: number;
    none: number;
    ff: number;
    fsm: number;
    "ff(ses)": number;
    "fsm(ses)": number;
  };
};
