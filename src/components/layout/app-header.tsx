import Link from "next/link";
import { signOutAction } from "@/app/(app)/auth-actions";
import type { SessionUser } from "@/lib/auth";

// Dark app-shell header. Rendered only inside the authenticated (app) group.
export function AppHeader({ user }: { user: SessionUser | null }) {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-canvas/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-gradient-to-br from-brand to-brand-2 text-white text-xs">
              ◆
            </span>
            Project OS<span className="text-brand">.</span>
          </Link>
          {user && (
            <nav className="flex items-center gap-5 text-sm" aria-label="App">
              <Link href="/projects" className="text-muted transition-colors hover:text-ink">
                Projects
              </Link>
              <Link href="/projects/new" className="text-muted transition-colors hover:text-ink">
                New project
              </Link>
            </nav>
          )}
        </div>

        {user ? (
          <div className="flex items-center gap-4">
            <span className="hidden font-mono text-xs text-faint sm:inline">{user.email}</span>
            <form action={signOutAction}>
              <button
                type="submit"
                className="cursor-pointer rounded-lg border border-line-strong px-3 py-1.5 text-xs text-muted transition-colors hover:text-ink"
              >
                Sign out
              </button>
            </form>
          </div>
        ) : (
          <Link href="/signin" className="text-sm text-muted transition-colors hover:text-ink">
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
