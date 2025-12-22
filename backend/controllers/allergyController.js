import User from '../models/User.js';
import Product from '../models/Menu.js';

/**
 * Save or update user allergies
 * POST /api/users/me/allergies
 * Protected: Client authentication required
 */
export const saveUserAllergies = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { allergies } = req.body;

    if (!Array.isArray(allergies)) {
      return res.status(400).json({
        success: false,
        message: 'Allergies must be an array'
      });
    }

    // Validate allergies format
    const validAllergens = ['gluten', 'lactosa', 'maní', 'mariscos', 'huevo', 'soya', 'frutos_secos', 'pescado', 'apio', 'mostaza', 'sésamo', 'sulfitos'];
    const validSeverities = ['low', 'medium', 'high'];

    for (const allergy of allergies) {
      if (!allergy.allergen || !validAllergens.includes(allergy.allergen)) {
        return res.status(400).json({
          success: false,
          message: `Invalid allergen: ${allergy.allergen}. Valid options: ${validAllergens.join(', ')}`
        });
      }
      if (allergy.severity && !validSeverities.includes(allergy.severity)) {
        return res.status(400).json({
          success: false,
          message: `Invalid severity: ${allergy.severity}. Valid options: ${validSeverities.join(', ')}`
        });
      }
    }

    // Find user and update allergies
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Add timestamp to new allergies
    const formattedAllergies = allergies.map(allergy => ({
      allergen: allergy.allergen,
      severity: allergy.severity || 'medium',
      addedAt: new Date()
    }));

    user.allergies = formattedAllergies;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Allergy preferences saved successfully',
      data: {
        userId: user._id,
        allergies: user.allergies
      }
    });

  } catch (error) {
    console.error('Save user allergies error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error saving allergies'
    });
  }
};

/**
 * Get user allergies
 * GET /api/users/me/allergies
 * Protected: Client authentication required
 */
export const getUserAllergies = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select('allergies');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        allergies: user.allergies || [],
        count: user.allergies?.length || 0
      }
    });

  } catch (error) {
    console.error('Get user allergies error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching allergies'
    });
  }
};

/**
 * Get safe products for user based on their allergies
 * GET /api/users/me/safe-products
 * Protected: Client authentication required
 */
export const getSafeProducts = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user with allergies
    const user = await User.findById(userId).select('allergies');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userAllergies = user.allergies || [];

    if (userAllergies.length === 0) {
      // If user has no allergies, all products are safe
      const allProducts = await Product.find({ available: true })
        .select('productId name price category img');

      return res.status(200).json({
        success: true,
        data: {
          safeProducts: allProducts,
          unsafeProducts: [],
          stats: {
            totalProducts: allProducts.length,
            safeCount: allProducts.length,
            unsafeCount: 0
          }
        }
      });
    }

    // Get all available products
    const allProducts = await Product.find({ available: true });

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

    const safeProducts = [];
    const unsafeProducts = [];

    // Check each product
    allProducts.forEach(product => {
      const ingredients = product.ingredients || [];
      const productAllergens = [];

      // Detect allergens in product
      ingredients.forEach(ingredient => {
        const ingredientLower = ingredient.toLowerCase();
        userAllergies.forEach(userAllergy => {
          const keywords = allergenKeywords[userAllergy.allergen] || [];
          if (keywords.some(keyword => ingredientLower.includes(keyword))) {
            if (!productAllergens.includes(userAllergy.allergen)) {
              productAllergens.push(userAllergy.allergen);
            }
          }
        });
      });

      const productData = {
        productId: product.productId,
        name: product.name,
        price: product.price,
        category: product.category,
        img: product.img
      };

      if (productAllergens.length === 0) {
        safeProducts.push(productData);
      } else {
        unsafeProducts.push({
          ...productData,
          allergens: productAllergens,
          canBeCustomized: true
        });
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        safeProducts,
        unsafeProducts,
        stats: {
          totalProducts: allProducts.length,
          safeCount: safeProducts.length,
          unsafeCount: unsafeProducts.length
        }
      }
    });

  } catch (error) {
    console.error('Get safe products error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching safe products'
    });
  }
};

/**
 * Check if a specific product is safe for user
 * POST /api/users/me/allergies/check-product/:id
 * Protected: Client authentication required
 */
export const checkProduct = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    // Get user allergies
    const user = await User.findById(userId).select('allergies');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get product
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

    const userAllergies = user.allergies || [];

    if (userAllergies.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          productId: product.productId,
          productName: product.name,
          isSafe: true,
          matchedAllergens: [],
          warning: null,
          canCustomize: true
        }
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

    const ingredients = product.ingredients || [];
    const matchedAllergens = [];
    const customizationSuggestions = [];

    // Check for allergen matches
    userAllergies.forEach(userAllergy => {
      const keywords = allergenKeywords[userAllergy.allergen] || [];
      const foundIn = [];

      ingredients.forEach(ingredient => {
        const ingredientLower = ingredient.toLowerCase();
        if (keywords.some(keyword => ingredientLower.includes(keyword))) {
          foundIn.push(ingredient);
        }
      });

      if (foundIn.length > 0) {
        matchedAllergens.push({
          allergen: userAllergy.allergen,
          severity: userAllergy.severity,
          foundIn
        });

        // Generate customization suggestions
        foundIn.forEach(ing => {
          customizationSuggestions.push(`Puedes pedir sin ${ing} (elimina ${userAllergy.allergen})`);
        });
      }
    });

    const isSafe = matchedAllergens.length === 0;

    return res.status(200).json({
      success: true,
      data: {
        productId: product.productId,
        productName: product.name,
        isSafe,
        matchedAllergens,
        warning: isSafe
          ? null
          : '⚠️ Este producto contiene alérgenos que has marcado como peligrosos',
        canCustomize: true,
        customizationSuggestions: isSafe ? [] : customizationSuggestions
      }
    });

  } catch (error) {
    console.error('Check product error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking product'
    });
  }
};
