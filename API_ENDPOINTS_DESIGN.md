# 🌐 Bocatto Restaurant - API Endpoints Design
## Complete URI/Endpoint Specification (45 endpoints)

---

## 📦 PRODUCTS (CRUD + Business Logic) - 8 endpoints

### 1. Get All Products
**Method:** `GET`  
**Purpose:** Retrieve all products from the menu  
**URI:** `/api/products`  
**Response:**
```json
{
  "success": true,
  "count": 25,
  "data": [
    {
      "_id": "691516412c0d15baf812f93a",
      "name": "Alitas BBQ Clásicas",
      "description": "8 delicious BBQ chicken wings with homemade BBQ sauce",
      "price": 8.5,
      "img": "../images/plates/entradas2.0/alitas_entrada.jpg",
      "available": true,
      "category": "Entradas y Snacks",
      "subcategory": "Alitas",
      "currentStock": 25,
      "ingredients": ["chicken", "BBQ sauce", "spices", "honey"],
      "nutritionalInfo": {
        "calories": 450,
        "protein": 35,
        "carbs": 12,
        "fat": 28
      },
      "allergens": ["gluten"],
      "spiceLevel": "mild",
      "preparationTime": 15,
      "tags": ["popular", "spicy", "protein"],
      "productId": 1,
      "createdAt": "2025-11-14T08:09:32.616Z",
      "updatedAt": "2025-11-14T08:09:32.616Z"
    }
  ]
}
```

### 2. Get Product by ID
**Method:** `GET`  
**Purpose:** Retrieve a single product by its ID  
**URI:** `/api/products/:id`  
**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "691516412c0d15baf812f93a",
    "name": "Alitas BBQ Clásicas",
    "description": "8 delicious BBQ chicken wings",
    "price": 8.5,
    "category": "Entradas y Snacks",
    "available": true
  }
}
```

### 3. Get Products by Category
**Method:** `GET`  
**Purpose:** Filter products by category  
**URI:** `/api/products/category/:category`  
**Response:**
```json
{
  "success": true,
  "category": "Entradas y Snacks",
  "count": 12,
  "data": [
    {
      "_id": "691516412c0d15baf812f93a",
      "name": "Alitas BBQ Clásicas",
      "price": 8.5,
      "subcategory": "Alitas"
    }
  ]
}
```

### 4. Get Products by Subcategory
**Method:** `GET`  
**Purpose:** Filter products by subcategory  
**URI:** `/api/products/subcategory/:subcategory`  
**Response:**
```json
{
  "success": true,
  "subcategory": "Alitas",
  "count": 5,
  "data": [
    {
      "_id": "691516412c0d15baf812f93a",
      "name": "Alitas BBQ Clásicas",
      "price": 8.5
    }
  ]
}
```

### 5. Create New Product
**Method:** `POST`  
**Purpose:** Add a new product to the menu  
**URI:** `/api/products`  
**Request:**
```json
{
  "name": "Nachos Supreme",
  "description": "Crispy nachos with cheese, guacamole, and jalapeños",
  "price": 9.99,
  "category": "Entradas y Snacks",
  "subcategory": "Nachos",
  "currentStock": 50,
  "ingredients": ["tortilla chips", "cheese", "jalapeños", "guacamole"],
  "spiceLevel": "medium",
  "preparationTime": 10,
  "available": true
}
```

### 6. Update Product
**Method:** `PUT`  
**Purpose:** Update product information  
**URI:** `/api/products/:id`  
**Request:**
```json
{
  "price": 10.99,
  "available": false,
  "currentStock": 0
}
```

### 7. Delete Product
**Method:** `DELETE`  
**Purpose:** Remove a product from the menu  
**URI:** `/api/products/:id`  
**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

### 8. Search Products
**Method:** `GET`  
**Purpose:** Search products by name or description  
**URI:** `/api/products/search?q=alitas`  
**Response:**
```json
{
  "success": true,
  "query": "alitas",
  "count": 3,
  "data": [
    {
      "_id": "691516412c0d15baf812f93a",
      "name": "Alitas BBQ Clásicas",
      "price": 8.5
    }
  ]
}
```

---

## 📂 CATEGORIES (CRUD) - 4 endpoints

### 9. Get All Categories
**Method:** `GET`  
**Purpose:** Retrieve all product categories  
**URI:** `/api/categories`  
**Response:**
```json
{
  "success": true,
  "count": 8,
  "data": [
    {
      "_id": "691516412c0d15baf812f950",
      "name": "Entradas y Snacks",
      "description": "Appetizers and snacks to start your meal",
      "image": "images/categories/entradas.jpg",
      "order": 1,
      "isActive": true,
      "productCount": 15
    },
    {
      "_id": "691516412c0d15baf812f951",
      "name": "Platos Fuertes",
      "description": "Main dishes",
      "order": 2,
      "isActive": true,
      "productCount": 25
    }
  ]
}
```

### 10. Create New Category
**Method:** `POST`  
**Purpose:** Add a new product category  
**URI:** `/api/categories`  
**Request:**
```json
{
  "name": "Bebidas",
  "description": "Refreshing drinks and beverages",
  "image": "images/categories/bebidas.jpg",
  "order": 5,
  "isActive": true
}
```

### 11. Update Category
**Method:** `PUT`  
**Purpose:** Update category information  
**URI:** `/api/categories/:id`  
**Request:**
```json
{
  "name": "Bebidas Especiales",
  "isActive": false
}
```

### 12. Delete Category
**Method:** `DELETE`  
**Purpose:** Remove a category  
**URI:** `/api/categories/:id`  
**Response:**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

---

## 🏠 AMBIENTS (CRUD) - 6 endpoints

### 13. Get All Ambients
**Method:** `GET`  
**Purpose:** Retrieve all available restaurant ambients/rooms  
**URI:** `/api/ambients`  
**Response:**
```json
{
  "success": true,
  "count": 4,
  "data": [
    {
      "_id": "6913d88fc4a933fcc4dac0dd",
      "nombre": "Salón Principal",
      "descripcion": "Elegant and spacious room perfect for large celebrations",
      "capacidadMin": 20,
      "capacidadMax": 50,
      "caracteristicas": ["air conditioning", "sound system", "dance floor", "bar"],
      "imagenUrl": "images/promociones/salon-principal.jpg",
      "badge": {
        "text": "Popular",
        "color": "blue"
      },
      "rating": {
        "average": 4.8,
        "count": 45
      },
      "activo": true,
      "orden": 1
    }
  ]
}
```

### 14. Get Ambient by ID
**Method:** `GET`  
**Purpose:** Retrieve details of a specific ambient  
**URI:** `/api/ambients/:id`  
**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "6913d88fc4a933fcc4dac0dd",
    "nombre": "Salón Principal",
    "capacidadMax": 50,
    "caracteristicas": ["air conditioning", "sound system"]
  }
}
```

### 15. Create New Ambient
**Method:** `POST`  
**Purpose:** Add a new ambient/room to the restaurant  
**URI:** `/api/ambients`  
**Request:**
```json
{
  "nombre": "Terraza VIP",
  "descripcion": "Outdoor terrace with city view",
  "capacidadMin": 10,
  "capacidadMax": 30,
  "caracteristicas": ["outdoor", "view", "heaters"],
  "imagenUrl": "images/terraza-vip.jpg",
  "activo": true
}
```

### 16. Update Ambient
**Method:** `PUT`  
**Purpose:** Update ambient information  
**URI:** `/api/ambients/:id`  
**Request:**
```json
{
  "capacidadMax": 60,
  "activo": false,
  "caracteristicas": ["air conditioning", "projector", "bar"]
}
```

### 17. Delete Ambient
**Method:** `DELETE`  
**Purpose:** Remove an ambient from the system  
**URI:** `/api/ambients/:id`  
**Response:**
```json
{
  "success": true,
  "message": "Ambient deleted successfully"
}
```

### 18. Get Available Ambients by Date
**Method:** `GET`  
**Purpose:** Check ambient availability for a specific date  
**URI:** `/api/ambients/availability?date=2025-12-25`  
**Response:**
```json
{
  "success": true,
  "date": "2025-12-25",
  "available": [
    {
      "_id": "6913d88fc4a933fcc4dac0dd",
      "nombre": "Salón Principal",
      "capacidadMax": 50,
      "availableSlots": ["12:00", "14:00", "18:00", "20:00"]
    }
  ]
}
```

---

## 📋 MENUS (CRUD) - 5 endpoints

### 19. Get All Menus
**Method:** `GET`  
**Purpose:** Retrieve all menu configurations  
**URI:** `/api/menus`  
**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "691516412c0d15baf812f93b",
      "name": "Weekend Special Menu",
      "description": "Special menu available on weekends",
      "active": true,
      "products": ["691516412c0d15baf812f93a", "691516412c0d15baf812f93c"],
      "validFrom": "2025-11-01",
      "validUntil": "2025-12-31"
    }
  ]
}
```

### 20. Get Menu by ID
**Method:** `GET`  
**Purpose:** Retrieve a specific menu configuration  
**URI:** `/api/menus/:id`  
**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "691516412c0d15baf812f93b",
    "name": "Weekend Special Menu",
    "active": true,
    "products": []
  }
}
```

### 21. Create New Menu
**Method:** `POST`  
**Purpose:** Create a new menu configuration  
**URI:** `/api/menus`  
**Request:**
```json
{
  "name": "Holiday Menu 2025",
  "description": "Special menu for Christmas and New Year",
  "active": true,
  "products": ["691516412c0d15baf812f93a"],
  "validFrom": "2025-12-20",
  "validUntil": "2026-01-05"
}
```

### 22. Update Menu
**Method:** `PUT`  
**Purpose:** Update menu configuration  
**URI:** `/api/menus/:id`  
**Request:**
```json
{
  "active": false,
  "validUntil": "2025-11-30"
}
```

### 23. Delete Menu
**Method:** `DELETE`  
**Purpose:** Remove a menu configuration  
**URI:** `/api/menus/:id`  
**Response:**
```json
{
  "success": true,
  "message": "Menu deleted successfully"
}
```

---

## 📅 RESERVATIONS (CRUD + Business Logic) - 8 endpoints

### 24. Get All Reservations
**Method:** `GET`  
**Purpose:** Retrieve all reservations  
**URI:** `/api/reservations`  
**Response:**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "_id": "6915164abc0d15baf812f940",
      "customerName": "Juan Pérez",
      "email": "juan@example.com",
      "phone": "0999999999",
      "date": "2025-12-25",
      "time": "19:00",
      "guests": 6,
      "ambientId": "6913d88fc4a933fcc4dac0dd",
      "status": "confirmed",
      "notes": "Birthday celebration",
      "createdAt": "2025-11-20T10:30:00.000Z"
    }
  ]
}
```

### 25. Get Reservation by ID
**Method:** `GET`  
**Purpose:** Retrieve details of a specific reservation  
**URI:** `/api/reservations/:id`  
**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "6915164abc0d15baf812f940",
    "customerName": "Juan Pérez",
    "date": "2025-12-25",
    "guests": 6,
    "status": "confirmed"
  }
}
```

### 26. Create New Reservation
**Method:** `POST`  
**Purpose:** Create a new table/ambient reservation  
**URI:** `/api/reservations`  
**Request:**
```json
{
  "customerName": "María García",
  "email": "maria@example.com",
  "phone": "0987654321",
  "date": "2025-12-30",
  "time": "20:00",
  "guests": 4,
  "ambientId": "6913d88fc4a933fcc4dac0dd",
  "notes": "Vegetarian preferences"
}
```

### 27. Update Reservation
**Method:** `PUT`  
**Purpose:** Update reservation details  
**URI:** `/api/reservations/:id`  
**Request:**
```json
{
  "guests": 8,
  "time": "18:30",
  "status": "confirmed"
}
```

### 28. Cancel Reservation
**Method:** `DELETE`  
**Purpose:** Cancel/delete a reservation  
**URI:** `/api/reservations/:id`  
**Response:**
```json
{
  "success": true,
  "message": "Reservation cancelled successfully"
}
```

### 29. Confirm Reservation
**Method:** `PATCH`  
**Purpose:** Change reservation status to confirmed  
**URI:** `/api/reservations/:id/confirm`
**Response:**
```json
{
  "success": true,
  "message": "Reservation confirmed",
  "data": {
    "_id": "6915164abc0d15baf812f940",
    "status": "confirmed"
  }
}
```

### 30. Check Availability
**Method:** `POST`  
**Purpose:** Check if a time slot is available for reservation  
**URI:** `/api/reservations/check-availability`
**Request:**
```json
{
  "date": "2025-12-25",
  "time": "19:00",
  "guests": 6,
  "ambientId": "6913d88fc4a933fcc4dac0dd"
}
```
**Response:**
```json
{
  "success": true,
  "available": true,
  "message": "Time slot is available",
  "alternativeTimes": ["18:00", "20:00", "21:00"]
}
```

### 31. Get Upcoming Reservations
**Method:** `GET`  
**Purpose:** Get all future reservations  
**URI:** `/api/reservations/upcoming`
**Response:**
```json
{
  "success": true,
  "count": 12,
  "data": [
    {
      "_id": "6915164abc0d15baf812f940",
      "customerName": "Juan Pérez",
      "date": "2025-12-25",
      "time": "19:00"
    }
  ]
}
```

---

## 👤 USERS (CRUD + Auth) - 7 endpoints

### 32. Register New User  
**Response:**
```json
{
  "success": true,
  "date": "2025-12-25",
  "count": 8,
  "data": [
    {
      "_id": "6915164abc0d15baf812f940",
      "customerName": "Juan Pérez",
      "time": "19:00",
      "guests": 6
    }
  ]
}
```


**Method:** `POST`  
**Purpose:** Create a new user account  
**URI:** `/api/users/register`  
**Request:**
```json
{
  "firstName": "Carlos",
  "lastName": "Rodríguez",
  "email": "carlos@example.com",
  "password": "SecurePass123!",
  "phone": "0991234567",
  "address": "Quito, Ecuador"
}
```
**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "6904d9703a86dfdd14a5c90",
    "email": "carlos@example.com",
    "role": "customer"
  }
}
```

### 33. User Login
**Method:** `POST`  
**Purpose:** Authenticate user and get access token  
**URI:** `/api/users/login`  
**Request:**
```json
{
  "email": "admin@adminbocatto.com",
  "password": "AdminPassword123!"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "6904d9703a86dfdd14a5c90",
      "email": "admin@adminbocatto.com",
      "role": "administrator",
      "firstName": "Admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 34. Get User Profile
**Method:** `GET`  
**Purpose:** Retrieve authenticated user's profile  
**URI:** `/api/users/profile`  
**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "6904d9703a86dfdd14a5c90",
    "firstName": "Admin",
    "lastName": "Bocatto",
    "email": "admin@adminbocatto.com",
    "phone": "0999999999",
    "address": "Quito, Ecuador",
    "role": "administrator",
    "loyaltyPoints": 0,
    "acceso": "FULL_ACCESS",
    "adminAcceso": "SUPER_ADMIN"
  }
}
```

### 35. Update User Profile
**Method:** `PUT`  
**Purpose:** Update user information  
**URI:** `/api/users/profile`  
**Request:**
```json
{
  "phone": "0998765432",
  "address": "Guayaquil, Ecuador"
}
```

### 36. Get All Users (Admin)
**Method:** `GET`  
**Purpose:** Retrieve all users (admin only)  
**URI:** `/api/users`  
**Response:**
```json
{
  "success": true,
  "count": 150,
  "data": [
    {
      "_id": "6904d9703a86dfdd14a5c90",
      "firstName": "Admin",
      "email": "admin@adminbocatto.com",
      "role": "administrator",
      "isActive": true
    }
  ]
}
```

### 37. Delete User
**Method:** `DELETE`  
**Purpose:** Delete a user account  
**URI:** `/api/users/:id`  
**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### 38. Reset Password
**Method:** `POST`  
**Purpose:** Send password reset email  
**URI:** `/api/users/reset-password`  
**Request:**
```json
{
  "email": "user@example.com"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

---

---

## 🛒 CART (Business Logic) - 5 endpoints

### 39. Add Product to Cart
**Method:** `POST`  
**Purpose:** Add a product to user's shopping cart  
**URI:** `/api/cart/add`  
**Request:**
```json
{
  "userId": "6904d9703a86dfdd14a5c90",
  "productId": "691516412c0d15baf812f93a",
  "quantity": 2,
  "notes": "Extra spicy please"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Product added to cart",
  "cart": {
    "items": [
      {
        "productId": "691516412c0d15baf812f93a",
        "name": "Alitas BBQ Clásicas",
        "quantity": 2,
        "price": 8.5,
        "subtotal": 17.0
      }
    ],
    "total": 17.0
  }
}
```

### 40. Get User Cart
**Method:** `GET`  
**Purpose:** Retrieve current user's shopping cart  
**URI:** `/api/cart/:userId`  
**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "6904d9703a86dfdd14a5c90",
    "items": [
      {
        "productId": "691516412c0d15baf812f93a",
        "name": "Alitas BBQ Clásicas",
        "quantity": 2,
        "price": 8.5,
        "subtotal": 17.0
      }
    ],
    "itemCount": 2,
    "total": 17.0
  }
}
```

### 41. Update Cart Item
**Method:** `PUT`  
**Purpose:** Update quantity of a cart item  
**URI:** `/api/cart/update`  
**Request:**
```json
{
  "userId": "6904d9703a86dfdd14a5c90",
  "productId": "691516412c0d15baf812f93a",
  "quantity": 5
}
```

### 42. Remove Item from Cart
**Method:** `DELETE`  
**Purpose:** Remove a product from cart  
**URI:** `/api/cart/remove`  
**Request:**
```json
{
  "userId": "6904d9703a86dfdd14a5c90",
  "productId": "691516412c0d15baf812f93a"
}
```

### 43. Clear Cart
**Method:** `DELETE`  
**Purpose:** Empty the entire shopping cart  
**URI:** `/api/cart/clear/:userId`  
**Response:**
```json
{
  "success": true,
  "message": "Cart cleared successfully"
}
```

---

## 📦 ORDERS (CRUD + Business Logic) - 5 endpoints

### 44. Create Order from Cart
**Method:** `POST`  
**Purpose:** Convert cart items into an order  
**URI:** `/api/orders/create`  
**Request:**
```json
{
  "userId": "6904d9703a86dfdd14a5c90",
  "deliveryAddress": "Av. 10 de Agosto, Quito",
  "paymentMethod": "credit_card",
  "notes": "Ring doorbell twice"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "orderId": "ORD-2025-001234",
    "total": 17.0,
    "status": "pending",
    "estimatedDelivery": "30-45 minutes"
  }
}
```

### 45. Get User Orders
**Method:** `GET`  
**Purpose:** Retrieve all orders made by a user  
**URI:** `/api/orders/user/:userId`  
**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "orderId": "ORD-2025-001234",
      "date": "2025-11-25T15:30:00.000Z",
      "total": 17.0,
      "status": "delivered",
      "items": [
        {
          "name": "Alitas BBQ Clásicas",
          "quantity": 2,
          "price": 8.5
        }
      ]
    }
  ]
}
```

### 46. Update Order Status
**Method:** `PATCH`  
**Purpose:** Update the status of an order (admin/kitchen)  
**URI:** `/api/orders/:orderId/status`  
**Request:**
```json
{
  "status": "in_preparation"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Order status updated",
  "data": {
    "orderId": "ORD-2025-001234",
    "status": "in_preparation",
    "updatedAt": "2025-11-25T16:00:00.000Z"
  }
}
```

### 47. Get Order by ID
**Method:** `GET`  
**Purpose:** Retrieve details of a specific order  
**URI:** `/api/orders/:orderId`  
**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "ORD-2025-001234",
    "customerId": "6904d9703a86dfdd14a5c90",
    "date": "2025-11-25T15:30:00.000Z",
    "total": 17.0,
    "status": "delivered",
    "items": []
  }
}
```

### 48. Cancel Order
**Method:** `DELETE`  
**Purpose:** Cancel an order (if status allows)  
**URI:** `/api/orders/:orderId`  
**Response:**
```json
{
  "success": true,
  "message": "Order cancelled successfully"
}
```

---

## 💬 COMMENTS / REVIEWS (Business Logic) - 3 endpoints

### 49. Create Product Review
**Method:** `POST`  
**Purpose:** Add a comment/review for a product  
**URI:** `/api/comments`  
**Request:**
```json
{
  "productId": "691516412c0d15baf812f93a",
  "clientId": "6904d9703a86dfdd14a5c90",
  "text": "Excellent wings! Very crispy and flavorful",
  "rating": 5,
  "commentType": "product"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Review submitted successfully",
  "data": {
    "_id": "691516412c0d15baf812f960",
    "productId": "691516412c0d15baf812f93a",
    "text": "Excellent wings! Very crispy and flavorful",
    "rating": 5,
    "isApproved": false,
    "commentDate": "2025-11-25T16:00:00.000Z"
  }
}
```

### 50. Get Product Reviews
**Method:** `GET`  
**Purpose:** Retrieve all approved reviews for a product  
**URI:** `/api/comments/product/:productId`  
**Response:**
```json
{
  "success": true,
  "productId": "691516412c0d15baf812f93a",
  "count": 15,
  "averageRating": 4.7,
  "data": [
    {
      "_id": "691516412c0d15baf812f960",
      "clientId": "6904d9703a86dfdd14a5c90",
      "text": "Excellent wings!",
      "rating": 5,
      "commentDate": "2025-11-25T16:00:00.000Z"
    }
  ]
}
```

### 51. Approve/Reject Review (Admin)
**Method:** `PATCH`  
**Purpose:** Moderate user reviews  
**URI:** `/api/comments/:id/approve`  
**Request:**
```json
{
  "isApproved": true
}
```

---

## 🎁 OFFERS / DISCOUNTS (CRUD + Business Logic) - 4 endpoints

### 52. Get All Offers
**Method:** `GET`  
**Purpose:** Retrieve all offers/discounts  
**URI:** `/api/offers`  
**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "691516412c0d15baf812f970",
      "name": "Black Friday Special",
      "description": "30% discount on all orders",
      "discount": 30,
      "discountType": "percentage",
      "isActive": true,
      "startDate": "2025-11-29",
      "endDate": "2025-12-01",
      "weekDays": ["friday", "saturday", "sunday"],
      "productId": null
    }
  ]
}
```

### 53. Get Active Offers
**Method:** `GET`  
**Purpose:** Retrieve only currently active offers  
**URI:** `/api/offers/active`  
**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "691516412c0d15baf812f970",
      "name": "Black Friday Special",
      "discount": 30,
      "discountType": "percentage"
    }
  ]
}
```

### 54. Create New Offer
**Method:** `POST`  
**Purpose:** Add a new offer/discount  
**URI:** `/api/offers`  
**Request:**
```json
{
  "name": "Happy Hour",
  "description": "Buy 2 get 1 free",
  "discount": 33,
  "discountType": "percentage",
  "startDate": "2025-12-01",
  "endDate": "2025-12-31",
  "weekDays": ["monday", "tuesday", "wednesday"],
  "isActive": true
}
```

### 55. Update Offer
**Method:** `PUT`  
**Purpose:** Update offer details  
**URI:** `/api/offers/:id`  
**Request:**
```json
{
  "isActive": false,
  "endDate": "2025-11-30"
}
```

---

## 🔔 NOTIFICATIONS (Business Logic) - 3 endpoints

### 56. Get User Notifications
**Method:** `GET`  
**Purpose:** Retrieve all notifications for a user  
**URI:** `/api/notifications/user/:userId`  
**Response:**
```json
{
  "success": true,
  "count": 5,
  "unreadCount": 2,
  "data": [
    {
      "_id": "691516412c0d15baf812f980",
      "title": "Order Confirmed",
      "message": "Your order #ORD-2025-001234 has been confirmed",
      "time": "2025-11-25T15:30:00.000Z",
      "isRead": false
    }
  ]
}
```

### 57. Mark Notification as Read
**Method:** `PATCH`  
**Purpose:** Mark a notification as read  
**URI:** `/api/notifications/:id/read`  
**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

### 58. Get Unread Notifications
**Method:** `GET`  
**Purpose:** Retrieve only unread notifications  
**URI:** `/api/notifications/user/:userId/unread`  
**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "691516412c0d15baf812f980",
      "title": "Order Confirmed",
      "message": "Your order #ORD-2025-001234 has been confirmed"
    }
  ]
}
```

---

## 📊 REPORTS (Business Logic) - 2 endpoints

### 59. Generate Sales Report
**Method:** `POST`  
**Purpose:** Generate sales report for a date range  
**URI:** `/api/reports/sales`  
**Request:**
```json
{
  "startDate": "2025-11-01",
  "endDate": "2025-11-30",
  "type": "monthly"
}
```
**Response:**
```json
{
  "success": true,
  "reportId": "RPT-2025-001",
  "data": {
    "period": "November 2025",
    "totalSales": 15234.50,
    "totalOrders": 345,
    "averageOrderValue": 44.15,
    "topProducts": [
      {
        "productId": "691516412c0d15baf812f93a",
        "name": "Alitas BBQ Clásicas",
        "unitsSold": 150,
        "revenue": 1275.00
      }
    ],
    "generatedAt": "2025-11-25T16:00:00.000Z",
    "generatedBy": "admin@adminbocatto.com"
  }
}
```

### 60. Get Report by ID
**Method:** `GET`  
**Purpose:** Retrieve a previously generated report  
**URI:** `/api/reports/:reportId`  
**Response:**
```json
{
  "success": true,
  "data": {
    "reportId": "RPT-2025-001",
    "type": "sales",
    "content": {},
    "generatedAt": "2025-11-25T16:00:00.000Z"
  }
}
```

---

## 📝 SUMMARY

### Total Endpoints: 60

| Resource | CRUD | Business Logic | Total |
|----------|------|----------------|-------|
| **1. Products** | 7 | 1 (search) | 8 |
| **2. Categories** | 4 | 0 | 4 |
| **3. Ambients** | 5 | 1 (availability) | 6 |
| **4. Menus** | 5 | 0 | 5 |
| **5. Reservations** | 5 | 3 (confirm, check, upcoming) | 8 |
| **6. Users** | 4 | 3 (register, login, reset) | 7 |
| **7. Cart** | 0 | 5 (add, get, update, remove, clear) | 5 |
| **8. Orders** | 3 | 2 (create, status) | 5 |
| **9. Comments/Reviews** | 1 | 2 (create, by product, approve) | 3 |
| **10. Offers/Discounts** | 2 | 2 (active, update) | 4 |
| **11. Notifications** | 0 | 3 (get, read, unread) | 3 |
| **12. Reports** | 1 | 1 (generate sales) | 2 |
| **TOTAL** | **37** | **23** | **60** |

### Total Tables Covered: 12

**Implemented in MongoDB (5):**
1. Products
2. Ambients
3. Menus
4. Reservations (reservacions)
5. Users

**To be Implemented (7):**
6. Categories
7. Cart
8. Orders
9. Comments/Reviews
10. Offers
11. Notifications
12. Reports

### HTTP Methods Distribution:
- **GET**: 26 endpoints
- **POST**: 13 endpoints
- **PUT**: 7 endpoints
- **DELETE**: 6 endpoints
- **PATCH**: 8 endpoints

### Status Codes to Use:
- `200 OK` - Successful GET, PUT, PATCH
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Invalid data
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - No permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## 🔐 Authentication Notes:
- Endpoints marked with 🔒 require authentication token
- Admin-only endpoints require `role: "administrator"`
- Use JWT tokens in Authorization header: `Bearer <token>`

---

## 📌 **IMPLEMENTATION NOTES**

### Database Schema Requirements:

**New Collections to Create:**
1. `categories` - Product categories
2. `carts` - Shopping carts
3. `orders` - Customer orders  
4. `orderDetails` - Order line items
5. `comments` - Product reviews
6. `offers` - Discounts and promotions
7. `notifications` - User notifications
8. `reports` - Generated reports

### Recommended Implementation Order:
1. ✅ **Phase 1**: Products, Categories (Foundation)
2. ✅ **Phase 2**: Users, Auth (Security)
3. 🔄 **Phase 3**: Cart, Orders (E-commerce)
4. 🔄 **Phase 4**: Reservations, Ambients (Booking)
5. 🔄 **Phase 5**: Comments, Offers (Engagement)
6. 🔄 **Phase 6**: Notifications, Reports (Analytics)

### Business Rules to Consider:
- **Cart**: Expires after 24 hours of inactivity
- **Orders**: Cannot be cancelled after "in_preparation" status
- **Reservations**: Require 24h advance booking
- **Comments**: Must be approved by admin before displaying
- **Offers**: Auto-deactivate after end date
- **Notifications**: Auto-mark as read after 7 days

---

**Generated for:** Bocatto Restaurant Project  
**Date:** November 25, 2025  
**Version:** 2.0 (Extended with 12 tables, 60 endpoints)
