import Link from "next/link";
import React, { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  const components = {
    code: ({ node, inline, className, children, ...props }: any) => {
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
    ol: ({ node, children, ...props }: any) => {
      return (
        <ol className="list-decimal list-outside ml-4" {...props}>
          {children}
        </ol>
      );
    },
    li: ({ node, children, ...props }: any) => {
      return (
        <li className="py-1" {...props}>
          {children}
        </li>
      );
    },
    ul: ({ node, children, ...props }: any) => {
      return (
        <ul className="list-decimal list-outside ml-4" {...props}>
          {children}
        </ul>
      );
    },
    strong: ({ node, children, ...props }: any) => {
      return (
        <span className="font-semibold" {...props}>
          {children}
        </span>
      );
    },
    a: ({ node, children, ...props }: any) => {
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
    p: ({ node, children, ...props }: any) => {
      return (
        <p className="whitespace-break-spaces my-3" {...props}>
          {children}
        </p>
      );
    },
    table: ({ node, children, ...props }: any) => {
      return (
        <div className="my-4">
          <table
            className="table-auto border-collapse border border-gray-300 w-full"
            {...props}
          >
            {children}
          </table>
        </div>
      );
    },
    thead: ({ node, children, ...props }: any) => {
      return <thead className="bg-gray-100">{children}</thead>;
    },
    tbody: ({ node, children, ...props }: any) => {
      return <tbody>{children}</tbody>;
    },
    tr: ({ node, children, ...props }: any) => {
      return <tr className="border-b border-gray-200">{children}</tr>;
    },
    th: ({ node, children, ...props }: any) => {
      return (
        <th
          className="px-4 py-2 text-left font-medium text-gray-700 border border-gray-300"
          {...props}
        >
          {children}
        </th>
      );
    },
    td: ({ node, children, ...props }: any) => {
      return (
        <td
          className="px-4 py-2 text-gray-600 border border-gray-300 "
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
