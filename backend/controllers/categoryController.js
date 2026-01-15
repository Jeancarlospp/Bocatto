import Category from '../models/Category.js';
import Product from '../models/Menu.js';

/**
 * Create new category
 * POST /categories
 * Protected: Admin only
 */
export const createCategory = async (req, res) => {
  try {
    console.log('📝 Creating category - Request body:', req.body);
    
    const { name, description, icon, displayOrder } = req.body;

    // Check if category already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
    
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una categoría con ese nombre'
      });
    }

    // Create category
    const category = await Category.create({
      name,
      description: description || undefined,
      icon: icon || '🍽️',
      displayOrder: displayOrder || 0
    });

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });

  } catch (error) {
    console.error('❌ Create category error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una categoría con ese nombre'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error creating category'
    });
  }
};

/**
 * Get all categories
 * GET /categories
 * Query params: ?activeOnly=true (optional)
 */
export const getAllCategories = async (req, res) => {
  try {
    const { activeOnly } = req.query;

    // Build query filter
    const filter = {};
    if (activeOnly === 'true') {
      filter.isActive = true;
    }

    const categories = await Category.find(filter).sort({ displayOrder: 1, name: 1 });

    // Get product count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.countDocuments({ category: cat.name });
        return {
          ...cat.toObject(),
          productCount: count
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: categoriesWithCount.length,
      data: categoriesWithCount
    });

  } catch (error) {
    console.error('Get all categories error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
};

/**
 * Get category by ID
 * GET /categories/:id
 */
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    let category;

    // Try to find by incremental id first
    if (!isNaN(id)) {
      category = await Category.findOne({ id: parseInt(id) });
    }
    
    // If not found, try by MongoDB _id
    if (!category) {
      category = await Category.findById(id);
    }

    // If not found, try by slug
    if (!category) {
      category = await Category.findOne({ slug: id });
    }

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get product count
    const productCount = await Product.countDocuments({ category: category.name });

    return res.status(200).json({
      success: true,
      data: {
        ...category.toObject(),
        productCount
      }
    });

  } catch (error) {
    console.error('Get category by ID error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error fetching category'
    });
  }
};

/**
 * Update category
 * PUT /categories/:id
 * Protected: Admin only
 */
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📝 Updating category:', id);
    console.log('📝 Update data:', req.body);

    let category;
    if (!isNaN(id)) {
      category = await Category.findOne({ id: parseInt(id) });
    } else {
      category = await Category.findById(id);
    }

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const { name, description, icon, displayOrder, isActive } = req.body;
    const oldName = category.name;

    // Check if new name already exists (excluding current category)
    if (name && name !== oldName) {
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: category._id }
      });
      
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe otra categoría con ese nombre'
        });
      }
    }

    // Update fields
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (icon) category.icon = icon;
    if (displayOrder !== undefined) category.displayOrder = displayOrder;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    // If name changed, update all products with old category name
    if (name && name !== oldName) {
      await Product.updateMany(
        { category: oldName },
        { $set: { category: name } }
      );
      console.log(`Updated products from category "${oldName}" to "${name}"`);
    }

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });

  } catch (error) {
    console.error('❌ Update category error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error updating category'
    });
  }
};

/**
 * Delete category (soft delete - marks as inactive)
 * DELETE /categories/:id
 * Protected: Admin only
 */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    let category;
    if (!isNaN(id)) {
      category = await Category.findOne({ id: parseInt(id) });
    } else {
      category = await Category.findById(id);
    }

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has products
    const productCount = await Product.countDocuments({ category: category.name });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar. Esta categoría tiene ${productCount} productos asociados. Mueve o elimina los productos primero.`
      });
    }

    // Hard delete since no products
    await Category.findByIdAndDelete(category._id);

    return res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('Delete category error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting category'
    });
  }
};

/**
 * Toggle category active status
 * PATCH /categories/:id/toggle
 * Protected: Admin only
 */
export const toggleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;

    let category;
    if (!isNaN(id)) {
      category = await Category.findOne({ id: parseInt(id) });
    } else {
      category = await Category.findById(id);
    }

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    category.isActive = !category.isActive;
    await category.save();

    return res.status(200).json({
      success: true,
      message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`,
      data: category
    });

  } catch (error) {
    console.error('Toggle category status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error toggling category status'
    });
  }
};

/**
 * Reorder categories
 * PUT /categories/reorder
 * Protected: Admin only
 */
export const reorderCategories = async (req, res) => {
  try {
    const { categories } = req.body;

    if (!Array.isArray(categories)) {
      return res.status(400).json({
        success: false,
        message: 'Categories array is required'
      });
    }

    // Update display order for each category
    const updatePromises = categories.map((cat, index) => {
      return Category.findByIdAndUpdate(
        cat._id,
        { displayOrder: index },
        { new: true }
      );
    });

    await Promise.all(updatePromises);

    return res.status(200).json({
      success: true,
      message: 'Categories reordered successfully'
    });

  } catch (error) {
    console.error('Reorder categories error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error reordering categories'
    });
  }
};

/**
 * Seed initial categories
 * POST /categories/seed
 * Protected: Admin only
 */
export const seedCategories = async (req, res) => {
  try {
    // Check if categories already exist
    const existingCount = await Category.countDocuments();
    if (existingCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Ya existen ${existingCount} categorías. No se puede sembrar.`
      });
    }

    const defaultCategories = [
      { name: 'Entradas y Snacks', icon: '🥗', description: 'Aperitivos y bocadillos para comenzar', displayOrder: 1 },
      { name: 'Platos Fuertes', icon: '🍖', description: 'Platos principales del menú', displayOrder: 2 },
      { name: 'Hamburguesas', icon: '🍔', description: 'Hamburguesas gourmet y clásicas', displayOrder: 3 },
      { name: 'Pizzas', icon: '🍕', description: 'Pizzas artesanales', displayOrder: 4 },
      { name: 'Pastas', icon: '🍝', description: 'Pastas frescas y tradicionales', displayOrder: 5 },
      { name: 'Ensaladas', icon: '🥬', description: 'Ensaladas frescas y saludables', displayOrder: 6 },
      { name: 'Postres', icon: '🍰', description: 'Dulces y postres deliciosos', displayOrder: 7 },
      { name: 'Bebidas', icon: '🥤', description: 'Bebidas frías y calientes', displayOrder: 8 }
    ];

    // Usar create() en loop para que se ejecuten los hooks pre-save
    const createdCategories = [];
    for (const catData of defaultCategories) {
      const category = await Category.create(catData);
      createdCategories.push(category);
    }

    return res.status(201).json({
      success: true,
      message: `${createdCategories.length} categories seeded successfully`,
      data: createdCategories
    });

  } catch (error) {
    console.error('Seed categories error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error seeding categories'
    });
  }
};

/**
 * Reset categories - Delete all and reseed
 * POST /categories/reset
 * Protected: Admin only
 */
export const resetCategories = async (req, res) => {
  try {
    // Delete all categories
    await Category.deleteMany({});
    
    const defaultCategories = [
      { name: 'Entradas y Snacks', icon: '🥗', description: 'Aperitivos y bocadillos para comenzar', displayOrder: 1 },
      { name: 'Platos Fuertes', icon: '🍖', description: 'Platos principales del menú', displayOrder: 2 },
      { name: 'Hamburguesas', icon: '🍔', description: 'Hamburguesas gourmet y clásicas', displayOrder: 3 },
      { name: 'Pizzas', icon: '🍕', description: 'Pizzas artesanales', displayOrder: 4 },
      { name: 'Pastas', icon: '🍝', description: 'Pastas frescas y tradicionales', displayOrder: 5 },
      { name: 'Ensaladas', icon: '🥬', description: 'Ensaladas frescas y saludables', displayOrder: 6 },
      { name: 'Postres', icon: '🍰', description: 'Dulces y postres deliciosos', displayOrder: 7 },
      { name: 'Bebidas', icon: '🥤', description: 'Bebidas frías y calientes', displayOrder: 8 }
    ];

    // Crear categorías una por una para que se ejecuten los hooks
    const createdCategories = [];
    for (const catData of defaultCategories) {
      const category = await Category.create(catData);
      createdCategories.push(category);
    }

    return res.status(201).json({
      success: true,
      message: `Categories reset. ${createdCategories.length} categories created.`,
      data: createdCategories
    });

  } catch (error) {
    console.error('Reset categories error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error resetting categories'
    });
  }
};
