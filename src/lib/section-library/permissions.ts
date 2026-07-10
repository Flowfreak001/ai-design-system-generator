// Section/component permissions. Server-side source of truth — the UI hides
// buttons for UX, but every mutating action re-checks these.
//
// Two distinct things:
//   • Library item (global/admin OR user-created) — lives in the catalog.
//   • Page section instance — a copy added onto a project/page; editing the
//     instance never touches the library item.

import type { SessionUser } from "@/lib/auth";

/** Emails always treated as admin (belt-and-suspenders alongside role). */
export const ADMIN_EMAILS = ["demo@projectos.dev", "sunil@flowfreak.com"];

export function isAdmin(user: Pick<SessionUser, "role" | "email">): boolean {
  return user.role === "admin" || ADMIN_EMAILS.includes(user.email.toLowerCase());
}

/** Minimal shape needed to authorize a library item. */
export interface LibraryItemAuth {
  sourceType: "admin" | "user" | "built-in" | "custom" | "forked" | "ai-draft";
  createdByUserId?: string | null;
  status?: string;
  visibility?: string;
}

/** Admins can manage EVERY library item; other users only what they created. */
export function canEditLibrarySection(user: SessionUser, section: LibraryItemAuth): boolean {
  if (isAdmin(user)) return true;
  return Boolean(section.createdByUserId) && section.createdByUserId === user.id;
}

export function canDeleteLibrarySection(user: SessionUser, section: LibraryItemAuth): boolean {
  return canEditLibrarySection(user, section);
}

/** Anyone can add a ready item they're allowed to see. */
export function canAddLibrarySection(user: SessionUser, section: LibraryItemAuth): boolean {
  if (section.status !== "ready") {
    // Owners/admins may add their own not-yet-published items while testing.
    return canEditLibrarySection(user, section);
  }
  return canViewLibrarySection(user, section);
}

/** Visibility gate for browsing/adding. */
export function canViewLibrarySection(user: SessionUser, section: LibraryItemAuth): boolean {
  const vis = section.visibility ?? "public";
  if (vis === "public") return true;
  if (vis === "admin-only") return isAdmin(user);
  // private → only the creator (or an admin) can see it.
  if (vis === "private") return isAdmin(user) || section.createdByUserId === user.id;
  return true;
}

/** A page/wireframe section instance is editable by the project owner. The
 *  caller passes whether the current user owns/has edit access to the project. */
export function canEditPageSectionInstance(hasProjectEditAccess: boolean): boolean {
  return hasProjectEditAccess;
}
