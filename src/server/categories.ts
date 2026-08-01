import { prisma } from "@/lib/prisma";
import { toJSONSafe } from "@/lib/serialize";

export async function listCategories() {
  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: { displayOrder: "asc" },
  });
  return toJSONSafe(categories);
}

export async function getCategoryBySlug(slug: string) {
  const category = await prisma.category.findFirst({
    where: { slug, active: true },
  });
  return category ? toJSONSafe(category) : null;
}
