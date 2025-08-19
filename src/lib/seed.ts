import { prisma } from './prisma';
import { categories } from '@/data/categories';

export async function seedCategories() {
  try {
    console.log('Seeding categories...');
    
    for (const category of categories) {
      await prisma.category.upsert({
        where: { id: category.id },
        update: {
          name: category.name,
          description: category.description
        },
        create: {
          id: category.id,
          name: category.name,
          description: category.description,
          parentId: null
        }
      });

      // Add subcategories
      if (category.subcategories) {
        for (const subcategory of category.subcategories) {
          await prisma.category.upsert({
            where: { id: subcategory.id },
            update: {
              name: subcategory.name,
              description: subcategory.description,
              parentId: category.id
            },
            create: {
              id: subcategory.id,
              name: subcategory.name,
              description: subcategory.description,
              parentId: category.id
            }
          });
        }
      }
    }
    
    console.log('Categories seeded successfully');
  } catch (error) {
    console.error('Error seeding categories:', error);
  }
}