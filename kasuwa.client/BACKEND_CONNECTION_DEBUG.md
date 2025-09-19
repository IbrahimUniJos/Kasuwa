# ?? **Backend Connection Troubleshooting Guide**

## ?? **Current Issue Analysis**

Based on the error logs, we're getting HTTP 404 errors for:
1. `POST /api/products/42/images` - Image upload endpoint
2. `PUT /api/products/42` - Product update endpoint

This suggests either:
- **Product ID 42 doesn't exist** in the database
- **Authentication issues** preventing access
- **Server routing problems** 
- **CORS or middleware issues**

## ?? **Diagnostic Steps**

### **Step 1: Check Server Status**
```bash
# Verify the server is running
curl -I https://localhost:7155/api/products/categories
```

### **Step 2: Check Authentication**
Open browser console and look for:
```
?? DEBUG: Auth token exists: true/false
?? DEBUG: API Configuration: {...}
```

### **Step 3: Verify Product Exists**
Check if product ID 42 exists:
```bash
curl https://localhost:7155/api/products/42
```

### **Step 4: Test Categories Endpoint (No Auth Required)**
```bash
curl https://localhost:7155/api/products/categories
```

## ??? **Potential Solutions**

### **Solution 1: Use a Valid Product ID**
1. Go to the admin products page
2. Note the actual product IDs in the table
3. Use an existing product ID instead of 42

### **Solution 2: Check Environment Variables**
Verify in your `.env` file:
```
VITE_API_BASE_URL=https://localhost:7155/api
```

### **Solution 3: Authentication Check**
1. Ensure you're logged in as an admin or vendor
2. Check browser storage for `kasuwa_auth_token`
3. Try logging out and back in

### **Solution 4: Create Test Product**
If no products exist, create one first through the API:
```json
POST /api/products
{
  "name": "Test Product",
  "description": "Test Description",
  "price": 100,
  "categoryId": 1,
  "stockQuantity": 10
}
```

## ?? **Quick Fixes**

### **Frontend Debug Mode**
The frontend now includes comprehensive debug logging. Check the browser console for:
- API configuration details
- Authentication status
- Product verification results
- Detailed error information

### **Backend Service Check**
Ensure the ProductService is properly registered in `Program.cs`:
```csharp
builder.Services.AddScoped<IProductService, ProductService>();
```

### **Database Verification**
Check if the Products table has data:
```sql
SELECT TOP 10 * FROM Products;
SELECT TOP 10 * FROM ProductCategories;
```

## ?? **Common HTTP 404 Causes**

| Cause | Solution |
|-------|----------|
| **Product doesn't exist** | Use valid product ID or create product |
| **Wrong route** | Verify controller routing and action names |
| **Missing authorization** | Ensure proper authentication token |
| **Service not registered** | Check DI container registration |
| **Database empty** | Seed database with test data |
| **Wrong base URL** | Verify VITE_API_BASE_URL environment variable |

## ?? **Immediate Action Plan**

1. **Check Browser Console**: Look for the debug logs we added
2. **Verify Authentication**: Ensure auth token exists and is valid
3. **Test with Existing Product**: Use a product ID that actually exists
4. **Check Network Tab**: Look at the actual HTTP requests being made
5. **Verify Server**: Ensure the .NET server is running on the expected port

## ?? **Development Tips**

### **Mock Data Fallback**
The system will automatically use mock data when endpoints aren't available, so you can:
- Test the UI functionality
- Verify user interactions
- Debug frontend logic

### **Debug Logging**
All API calls now include detailed logging:
```javascript
?? DEBUG: Starting upload for product 42
?? DEBUG: API Base URL: https://localhost:7155/api
?? DEBUG: Auth token exists: true
?? DEBUG: Product found: {id: 42, name: "Test Product"}
```

### **Error Context**
Errors now include specific context:
- Product verification results
- Authentication status
- API configuration details
- Suggested fixes

The enhanced debug logging should help identify the exact cause of the 404 errors! ??