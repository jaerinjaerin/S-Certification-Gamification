import { cn } from "@/utils/utils";
import Link from "next/link";
import React, { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const NonMemoizedMarkdown = ({
  children,
  className,
}: {
  children: string;
  className?: string;
}) => {
  const components = {
    code: ({ inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <pre
          {...props}
          className={`${className} text-sm w-[80dvw] md:max-w-[500px] overflow-x-scroll bg-zinc-100 p-3 rounded-lg mt-2 dark:bg-zinc-800`}
        >
          <code className={match[1]}>{children}</code>
        </pre>
      ) : (
        <code
          className={`${className} text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1 rounded-md`}
          {...props}
        >
          {children}
        </code>
      );
    },
    ol: ({ children, ...props }: any) => {
      return (
        <ol className="list-decimal list-outside ml-4" {...props}>
          {children}
        </ol>
      );
    },
    li: ({ children, ...props }: any) => {
      return (
        <li className={`${className} py-1`} {...props}>
          {children}
        </li>
      );
    },
    ul: ({ children, ...props }: any) => {
      return (
        <ul className="list-decimal list-outside ml-4" {...props}>
          {children}
        </ul>
      );
    },
    strong: ({ children, ...props }: any) => {
      return (
        <span className="font-semibold" {...props}>
          {children}
        </span>
      );
    },
    a: ({ children, ...props }: any) => {
      return (
        <Link
          className="text-blue-500 hover:underline"
          target="_blank"
          rel="noreferrer"
          {...props}
        >
          {children}
        </Link>
      );
    },
    p: ({ children, ...props }: any) => {
      return (
        <p className={`${className} whitespace-break-spaces my-3`} {...props}>
          {children}
        </p>
      );
    },
    table: ({ children, ...props }: any) => {
      return (
        <div className="my-4">
          <table
            className={cn(
              "table-auto border-collapse border border-gray-300 w-full",
              className
            )}
            {...props}
          >
            {children}
          </table>
        </div>
      );
    },
    thead: ({ children }: any) => {
      return <thead className="bg-gray-100">{children}</thead>;
    },
    tbody: ({ children }: any) => {
      return <tbody>{children}</tbody>;
    },
    tr: ({ children }: any) => {
      return <tr className="border-b border-gray-200">{children}</tr>;
    },
    th: ({ children, ...props }: any) => {
      return (
        <th
          className="px-4 py-2 text-left font-medium text-gray-700 border border-gray-300"
          {...props}
        >
          {children}
        </th>
      );
    },
    td: ({ children, ...props }: any) => {
      return (
        <td
          className={cn(
            "px-4 py-2 text-gray-600 border border-gray-300 ",
            className
          )}
          style={{
            wordWrap: "break-word", // 긴 단어를 줄 바꿈
            wordBreak: "break-word", // 강제로 줄 바꿈
            overflow: "hidden", // 넘치는 내용 숨김
            textOverflow: "ellipsis", // 넘치는 내용을 '...'으로 표시
            whiteSpace: "normal", // 여러 줄로 표시 가능
          }}
          {...props}
        >
          {children}
        </td>
      );
    },
  };

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {children}
    </ReactMarkdown>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

// "whitespace-break-spaces text-xs",
// isArabic && "text-right",
// isMyanmar && "leading-loose"
