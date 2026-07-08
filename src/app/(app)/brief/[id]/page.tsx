import { BriefWorkspace } from "@/components/brief/workspace";

export const metadata = { title: "Brief workspace · Flowfreak" };

export default async function BriefWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BriefWorkspace id={id} />;
}
