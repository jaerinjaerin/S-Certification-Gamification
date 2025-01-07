import AuthProvider from "@/providers/authProvider";
import Link from "next/link";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Link
        href="/home"
        style={{
          width: "24px",
          height: "24px",
          color: "black",
          position: "fixed",
          bottom: "20px",
          right: "100px",
          zIndex: 1000,
        }}
      >
        Home
      </Link>
      <AuthProvider>{children}</AuthProvider>
    </div>
  );
}
