const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Fetch all menu items
 */
export async function fetchMenu() {
  try {
    const response = await fetch(`${API_URL}/api/menu`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Create a new product
 * @param {Object} productData - Product information
 * @returns {Promise<Object>} Created product data
 */
export async function createProduct(productData) {
  try {
    const response = await fetch(`${API_URL}/api/menu`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(productData)
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error creating product');
    }

    return data;
  } catch (error) {
    console.error('Create Product Error:', error);
    throw error;
  }
}

/**
 * Fetch single product by ID
 * @param {string} id - Product ID
 * @returns {Promise<Object>} Product data
 */
export async function fetchProductById(id) {
  try {
    const response = await fetch(`${API_URL}/api/menu/${id}`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Update an existing product
 * @param {string} id - Product ID
 * @param {FormData} formData - Product data with optional image
 * @returns {Promise<Object>} Updated product data
 */
export async function updateProduct(id, formData) {
  try {
    const response = await fetch(`${API_URL}/api/menu/${id}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData
      // Don't set Content-Type header - browser will set it automatically with boundary
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error updating product');
    }

    return data;
  } catch (error) {
    console.error('Update Product Error:', error);
    throw error;
  }
}

/**
 * Fetch all active areas (for public reservations page)
 * @returns {Promise<Object>} Areas data
 */
export async function fetchActiveAreas() {
  try {
    const response = await fetch(`${API_URL}/areas?activeOnly=true`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch Areas Error:', error);
    throw error;
  }
}
