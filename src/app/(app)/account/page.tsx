import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { FadeUp } from "@/components/ui/motion";
import { ProfileCard } from "./profile-card";

export const dynamic = "force-dynamic";

function initialsOf(v: string) {
  return v.split(/[\s@.]+/).slice(0, 2).map((s) => s[0]?.toUpperCase() ?? "").join("");
}

export default async function AccountPage() {
  const user = await requireUser();
  const row = await prisma.user.findUnique({ where: { id: user.id } }).catch(() => null);
  const agency = user.agencyId
    ? await prisma.agency.findUnique({ where: { id: user.agencyId } }).catch(() => null)
    : null;

  const name = user.name ?? "—";
  const initials = initialsOf(user.name ?? user.email);
  const fmt = (d?: Date | null) => (d ? new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "—");

  const fields: { label: string; value: string; cap?: boolean }[] = [
    { label: "Full name", value: name },
    { label: "Email", value: user.email },
    { label: "Role", value: (row?.role ?? "member").replace(/_/g, " "), cap: true },
    { label: "Workspace", value: agency?.name ?? "—" },
    { label: "Member since", value: fmt(row?.createdAt) },
  ];

  return (
    <PageContainer>
      <PageHeader title="Profile" description="Your account details and workspace." />

      <FadeUp>
        <ProfileCard
          name={name === "—" ? "" : name}
          email={user.email}
          initials={initials}
          workspace={agency?.name ?? ""}
          canEditWorkspace={!!user.agencyId}
          fields={fields}
        />
      </FadeUp>
    </PageContainer>
  );
}
