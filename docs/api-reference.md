# API Reference

## Base URL

- **Local Development:** `http://localhost:5119`
- **Remote:** `http://<host>:5119`

## Endpoints

### Cart Controller (`/api/Cart`)

Non-tenant scoped cart operations.

#### GET /api/Cart/{cartId}

Get cart by ID.

**Parameters:**
- `cartId` (path, guid) - The cart identifier

**Response:** `200 OK`
```json
{
  "tenantId": "uuid",
  "cartId": "uuid",
  "userId": "uuid",
  "discountId": "uuid|null",
  "items": [
    {
      "cartItemId": "uuid",
      "productId": "uuid",
      "variantId": "uuid|null",
      "productName": "string",
      "quantity": 2,
      "price": 29.99,
      "added": "2024-01-15T10:30:00Z"
    }
  ],
  "createdAt": "2024-01-15T10:00:00Z"
}
```

**Response:** `404 Not Found` - Cart does not exist

---

#### POST /api/Cart

Create a new cart.

**Request Body:**
```json
{
  "tenantId": "uuid",
  "userId": "uuid"
}
```

**Response:** `201 Created`
```json
{
  "cartId": "uuid"
}
```

---

#### PUT /api/Cart/{cartId}/discount

Update cart discount.

**Parameters:**
- `cartId` (path, guid) - The cart identifier

**Request Body:**
```json
{
  "discountId": "uuid|null"
}
```

**Response:** `204 No Content` - Discount updated
**Response:** `404 Not Found` - Cart does not exist

---

#### DELETE /api/Cart/{cartId}

Delete cart and all its items.

**Parameters:**
- `cartId` (path, guid) - The cart identifier

**Response:** `204 No Content` - Cart deleted
**Response:** `404 Not Found` - Cart does not exist

---

#### POST /api/Cart/{cartId}/items

Add item to cart.

**Parameters:**
- `cartId` (path, guid) - The cart identifier

**Request Body:**
```json
{
  "tenantId": "uuid",
  "productId": "uuid",
  "variantId": "uuid|null",
  "quantity": 2
}
```

**Response:** `201 Created`
```json
{
  "cartItemId": "uuid"
}
```

---

#### DELETE /api/Cart/items/{cartItemId}

Remove item from cart.

**Parameters:**
- `cartItemId` (path, guid) - The cart item identifier

**Response:** `204 No Content` - Item removed
**Response:** `404 Not Found` - Cart item does not exist

---

#### PUT /api/Cart/items/{cartItemId}/quantity

Update item quantity.

**Parameters:**
- `cartItemId` (path, guid) - The cart item identifier

**Request Body:**
```json
{
  "quantity": 5
}
```

**Response:** `204 No Content` - Quantity updated
**Response:** `404 Not Found` - Cart item does not exist

---

### Tenant Cart Controller (`/api/tenant/{tenantId}/cart`)

Tenant-scoped cart operations. Routes to the correct shard based on tenant ID.

#### GET /api/tenant/{tenantId}/cart/{cartId}

Get tenant's cart by ID.

**Parameters:**
- `tenantId` (path, guid) - The tenant identifier
- `cartId` (path, guid) - The cart identifier

**Response:** `200 OK` - Cart object (same as GET /api/Cart/{cartId})
**Response:** `404 Not Found` - Cart does not exist

---

#### POST /api/tenant/{tenantId}/cart

Create a new cart for tenant.

**Parameters:**
- `tenantId` (path, guid) - The tenant identifier

**Request Body:**
```json
{
  "userId": "uuid"
}
```

**Response:** `201 Created`
```json
{
  "cartId": "uuid"
}
```

---

#### PUT /api/tenant/{tenantId}/cart/{cartId}/discount

Update cart discount for tenant.

**Parameters:**
- `tenantId` (path, guid) - The tenant identifier
- `cartId` (path, guid) - The cart identifier

**Request Body:**
```json
{
  "discountId": "uuid|null"
}
```

**Response:** `204 No Content`
**Response:** `404 Not Found`

---

#### DELETE /api/tenant/{tenantId}/cart/{cartId}

Delete tenant's cart.

**Parameters:**
- `tenantId` (path, guid) - The tenant identifier
- `cartId` (path, guid) - The cart identifier

**Response:** `204 No Content`
**Response:** `404 Not Found`

---

#### POST /api/tenant/{tenantId}/cart/{cartId}/items

Add item to tenant's cart.

**Parameters:**
- `tenantId` (path, guid) - The tenant identifier
- `cartId` (path, guid) - The cart identifier

**Request Body:**
```json
{
  "productId": "uuid",
  "variantId": "uuid|null",
  "quantity": 2
}
```

**Response:** `201 Created`
```json
{
  "cartItemId": "uuid"
}
```

---

#### DELETE /api/tenant/{tenantId}/cart/items/{cartItemId}

Remove item from tenant's cart.

**Parameters:**
- `tenantId` (path, guid) - The tenant identifier
- `cartItemId` (path, guid) - The cart item identifier

**Response:** `204 No Content`
**Response:** `404 Not Found`

---

#### PUT /api/tenant/{tenantId}/cart/items/{cartItemId}/quantity

Update item quantity in tenant's cart.

**Parameters:**
- `tenantId` (path, guid) - The tenant identifier
- `cartItemId` (path, guid) - The cart item identifier

**Request Body:**
```json
{
  "quantity": 5
}
```

**Response:** `204 No Content`
**Response:** `404 Not Found`

---

### Products Controller (`/api/products`)

#### GET /api/products/{productId}

Get product by ID.

**Parameters:**
- `productId` (path, guid) - The product identifier

**Response:** `200 OK`
```json
{
  "productId": "uuid",
  "tenantId": "uuid",
  "name": "Product Name",
  "price": 29.99,
  "category": "Electronics",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Response:** `404 Not Found` - Product does not exist

---

## Monitoring Endpoints

### GET /metrics

Prometheus metrics endpoint. Returns metrics in Prometheus text format.

**Metrics Exposed:**
- `cart_repository_requests_total{operation}` - Total requests by operation
- `cart_repository_operation_duration_seconds{operation,quantile}` - Operation latency
- `cart_repository_errors_total{operation,error_type}` - Error counts
- `cart_repository_active_operations{operation}` - Current concurrent operations
- `cart_repository_rows_affected{operation}` - Rows affected histogram

### GET /swagger

Swagger UI for API documentation and testing.

---

## Error Responses

All endpoints may return the following error responses:

**400 Bad Request** - Invalid request parameters
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "Bad Request",
  "status": 400,
  "detail": "..."
}
```

**404 Not Found** - Resource not found
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Not Found",
  "status": 404
}
```

**500 Internal Server Error** - Server error
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.6.1",
  "title": "Internal Server Error",
  "status": 500
}
```
