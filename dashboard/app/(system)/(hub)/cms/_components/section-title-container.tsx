import React from 'react';

type Props = { children: React.ReactNode };

const SectionTitle = ({ children }: Props) => {
  return (
    <div className="text-zinc-950 font-semibold text-size-17px mb-4">
      {children}
    </div>
  );
};

export default SectionTitle;
