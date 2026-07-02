import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ownsProject } from "@/lib/projects";
import { buildExportPackage } from "@/lib/export";
import { prisma } from "@/lib/db/client";

// GET /api/projects/:id/export — download the full design-system package
// as a ZIP. Session + ownership gated.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await auth();
  if (!user?.agencyId || !(await ownsProject(id, user.agencyId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const { filename, zip } = await buildExportPackage(id);
    await prisma.project.update({ where: { id }, data: { status: "DELIVERED" } }).catch(() => {});
    return new NextResponse(Buffer.from(zip), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Export failed" },
      { status: 500 },
    );
  }
}
