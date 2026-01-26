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
 * Toggle product availability (Enable/Disable)
 * @param {string} id - Product ID
 * @returns {Promise<Object>} Updated product data
 */
export async function toggleProductAvailability(id) {
  try {
    const response = await fetch(`${API_URL}/api/menu/${id}/toggle`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP Error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Error toggling product availability');
    }

    return data;
  } catch (error) {
    console.error('Toggle Product Availability Error:', error);
    throw error;
  }
}

/**
 * Delete a product permanently
 * @param {string} id - Product ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export async function deleteProduct(id) {
  try {
    const response = await fetch(`${API_URL}/api/menu/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error deleting product');
    }

    return data;
  } catch (error) {
    console.error('Delete Product Error:', error);
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

// ========================================
// RESERVATION API FUNCTIONS
// ========================================

/**
 * Create a new reservation
 * @param {Object} reservationData - { areaId, startTime, endTime, guestCount, notes?, paymentMethodSimulated? }
 * @returns {Promise<Object>} Created reservation data
 */
export async function createReservation(reservationData) {
  try {
    const response = await fetch(`${API_URL}/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // Include JWT cookie
      body: JSON.stringify(reservationData)
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error al crear la reservación');
    }

    return data;
  } catch (error) {
    console.error('Create Reservation Error:', error);
    throw error;
  }
}

/**
 * Get all reservations for the authenticated user
 * @param {Object} filters - { status?, upcoming? }
 * @returns {Promise<Object>} User's reservations
 */
export async function getMyReservations(filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.upcoming) queryParams.append('upcoming', filters.upcoming);

    const url = `${API_URL}/reservations/my-reservations${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    const response = await fetch(url, {
      credentials: 'include',
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error al obtener las reservaciones');
    }

    return data;
  } catch (error) {
    console.error('Get My Reservations Error:', error);
    throw error;
  }
}

/**
 * Get a specific reservation by ID
 * @param {string} id - Reservation ID
 * @returns {Promise<Object>} Reservation data
 */
export async function getReservationById(id) {
  try {
    const response = await fetch(`${API_URL}/reservations/${id}`, {
      credentials: 'include',
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error al obtener la reservación');
    }

    return data;
  } catch (error) {
    console.error('Get Reservation Error:', error);
    throw error;
  }
}

/**
 * Cancel a reservation
 * @param {string} id - Reservation ID
 * @returns {Promise<Object>} Cancellation confirmation
 */
export async function cancelReservation(id) {
  try {
    const response = await fetch(`${API_URL}/reservations/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error al cancelar la reservación');
    }

    return data;
  } catch (error) {
    console.error('Cancel Reservation Error:', error);
    throw error;
  }
}

/**
 * Confirm payment for a reservation (simulated)
 * @param {string} id - Reservation ID
 * @returns {Promise<Object>} Payment confirmation
 */
export async function confirmPayment(id) {
  try {
    const response = await fetch(`${API_URL}/reservations/${id}/confirm-payment`, {
      method: 'POST',
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error al confirmar el pago');
    }

    return data;
  } catch (error) {
    console.error('Confirm Payment Error:', error);
    throw error;
  }
}

/**
 * Check availability for an area on a specific date
 * @param {string} areaId - Area ID
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Object>} Availability data with reserved slots
 */
export async function checkAvailability(areaId, date) {
  try {
    const response = await fetch(`${API_URL}/reservations/availability/${areaId}?date=${date}`, {
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error al verificar disponibilidad');
    }

    return data;
  } catch (error) {
    console.error('Check Availability Error:', error);
    throw error;
  }
}

/**
 * Get all reservations (Admin only)
 * @param {Object} filters - { status?, areaId?, startDate?, endDate? }
 * @returns {Promise<Object>} All reservations
 */
export async function getAllReservations(filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.areaId) queryParams.append('areaId', filters.areaId);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);

    const url = `${API_URL}/reservations/admin/all${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    const response = await fetch(url, {
      credentials: 'include',
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error al obtener las reservaciones');
    }

    return data;
  } catch (error) {
    console.error('Get All Reservations Error:', error);
    throw error;
  }
}

/**
 * Cancel a reservation as admin
 * @param {string} id - Reservation ID
 * @returns {Promise<Object>} Cancellation confirmation
 */
export async function adminCancelReservation(id) {
  try {
    const response = await fetch(`${API_URL}/reservations/${id}/admin-cancel`, {
      method: 'DELETE',
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error al cancelar la reservación');
    }

    return data;
  } catch (error) {
    console.error('Admin Cancel Reservation Error:', error);
    throw error;
  }
}

/**
 * ========================================
 * OFFERS API FUNCTIONS
 * ========================================
 */

/**
 * Fetch all offers
 */
export async function fetchOffers() {
  try {
    const response = await fetch(`${API_URL}/offers`, {
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
 * Create a new offer
 * @param {FormData} formData - Offer data with optional image
 * @returns {Promise<Object>} Created offer data
 */
export async function createOffer(formData) {
  try {
    const response = await fetch(`${API_URL}/offers`, {
      method: 'POST',
      credentials: 'include',
      body: formData
      // Don't set Content-Type header - browser will set it automatically with boundary
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error creating offer');
    }

    return data;
  } catch (error) {
    console.error('Create Offer Error:', error);
    throw error;
  }
}

/**
 * Fetch single offer by ID
 * @param {string} id - Offer ID
 * @returns {Promise<Object>} Offer data
 */
export async function fetchOfferById(id) {
  try {
    const response = await fetch(`${API_URL}/offers/${id}`, {
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
 * Update an existing offer
 * @param {string} id - Offer ID
 * @param {FormData} formData - Offer data with optional image
 * @returns {Promise<Object>} Updated offer data
 */
export async function updateOffer(id, formData) {
  try {
    const response = await fetch(`${API_URL}/offers/${id}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData
      // Don't set Content-Type header - browser will set it automatically with boundary
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error updating offer');
    }

    return data;
  } catch (error) {
    console.error('Update Offer Error:', error);
    throw error;
  }
}

/**
 * Delete an offer
 * @param {string} id - Offer ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export async function deleteOffer(id) {
  try {
    const response = await fetch(`${API_URL}/offers/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error deleting offer');
    }

    return data;
  } catch (error) {
    console.error('Delete Offer Error:', error);
    throw error;
  }
}

/**
 * ========================================
 * AREAS API FUNCTIONS
 * ========================================
 */

/**
 * Get all areas
 * @returns {Promise<Object>} Areas data
 */
export async function getAreas() {
  try {
    const response = await fetch(`${API_URL}/areas`, {
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error al obtener los ambientes');
    }

    return data;
  } catch (error) {
    console.error('Get Areas Error:', error);
    throw error;
  }
}

// ========================================
// CART API FUNCTIONS
// ========================================

/**
 * Get or create cart
 * @param {string} sessionId - Session ID for the cart
 * @returns {Promise<Object>} Cart data
 */
export async function getCart(sessionId) {
  try {
    const response = await fetch(`${API_URL}/api/cart/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ sessionId })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error retrieving cart');
    }

    return data;
  } catch (error) {
    console.error('Get Cart Error:', error);
    throw error;
  }
}

/**
 * Add item to cart
 * @param {string} sessionId - Session ID
 * @param {string} productId - Product ID
 * @param {number} quantity - Quantity to add
 * @param {Object} customizations - { removedIngredients, addedIngredients, specialInstructions }
 * @returns {Promise<Object>} Updated cart data
 */
export async function addToCart(sessionId, productId, quantity, customizations) {
  try {
    const response = await fetch(`${API_URL}/api/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ 
        sessionId, 
        productId, 
        quantity, 
        customizations 
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error adding item to cart');
    }

    return data;
  } catch (error) {
    console.error('Add to Cart Error:', error);
    throw error;
  }
}

/**
 * Update cart item quantity
 * @param {string} sessionId - Session ID
 * @param {string} itemId - Cart item ID
 * @param {number} quantity - New quantity
 * @returns {Promise<Object>} Updated cart data
 */
export async function updateCartItem(sessionId, itemId, quantity) {
  try {
    const response = await fetch(`${API_URL}/api/cart/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ sessionId, itemId, quantity })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error updating cart item');
    }

    return data;
  } catch (error) {
    console.error('Update Cart Item Error:', error);
    throw error;
  }
}

/**
 * Remove item from cart
 * @param {string} sessionId - Session ID
 * @param {string} itemId - Cart item ID
 * @returns {Promise<Object>} Updated cart data
 */
export async function removeFromCart(sessionId, itemId) {
  try {
    const response = await fetch(`${API_URL}/api/cart/remove`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ sessionId, itemId })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error removing item from cart');
    }

    return data;
  } catch (error) {
    console.error('Remove from Cart Error:', error);
    throw error;
  }
}

/**
 * Clear all items from cart
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object>} Empty cart data
 */
export async function clearCart(sessionId) {
  try {
    const response = await fetch(`${API_URL}/api/cart/clear`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ sessionId })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error clearing cart');
    }

    return data;
  } catch (error) {
    console.error('Clear Cart Error:', error);
    throw error;
  }
}

/**
 * Create order (checkout)
 * POST /api/orders
 */
export async function createOrder(orderData) {
  try {
    // Include sessionId from localStorage
    const sessionId = localStorage.getItem('cartSessionId');

    console.log('=== CREATE ORDER DEBUG (Frontend) ===');
    console.log('SessionId from localStorage:', sessionId);
    console.log('Order data:', orderData);

    const response = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        ...orderData,
        sessionId
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error creating order');
    }

    return data;
  } catch (error) {
    console.error('Create Order Error:', error);
    throw error;
  }
}

/**
 * Get user's orders
 * GET /api/orders/my-orders
 */
export async function getMyOrders(params = {}) {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams ? `${API_URL}/api/orders/my-orders?${queryParams}` : `${API_URL}/api/orders/my-orders`;

    const response = await fetch(url, {
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error fetching orders');
    }

    return data;
  } catch (error) {
    console.error('Get My Orders Error:', error);
    throw error;
  }
}

// ========================================
// COUPON API FUNCTIONS
// ========================================

/**
 * Validate a coupon code
 * @param {string} code - Coupon code
 * @param {number} cartTotal - Cart subtotal
 * @returns {Promise<Object>} Validation result with discount info
 */
export async function validateCoupon(code, cartTotal) {
  try {
    const response = await fetch(`${API_URL}/coupons/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ code, cartTotal })
    });

    const data = await response.json();

    // Return data even if not successful (to show error message)
    return data;
  } catch (error) {
    console.error('Validate Coupon Error:', error);
    throw error;
  }
}

/**
 * Get all coupons (admin)
 * @returns {Promise<Object>} Coupons list
 */
export async function getAllCoupons() {
  try {
    const response = await fetch(`${API_URL}/coupons`, {
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error al obtener los cupones');
    }

    return data;
  } catch (error) {
    console.error('Get All Coupons Error:', error);
    throw error;
  }
}

/**
 * Create a new coupon (admin)
 * @param {Object} couponData - Coupon data
 * @returns {Promise<Object>} Created coupon
 */
export async function createCoupon(couponData) {
  try {
    const response = await fetch(`${API_URL}/coupons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(couponData)
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error al crear el cupón');
    }

    return data;
  } catch (error) {
    console.error('Create Coupon Error:', error);
    throw error;
  }
}

/**
 * Update a coupon (admin)
 * @param {string} id - Coupon ID
 * @param {Object} couponData - Updated coupon data
 * @returns {Promise<Object>} Updated coupon
 */
export async function updateCoupon(id, couponData) {
  try {
    const response = await fetch(`${API_URL}/coupons/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(couponData)
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error al actualizar el cupón');
    }

    return data;
  } catch (error) {
    console.error('Update Coupon Error:', error);
    throw error;
  }
}

/**
 * Delete a coupon (admin)
 * @param {string} id - Coupon ID
 * @returns {Promise<Object>} Deletion result
 */
export async function deleteCoupon(id) {
  try {
    const response = await fetch(`${API_URL}/coupons/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error al eliminar el cupón');
    }

    return data;
  } catch (error) {
    console.error('Delete Coupon Error:', error);
    throw error;
  }
}

/**
 * Toggle coupon active status (admin)
 * @param {string} id - Coupon ID
 * @returns {Promise<Object>} Updated coupon
 */
export async function toggleCoupon(id) {
  try {
    const response = await fetch(`${API_URL}/coupons/${id}/toggle`, {
      method: 'PATCH',
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error al cambiar el estado del cupón');
    }

    return data;
  } catch (error) {
    console.error('Toggle Coupon Error:', error);
    throw error;
  }
}

// ========================================
// REVIEW API FUNCTIONS
// ========================================

/**
 * Create a new review
 * @param {Object} reviewData - { type, targetId, stars, title?, comment }
 * @returns {Promise<Object>} Created review data
 */
export async function createReview(reviewData) {
  try {
    const response = await fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(reviewData)
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error al crear la reseña');
    }

    return data;
  } catch (error) {
    console.error('Create Review Error:', error);
    throw error;
  }
}

/**
 * Get reviews for a product
 * @param {number} productId - Product ID
 * @returns {Promise<Object>} Reviews data with average rating
 */
export async function getProductReviews(productId) {
  try {
    const response = await fetch(`${API_URL}/reviews/product/${productId}`, {
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error al obtener reseñas');
    }

    return data;
  } catch (error) {
    console.error('Get Product Reviews Error:', error);
    throw error;
  }
}

/**
 * Get my reviews (authenticated user)
 * @returns {Promise<Object>} User's reviews
 */
export async function getMyReviews() {
  try {
    const response = await fetch(`${API_URL}/reviews/my-reviews`, {
      credentials: 'include',
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error al obtener tus reseñas');
    }

    return data;
  } catch (error) {
    console.error('Get My Reviews Error:', error);
    throw error;
  }
}

/**
 * Update a review
 * @param {string} id - Review ID
 * @param {Object} reviewData - { stars?, title?, comment? }
 * @returns {Promise<Object>} Updated review data
 */
export async function updateReview(id, reviewData) {
  try {
    const response = await fetch(`${API_URL}/reviews/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(reviewData)
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error al actualizar la reseña');
    }

    return data;
  } catch (error) {
    console.error('Update Review Error:', error);
    throw error;
  }
}

/**
 * Delete a review
 * @param {string} id - Review ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export async function deleteReview(id) {
  try {
    const response = await fetch(`${API_URL}/reviews/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error al eliminar la reseña');
    }

    return data;
  } catch (error) {
    console.error('Delete Review Error:', error);
    throw error;
  }
}

/**
 * Get pending reviews (admin only)
 * @returns {Promise<Object>} Pending reviews
 */
export async function getPendingReviews() {
  try {
    const response = await fetch(`${API_URL}/reviews/pending`, {
      credentials: 'include',
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error al obtener reseñas pendientes');
    }

    return data;
  } catch (error) {
    console.error('Get Pending Reviews Error:', error);
    throw error;
  }
}

/**
 * Approve a review (admin only)
 * @param {string} id - Review ID
 * @returns {Promise<Object>} Approved review
 */
export async function approveReview(id) {
  try {
    const response = await fetch(`${API_URL}/reviews/${id}/approve`, {
      method: 'PATCH',
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error al aprobar la reseña');
    }

    return data;
  } catch (error) {
    console.error('Approve Review Error:', error);
    throw error;
  }
}

/**
 * Reject a review (admin only)
 * @param {string} id - Review ID
 * @returns {Promise<Object>} Rejected review
 */
export async function rejectReview(id) {
  try {
    const response = await fetch(`${API_URL}/reviews/${id}/reject`, {
      method: 'PATCH',
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error al rechazar la reseña');
    }

    return data;
  } catch (error) {
    console.error('Reject Review Error:', error);
    throw error;
  }
}

/**
 * Respond to a review (admin only)
 * @param {string} id - Review ID
 * @param {string} responseText - Admin response
 * @returns {Promise<Object>} Updated review with response
 */
export async function respondToReview(id, responseText) {
  try {
    const response = await fetch(`${API_URL}/reviews/${id}/respond`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ response: responseText })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error al responder la reseña');
    }

    return data;
  } catch (error) {
    console.error('Respond to Review Error:', error);
    throw error;
  }
}

/**
 * Get all approved reviews (public page)
 * @param {Object} filters - { type?, stars?, limit?, page? }
 * @returns {Promise<Object>} Approved reviews with user names
 */
export async function getApprovedReviews(filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.stars) queryParams.append('stars', filters.stars);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.page) queryParams.append('page', filters.page);

    const url = `${API_URL}/reviews/approved${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

    const response = await fetch(url, {
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error al obtener las reseñas');
    }

    return data;
  } catch (error) {
    console.error('Get Approved Reviews Error:', error);
    throw error;
  }
}

/**
 * Get review statistics (public)
 * @returns {Promise<Object>} Review stats (average, total, distribution)
 */
export async function getReviewStats() {
  try {
    const response = await fetch(`${API_URL}/reviews/stats`, {
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error al obtener estadísticas');
    }

    return data;
  } catch (error) {
    console.error('Get Review Stats Error:', error);
    throw error;
  }
}

// ========================================
// DASHBOARD API FUNCTIONS
// ========================================

/**
 * Get dashboard statistics
 * @returns {Promise<Object>} Dashboard stats
 */
export async function getDashboardStats() {
  try {
    const response = await fetch(`${API_URL}/api/auth/admin/dashboard-stats`, {
      credentials: 'include',
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error al obtener estadísticas');
    }

    return data;
  } catch (error) {
    console.error('Get Dashboard Stats Error:', error);
    throw error;
  }
}
