"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/client";
import { useState, type FormEvent } from "react";
import type { SerializedCategory } from "@/types/course";

interface CourseFiltersProps {
  basePath: string;
  categories?: SerializedCategory[];
  defaultValues: {
    search?: string;
    category?: string;
    level?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}

const LEVEL_OPTIONS = [
  { value: "", label: "All levels" },
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
];

export function CourseFilters({ basePath, categories, defaultValues }: CourseFiltersProps) {
  const { dictionary } = useI18n();
  const router = useRouter();
  const [search, setSearch] = useState(defaultValues.search ?? "");
  const [category, setCategory] = useState(defaultValues.category ?? "");
  const [level, setLevel] = useState(defaultValues.level ?? "");
  const [minPrice, setMinPrice] = useState(defaultValues.minPrice ?? "");
  const [maxPrice, setMaxPrice] = useState(defaultValues.maxPrice ?? "");

  function applyFilters(overrides: Record<string, string> = {}) {
    const values: Record<string, string> = {
      search,
      category,
      level,
      minPrice,
      maxPrice,
      ...overrides,
    };
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(values)) {
      if (value) params.set(key, value);
    }
    router.push(`${basePath}${params.toString() ? `?${params.toString()}` : ""}`);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    applyFilters();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-3 rounded-xl border border-neutral-200 p-4 sm:grid-cols-2 lg:grid-cols-5 dark:border-neutral-800"
    >
      <div className="lg:col-span-2">
        <label htmlFor="course-search" className="sr-only">
          {dictionary.search}
        </label>
        <input
          id="course-search"
          type="search"
          placeholder={dictionary.search}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
      </div>

      {categories && (
        <div>
          <label htmlFor="course-category" className="sr-only">
            Category
          </label>
          <select
            id="course-category"
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              applyFilters({ category: event.target.value });
            }}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          >
            <option value="">{dictionary.allCategories}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="course-level" className="sr-only">
          Level
        </label>
        <select
          id="course-level"
          value={level}
          onChange={(event) => {
            setLevel(event.target.value);
            applyFilters({ level: event.target.value });
          }}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        >
          {LEVEL_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <div className="w-full">
          <label htmlFor="course-min-price" className="sr-only">
            Minimum price
          </label>
          <input
            id="course-min-price"
            type="number"
            min={0}
            placeholder="Min $"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>
        <div className="w-full">
          <label htmlFor="course-max-price" className="sr-only">
            Maximum price
          </label>
          <input
            id="course-max-price"
            type="number"
            min={0}
            placeholder="Max $"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>
      </div>

      <button
        type="submit"
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 sm:col-span-2 lg:col-span-5 lg:w-fit dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
      >
        {dictionary.filters}
      </button>
    </form>
  );
}
