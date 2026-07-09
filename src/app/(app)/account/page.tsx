import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { FadeUp } from "@/components/ui/motion";
import { listSaved } from "@/lib/saved-sections/store";
import { SavedSectionsList } from "@/components/account/saved-sections-list";
import type { SavedSectionModel } from "@/generated/prisma/models";

export const dynamic = "force-dynamic";

function initialsOf(v: string) {
  return v.split(/[\s@.]+/).slice(0, 2).map((s) => s[0]?.toUpperCase() ?? "").join("");
}

export default async function AccountPage() {
  const user = await requireUser();
  const row = await prisma.user.findUnique({ where: { id: user.id } }).catch(() => null);
  const saved: SavedSectionModel[] = await listSaved(user.id).catch(() => []);
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

      <FadeUp className="card mt-6 max-w-2xl overflow-hidden p-0">
        {/* Identity header. */}
        <div className="flex items-center gap-4 border-b border-line px-6 py-5">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-accent text-[18px] font-semibold text-white">{initials}</span>
          <div className="min-w-0">
            <p className="truncate text-[17px] font-semibold text-ink">{name}</p>
            <p className="truncate text-[13px] text-muted">{user.email}</p>
          </div>
        </div>

        {/* Detail rows. */}
        <dl className="divide-y divide-line">
          {fields.map((f) => (
            <div key={f.label} className="flex items-center gap-4 px-6 py-3.5">
              <dt className="w-40 shrink-0 text-[12.5px] font-medium text-muted">{f.label}</dt>
              <dd className={`min-w-0 flex-1 truncate text-[13.5px] text-ink ${f.cap ? "capitalize" : ""}`}>{f.value}</dd>
            </div>
          ))}
        </dl>

        <div className="border-t border-line bg-panel/40 px-6 py-3 text-[12px] text-muted">
          Editing your profile is coming soon.
        </div>
      </FadeUp>

      {/* Saved sections */}
      <FadeUp className="mt-8 max-w-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-ink">Saved sections</h2>
          <span className="text-[12.5px] text-muted">{saved.length} saved</span>
        </div>
        <SavedSectionsList items={saved.map((s) => ({ id: s.id, sectionId: s.sectionId, name: s.name, category: s.category }))} />
      </FadeUp>
    </PageContainer>
  );
}
