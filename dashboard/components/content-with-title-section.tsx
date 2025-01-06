"use client";
import { usePathname } from "next/navigation";

const subtitles = {
  dashboard: {
    overview:
      "You can see the overall user status and quiz status at a glance.",
    user: "You can analyze user engagement and performance.",
    quiz: "It analyzes the performance of each quiz.",
  },
} as const;

type Categories = keyof typeof subtitles;
type SegmentKeys = keyof (typeof subtitles)[Categories];

type Props = { children: React.ReactNode };

const ContentWithTitleSection = ({ children }: Props) => {
  const path = usePathname();
  const pathnames = path.split("/").filter(Boolean);

  // 카테고리와 세그먼트 처리
  const category = pathnames[0] as Categories;
  const rawSegment = pathnames[pathnames.length - 1] as SegmentKeys;
  const segment = rawSegment === "overview" ? "dashboard" : rawSegment;

  // 설명 가져오기
  const description = subtitles[category]?.[rawSegment] || null;

  return (
    <div>
      <header>
        <h1 className="font-extrabold text-size-24px capitalize">{segment}</h1>
        {description && <p>{description}</p>}
        <hr className="w-full border-b my-5 border-zinc-200" />
      </header>
      <main>{children}</main>
    </div>
  );
};

export default ContentWithTitleSection;
