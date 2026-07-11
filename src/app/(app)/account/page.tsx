import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { FadeUp } from "@/components/ui/motion";
import { ProfileCard } from "./profile-card";
import { getWixConnection } from "@/lib/integrations/wix/connection-store";
import { isWixAppConfigured } from "@/lib/integrations/wix/oauth";
import { disconnectWixAction } from "./wix-actions";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

function initialsOf(v: string) {
  return v.split(/[\s@.]+/).slice(0, 2).map((s) => s[0]?.toUpperCase() ?? "").join("");
}

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ wix?: string }> }) {
  const user = await requireUser();
  const { wix: wixStatus } = await searchParams;
  const wixConn = user.agencyId ? await getWixConnection(user.agencyId) : null;
  const wixConfigured = isWixAppConfigured();
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

      <FadeUp>
        <div className="card mt-6 max-w-2xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[15px] font-semibold text-ink">Wix account</p>
              <p className="mt-1 text-[13px] text-muted">
                Connect your own Wix site to publish projects straight to your account.
              </p>
            </div>
            {wixConn ? (
              <form action={disconnectWixAction}>
                <Button type="submit" variant="secondary" size="sm">Disconnect</Button>
              </form>
            ) : wixConfigured ? (
              <a href="/api/integrations/wix/connect" className="inline-flex h-8 items-center gap-1.5 rounded-[6px] bg-accent px-3 text-[13px] font-medium text-white transition-colors hover:bg-accent-hover">
                Connect Wix
              </a>
            ) : (
              <span className="text-[12px] text-muted">Not configured</span>
            )}
          </div>
          <div className="mt-3 text-[12.5px]">
            {wixConn ? (
              <span className="text-success">✓ Connected (instance {wixConn.instanceId.slice(0, 8)}…)</span>
            ) : wixStatus === "connected" ? (
              <span className="text-success">✓ Wix connected — you can now Publish to your account.</span>
            ) : wixStatus === "error" ? (
              <span className="text-danger">Couldn’t complete the Wix connection. Please try again.</span>
            ) : wixStatus === "badstate" ? (
              <span className="text-danger">Security check failed — please retry the connection.</span>
            ) : wixStatus === "unconfigured" ? (
              <span className="text-danger">Wix app isn’t configured on the server yet.</span>
            ) : (
              <span className="text-muted">Not connected — Publish uses the shared account until you connect.</span>
            )}
          </div>
        </div>
      </FadeUp>
    </PageContainer>
  );
}
