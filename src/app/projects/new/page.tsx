"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createProjectAction, type FormState } from "../actions";

export default function NewProjectPage() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createProjectAction,
    undefined,
  );

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/projects" className="text-sm text-gray-500 hover:text-gray-900">
        ← Projects
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">New project</h1>
      <p className="mt-2 text-gray-600">
        Capture the client brief. You can generate the design-system files once
        it&apos;s created.
      </p>

      {state?.error && (
        <p role="alert" className="mt-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <form action={formAction} className="mt-8 grid gap-5">
        <Field label="Project name" name="name" required placeholder="Acme Corp website" />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Client name" name="clientName" placeholder="Acme Corp" />
          <Field label="Business name" name="businessName" placeholder="Acme" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Industry" name="industry" placeholder="Fintech" />
          <Field label="Audience" name="audience" placeholder="Freelancers" />
        </div>

        <div>
          <label htmlFor="notes" className="mb-1.5 block text-sm font-medium">
            Brief / notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            placeholder="Positioning, must-haves, tone…"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="referenceUrls" className="mb-1.5 block text-sm font-medium">
            Reference URLs
          </label>
          <textarea
            id="referenceUrls"
            name="referenceUrls"
            rows={3}
            placeholder="One per line (or comma-separated)"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-mono focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Sites to analyze later (Playwright crawler is stubbed for now).
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pending ? "Creating…" : "Create project"}
          </button>
          <Link href="/projects" className="text-sm text-gray-500 hover:text-gray-900">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium">
        {label} {required && <span className="text-indigo-600">*</span>}
      </label>
      <input
        id={name}
        name={name}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
    </div>
  );
}
