import Product from '../models/Menu.js';

/**
 * GET /api/menu
 * Get all products
 */
export const getAllMenu = async (req, res) => {
  try {
    const products = await Product.find().sort({ creationDate: 1 });
    
    // Auto-assign productId to products without ID
    const updates = [];
    const productsWithId = products.map((product, index) => {
      const obj = product.toObject();
      if (!obj.productId || obj.productId === 0) {
        obj.productId = index + 1;
        updates.push({
          updateOne: {
            filter: { _id: product._id },
            update: { $set: { productId: index + 1 } }
          }
        });
      }
      return obj;
    });
    
    if (updates.length > 0) {
      await Product.bulkWrite(updates);
    }
    
    res.status(200).json({
      success: true,
      count: productsWithId.length,
      data: productsWithId
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

/**
 * POST /api/menu
 * Create a new product
 * Requires admin authentication
 * Handles image upload via Cloudinary
 */
export const createProduct = async (req, res) => {
  try {
    // Get image URL from Cloudinary upload (added by multer middleware)
    const imageUrl = req.file ? req.file.path : null;
    
    // Validate image was uploaded
    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Product image is required'
      });
    }

    // Create product data with image URL from Cloudinary
    const productData = {
      ...req.body,
      img: imageUrl
    };

    // Parse ingredients if sent as string
    if (typeof productData.ingredients === 'string') {
      productData.ingredients = productData.ingredients
        .split(',')
        .map(i => i.trim())
        .filter(i => i);
    }

    const product = await Product.create(productData);
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Product already exists'
      });
    }

    res.status(400).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
};

/**
 * GET /api/menu/:id
 * Get product by ID
 */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
};

/**
 * PUT /api/menu/:id
 * Update existing product
 * Requires admin authentication
 * Optionally handles new image upload
 */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Find existing product
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update fields from request body
    const { name, description, price, category, subcategory, currentStock, available, ingredients } = req.body;

    if (name) product.name = name.trim();
    if (description) product.description = description.trim();
    if (price) product.price = parseFloat(price);
    if (category) product.category = category;
    if (subcategory !== undefined) product.subcategory = subcategory.trim();
    if (currentStock !== undefined) product.currentStock = parseInt(currentStock);
    if (available !== undefined) product.available = available === 'true' || available === true;

    // Parse ingredients if sent as string
    if (ingredients) {
      if (typeof ingredients === 'string') {
        product.ingredients = ingredients
          .split(',')
          .map(i => i.trim())
          .filter(i => i);
      } else {
        product.ingredients = ingredients;
      }
    }

    // Handle image update if new file was uploaded
    if (req.file) {
      // Note: Old image in Cloudinary could be deleted here if needed
      // For now, we just update the URL
      product.img = req.file.path;
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });

  } catch (error) {
    console.error('Error updating product:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
};

/**
 * Delete product (Soft delete - sets available to false)
 * DELETE /api/menu/:id
 * Protected: Admin only
 * 
 * Note: Uses soft delete to preserve data integrity.
 * Products are not physically deleted from database.
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Soft delete: mark as unavailable
    product.available = false;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting product:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
};
