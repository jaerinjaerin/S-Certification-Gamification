export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="px-9">{children}</div>;
}
