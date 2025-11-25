import prisma from '../database/prisma.js';

export async function listTaxonomies() {
  try {
    const taxonomies = await prisma.taxonomy.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
    });
    return taxonomies || [];
  } catch (error) {
    throw error;
  }
}

export async function getTaxonomyByKey(key) {
  try {
    const taxonomy = await prisma.taxonomy.findUnique({
      where: { key },
    });
    return taxonomy || null;
  } catch (error) {
    throw error;
  }
}

export async function createTaxonomy({ key, name, description, sort_order = 0 }) {
  try {
    const taxonomy = await prisma.taxonomy.create({
      data: {
        key,
        name,
        description: description || null,
        sortOrder: sort_order,
      },
    });
    return taxonomy;
  } catch (error) {
    throw error;
  }
}

export async function updateTaxonomy(id, { name, description, sort_order }) {
  try {
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (sort_order !== undefined) updateData.sortOrder = sort_order;

    const taxonomy = await prisma.taxonomy.update({
      where: { id },
      data: updateData,
    });
    return taxonomy || null;
  } catch (error) {
    if (error.code === 'P2025') {
      return null;
    }
    throw error;
  }
}

export async function deleteTaxonomy(id) {
  try {
    await prisma.taxonomy.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    throw error;
  }
}

export async function listTerms(taxonomyKey) {
  try {
    const where = taxonomyKey ? {
      taxonomy: {
        key: taxonomyKey,
      },
    } : {};

    const terms = await prisma.taxonomyTerm.findMany({
      where,
      include: {
        taxonomy: {
          select: {
            key: true,
            name: true,
          },
        },
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
    });
    return terms.map((term) => ({ ...term, taxonomy_key: term.taxonomy.key }));
  } catch (error) {
    throw error;
  }
}

export async function listTermsByTaxonomyId(taxonomyId) {
  try {
    const terms = await prisma.taxonomyTerm.findMany({
      where: { taxonomyId },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
    });
    return terms || [];
  } catch (error) {
    throw error;
  }
}

export async function createTerm({ taxonomy_id, name, slug, description, color, sort_order = 0 }) {
  try {
    const term = await prisma.taxonomyTerm.create({
      data: {
        taxonomyId: taxonomy_id,
        name,
        slug,
        description: description || null,
        color: color || null,
        sortOrder: sort_order,
      },
    });
    return term;
  } catch (error) {
    throw error;
  }
}

export async function updateTerm(id, { name, slug, description, color, sort_order }) {
  try {
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (color !== undefined) updateData.color = color;
    if (sort_order !== undefined) updateData.sortOrder = sort_order;

    const term = await prisma.taxonomyTerm.update({
      where: { id },
      data: updateData,
    });
    return term || null;
  } catch (error) {
    if (error.code === 'P2025') {
      return null;
    }
    throw error;
  }
}

export async function deleteTerm(id) {
  try {
    await prisma.taxonomyTerm.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    throw error;
  }
}

export async function listArticleTerms(articleId) {
  try {
    const articleTerms = await prisma.articleTerm.findMany({
      where: { articleId },
      include: {
        term: {
          include: {
            taxonomy: {
              select: {
                key: true,
                name: true,
              },
            },
          },
        },
      },
    });
    return articleTerms.map((at) => at.term);
  } catch (error) {
    throw error;
  }
}

export async function setArticleTerms(articleId, termIds) {
  try {
    // Replace strategy: delete then insert
    await prisma.articleTerm.deleteMany({
      where: { articleId },
    });

    if (!termIds || termIds.length === 0) return true;

    await prisma.articleTerm.createMany({
      data: termIds.map((termId) => ({
        articleId,
        termId,
      })),
      skipDuplicates: true,
    });
    return true;
  } catch (error) {
    throw error;
  }
}
