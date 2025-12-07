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
