import AuthProvider from "@/providers/authProvider";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.info("Render ClientLayout");
  return (
    <div>
      <AuthProvider>{children}</AuthProvider>
    </div>
  );
}
