"use client";

import { useState, useTransition } from "react";

import type { Category } from "@/types/blog";
import { Field, inputClass } from "@/components/admin/Field";
import { deleteCategoryAction, saveCategoryAction } from "@/lib/blog/actions";

export function CategoryManager({
  categories: initial,
}: {
  categories: Array<Category & { count: number }>;
}) {
  const [categories, setCategories] = useState(initial);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function resetForm() {
    setEditingId(null);
    setName("");
    setDescription("");
  }

  function startEdit(category: Category) {
    setEditingId(category.id);
    setName(category.name);
    setDescription(category.description);
  }

  function submit() {
    if (!name.trim()) {
      setError("Give the category a name.");
      return;
    }
    setError(null);

    startTransition(async () => {
      const result = await saveCategoryAction({
        id: editingId ?? undefined,
        name,
        description,
      });

      if (!result.ok || !result.data) {
        setError(result.message ?? "Couldn't save that category.");
        return;
      }

      setCategories((current) => {
        const exists = current.some((item) => item.id === result.data!.id);
        return exists
          ? current.map((item) =>
              item.id === result.data!.id
                ? { ...result.data!, count: item.count }
                : item,
            )
          : [...current, { ...result.data!, count: 0 }];
      });

      resetForm();
    });
  }

  function remove(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await deleteCategoryAction(id);
      if (!result.ok) {
        setError(result.message ?? "Couldn't delete that category.");
        return;
      }
      setCategories((current) => current.filter((item) => item.id !== id));
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        {categories.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-zinc-400">
            No categories yet — add your first one.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs text-zinc-500 uppercase">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Slug</th>
                <th className="px-5 py-3 font-medium">Posts</th>
                <th className="px-5 py-3 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-5 py-4 font-medium text-zinc-900">
                    {category.name}
                  </td>
                  <td className="px-5 py-4 text-zinc-500">{category.slug}</td>
                  <td className="px-5 py-4 text-zinc-500">{category.count}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-4">
                      <button
                        type="button"
                        onClick={() => startEdit(category)}
                        className="text-xs font-medium text-zinc-600 hover:text-zinc-900"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(category.id)}
                        disabled={pending || category.count > 0}
                        className="text-xs font-medium text-zinc-500 transition-colors hover:text-red-600 disabled:opacity-30"
                        title={
                          category.count > 0
                            ? "Reassign its posts before deleting"
                            : undefined
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="h-fit rounded-xl border border-zinc-200 bg-white p-5">
        <p className="text-sm font-medium text-zinc-900">
          {editingId ? "Edit category" : "New category"}
        </p>

        <div className="mt-4 space-y-4">
          <Field label="Name" htmlFor="cat-name">
            <input
              id="cat-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Engineering"
              className={inputClass}
            />
          </Field>
          <Field label="Description" htmlFor="cat-description">
            <textarea
              id="cat-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={2}
              placeholder="Optional — shown at the top of the category page."
              className={`${inputClass} resize-y`}
            />
          </Field>
        </div>

        {error ? <p className="mt-3 text-xs text-red-600">{error}</p> : null}

        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={submit}
            disabled={pending}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-60"
          >
            {editingId ? "Save changes" : "Add category"}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm text-zinc-500 hover:text-zinc-900"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
