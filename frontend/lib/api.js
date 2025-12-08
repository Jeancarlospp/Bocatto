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
 * Delete a product
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
 * @param {Object} offerData - Offer information
 * @returns {Promise<Object>} Created offer data
 */
export async function createOffer(offerData) {
  try {
    const response = await fetch(`${API_URL}/offers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(offerData)
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
