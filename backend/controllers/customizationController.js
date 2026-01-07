import Product from '../models/Menu.js';
import Cart from '../models/Cart.js';
import User from '../models/User.js';

/**
 * Get customization options for a product
 * GET /api/products/:id/customization-options
 * Public
 */
export const getCustomizationOptions = async (req, res) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id);

    let product;
    if (!isNaN(productId)) {
      product = await Product.findOne({ productId });
    } else {
      product = await Product.findById(id);
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Common allergens mapping
    const allergenKeywords = {
      'gluten': ['pan', 'trigo', 'harina', 'pasta', 'crutones'],
      'lactosa': ['queso', 'leche', 'crema', 'mantequilla', 'yogurt'],
      'maní': ['maní', 'cacahuate', 'cacahuete'],
      'mariscos': ['camarón', 'langosta', 'cangrejo', 'almeja'],
      'huevo': ['huevo', 'mayonesa'],
      'soya': ['soya', 'tofu', 'salsa de soya'],
      'frutos_secos': ['nuez', 'almendra', 'avellana', 'pistacho'],
      'pescado': ['pescado', 'atún', 'salmón'],
      'mostaza': ['mostaza'],
      'sésamo': ['sésamo', 'ajonjolí']
    };

    // Detect allergens in ingredients
    const detectedAllergens = [];
    const ingredients = product.ingredients || [];

    ingredients.forEach(ingredient => {
      const ingredientLower = ingredient.toLowerCase();
      Object.keys(allergenKeywords).forEach(allergen => {
        if (allergenKeywords[allergen].some(keyword => ingredientLower.includes(keyword))) {
          if (!detectedAllergens.includes(allergen)) {
            detectedAllergens.push(allergen);
          }
        }
      });
    });

    // Build removable ingredients (all by default)
    const removableIngredients = ingredients.map(ingredient => ({
      name: ingredient,
      removable: true
    }));

    // Common extras (you can customize this based on your business logic)
    const commonExtras = [
      { name: 'queso extra', price: 1.50 },
      { name: 'bacon', price: 2.00 },
      { name: 'aguacate', price: 1.75 },
      { name: 'huevo', price: 1.00 },
      { name: 'doble carne', price: 3.00 }
    ];

    return res.status(200).json({
      success: true,
      data: {
        productId: product.productId,
        productName: product.name,
        basePrice: product.price,
        removableIngredients,
        addableExtras: commonExtras,
        detectedAllergens,
        allergenWarnings: detectedAllergens.length > 0
          ? `This product contains: ${detectedAllergens.join(', ')}`
          : 'No common allergens detected'
      }
    });

  } catch (error) {
    console.error('Get customization options error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching customization options'
    });
  }
};

/**
 * Calculate custom price with extras
 * POST /api/products/:id/calculate-custom-price
 * Public
 */
export const calculateCustomPrice = async (req, res) => {
  try {
    const { id } = req.params;
    const { removedIngredients = [], addedExtras = [] } = req.body;

    const productId = parseInt(id);
    let product;

    if (!isNaN(productId)) {
      product = await Product.findOne({ productId });
    } else {
      product = await Product.findById(id);
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const basePrice = product.price;

    // Calculate discount for removed ingredients (free by default)
    const removedIngredientsDiscount = 0.00;

    // Calculate extras price
    let extrasPrice = 0;
    if (Array.isArray(addedExtras)) {
      addedExtras.forEach(extra => {
        if (extra.price) {
          extrasPrice += Number(extra.price);
        }
      });
    }

    const totalPrice = basePrice + extrasPrice - removedIngredientsDiscount;

    return res.status(200).json({
      success: true,
      priceBreakdown: {
        basePrice: basePrice.toFixed(2),
        removedIngredientsDiscount: removedIngredientsDiscount.toFixed(2),
        extrasPrice: extrasPrice.toFixed(2),
        totalPrice: totalPrice.toFixed(2)
      }
    });

  } catch (error) {
    console.error('Calculate custom price error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error calculating custom price'
    });
  }
};

/**
 * Get allergy warnings for cart
 * GET /api/cart/allergy-warnings
 * Optional authentication
 */
export const getCartAllergyWarnings = async (req, res) => {
  try {
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    // Find cart
    const cart = await Cart.findOne({
      sessionId,
      status: 'active'
    }).populate('items.product', 'name ingredients');

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Get user allergies if user is authenticated
    let userAllergies = [];
    if (req.user) {
      const user = await User.findOne({ id: req.user.userId });
      if (user && user.allergies) {
        userAllergies = user.allergies;
      }
    }

    // Common allergens mapping
    const allergenKeywords = {
      'gluten': ['pan', 'trigo', 'harina', 'pasta', 'crutones'],
      'lactosa': ['queso', 'leche', 'crema', 'mantequilla', 'yogurt'],
      'maní': ['maní', 'cacahuate', 'cacahuete'],
      'mariscos': ['camarón', 'langosta', 'cangrejo', 'almeja'],
      'huevo': ['huevo', 'mayonesa'],
      'soya': ['soya', 'tofu', 'salsa de soya'],
      'frutos_secos': ['nuez', 'almendra', 'avellana', 'pistacho'],
      'pescado': ['pescado', 'atún', 'salmón'],
      'mostaza': ['mostaza'],
      'sésamo': ['sésamo', 'ajonjolí']
    };

    const warnings = [];
    let criticalAllergens = [];

    // Analyze each cart item
    cart.items.forEach(item => {
      const product = item.product;
      if (!product || !product.ingredients) return;

      const itemAllergens = [];
      const ingredients = product.ingredients || [];

      // Detect allergens in product
      ingredients.forEach(ingredient => {
        const ingredientLower = ingredient.toLowerCase();
        Object.keys(allergenKeywords).forEach(allergen => {
          if (allergenKeywords[allergen].some(keyword => ingredientLower.includes(keyword))) {
            if (!itemAllergens.includes(allergen)) {
              itemAllergens.push(allergen);
            }
          }
        });
      });

      // Check against user allergies
      if (userAllergies.length > 0 && itemAllergens.length > 0) {
        const matchedAllergens = [];

        userAllergies.forEach(userAllergy => {
          if (itemAllergens.includes(userAllergy.allergen)) {
            matchedAllergens.push({
              allergen: userAllergy.allergen,
              severity: userAllergy.severity,
              foundIn: ingredients.filter(ing => {
                const ingLower = ing.toLowerCase();
                return allergenKeywords[userAllergy.allergen]?.some(keyword =>
                  ingLower.includes(keyword)
                );
              })
            });

            if (userAllergy.severity === 'high') {
              criticalAllergens.push(userAllergy.allergen);
            }
          }
        });

        if (matchedAllergens.length > 0) {
          warnings.push({
            itemId: item.productId,
            productName: product.name,
            allergens: matchedAllergens
          });
        }
      }
    });

    const hasWarnings = warnings.length > 0;

    return res.status(200).json({
      success: true,
      hasWarnings,
      warnings,
      summary: {
        totalItems: cart.items.length,
        itemsWithWarnings: warnings.length,
        criticalAllergens: [...new Set(criticalAllergens)]
      },
      recommendation: hasWarnings
        ? '⚠️ You have products in your cart with allergens you have marked. Review customizations before completing your order.'
        : 'Your cart does not contain allergens you have marked.'
    });

  } catch (error) {
    console.error('Get cart allergy warnings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching allergy warnings'
    });
  }
};
