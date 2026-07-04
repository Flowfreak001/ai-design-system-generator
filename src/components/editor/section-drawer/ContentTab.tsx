"use client";

// Content tab — schema-driven fields (React Hook Form + Zod) plus the
// repeatable-items editor. Commits on blur so canvas preview stays live
// without re-rendering per keystroke.

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sectionContentSchema } from "@/lib/section-editor/schemas";
import type { SectionContent, SectionEditSchema, SectionItem } from "@/lib/section-editor/types";
import { TextField, TextAreaField } from "../section-fields/fields";
import { ItemListFields } from "../section-fields/ItemListFields";

type FormValues = Omit<SectionContent, "items">;

export function ContentTab({ sectionId, schema, content, onCommit }: {
  sectionId: string;
  schema: SectionEditSchema;
  content: SectionContent;
  onCommit: (content: SectionContent) => void;
}) {
  const { register, handleSubmit, reset, getValues } = useForm<FormValues>({
    resolver: zodResolver(sectionContentSchema.omit({ items: true })),
    defaultValues: content,
    mode: "onBlur",
  });
  // Re-seed the form when a different section is selected.
  useEffect(() => { reset(content); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [sectionId]);

  const commitFields = handleSubmit((values) => onCommit({ ...content, ...values }));
  const commitItems = (items: SectionItem[]) => onCommit({ ...content, ...getValues(), items });

  return (
    <div className="grid gap-3">
      <form className="grid gap-3" onBlur={() => void commitFields()}>
        {schema.fields.map((f) =>
          f.kind === "textarea"
            ? <TextAreaField key={f.key} label={f.label} placeholder={f.placeholder} {...register(f.key)} />
            : <TextField key={f.key} label={f.label} placeholder={f.placeholder} {...register(f.key)} />,
        )}
      </form>
      {schema.items && (
        <>
          <div className="h-px bg-line" />
          <ItemListFields schema={schema.items} items={content.items ?? []} onChange={commitItems} />
        </>
      )}
    </div>
  );
}
