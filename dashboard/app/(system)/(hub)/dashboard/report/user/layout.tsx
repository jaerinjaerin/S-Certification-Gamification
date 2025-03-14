import React from 'react';
import ReportFilterForm from './filters/page';

type Props = { children: React.ReactNode };

const ReportUserLayout = ({ children }: Props) => {
  return (
    <div className="space-y-3">
      <ReportFilterForm />
      {children}
    </div>
  );
};

export default ReportUserLayout;
