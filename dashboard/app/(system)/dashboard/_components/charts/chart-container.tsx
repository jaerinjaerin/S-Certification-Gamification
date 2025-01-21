"use client";
import React, { useEffect, useRef, useState } from "react";

type Props = {
  children: (resize: { width: number; height: number }) => React.ReactNode;
};

const ChartContainer = ({ children }: Props) => {
  const [resize, setResize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setResize({
          width: containerRef.current.offsetWidth * 0.95,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    // ResizeObserver to handle dynamic resizing
    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Initial size update
    updateSize();

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative p-4 border rounded-xl">
      {children(resize)}
    </div>
  );
};

export default ChartContainer;
