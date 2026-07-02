import { requireUser } from "@/lib/auth";

// Gate: every /projects route requires a session. Unauthenticated visitors
// are redirected to /signin. Server actions re-check independently.
export default async function ProjectsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireUser();
  return <>{children}</>;
}
