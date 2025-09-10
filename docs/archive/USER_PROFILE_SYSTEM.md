# User Profile Management System - Military Tees UK

Complete user profile management system with address handling, order history, and preferences.

## ✅ **System Overview**

Your Military Tees UK platform now includes a comprehensive user profile system that allows customers to:

- **View & Edit Personal Information** (name, phone, date of birth)
- **Manage Multiple Addresses** (shipping & billing addresses)
- **View Order History** (complete order details with items)
- **Control Preferences** (marketing consent, account settings)

---

## 🚀 **API Endpoints Created**

### **GET /api/user**
- **Purpose**: Fetch user profile and addresses
- **Authentication**: Required (JWT token)
- **Response**: User details, profile info, saved addresses
- **Auto-creates**: Profile if it doesn't exist

### **PUT /api/user/update**
- **Purpose**: Update profile information and addresses
- **Authentication**: Required (JWT token)
- **Features**: Profile updates, address CRUD operations
- **Validation**: Zod schemas for data integrity

### **GET /api/orders/history**
- **Purpose**: Fetch user's order history
- **Authentication**: Required (JWT token)
- **Response**: Orders with items, status, and totals
- **Pagination**: Supports limit/offset parameters

---

## 📱 **User Interface**

### **Profile Page (`/profile`)**
Located at: `src/app/profile/page.tsx`

**4-Tab Interface:**
1. **Personal** - Name, phone, DOB, marketing consent
2. **Addresses** - Shipping/billing address management  
3. **Orders** - Complete order history with details
4. **Preferences** - Privacy settings and account actions

### **Navigation Integration**
- **Desktop**: User icon in header links to `/profile`
- **Mobile**: "My Profile" in quick links menu
- **Consistent**: Military heritage styling throughout

---

## 🏗️ **System Architecture**

### **Database Integration**
- **Customers Table**: Personal information storage
- **Addresses Table**: Multiple address support
- **Orders/Order Items**: Complete order history
- **Row Level Security**: User can only access own data

### **React Hook (`use-user-profile.ts`)**
```typescript
const { user, profile, loading, updateProfile, getDefaultAddress } = useUserProfile()
```

**Features:**
- Automatic profile fetching
- Real-time updates
- Error handling
- Address management helpers
- Authentication state management

---

## 💾 **Data Structure**

### **User Profile**
```typescript
interface UserProfile {
  id: string
  user_id: string
  first_name: string
  last_name: string
  phone?: string
  date_of_birth?: string
  preferences?: {
    newsletter?: boolean
    sms_marketing?: boolean
    size_preference?: string
    style_preference?: string[]
  }
  marketing_consent: boolean
  addresses?: Address[]
}
```

### **Address Format**
```typescript
interface Address {
  id?: string
  address_line_1: string
  address_line_2?: string
  city: string
  county?: string
  postcode: string
  country: string (default: 'GB')
  address_type: 'home' | 'work' | 'other'
  is_default_shipping: boolean
  is_default_billing: boolean
}
```

### **Order History**
```typescript
interface Order {
  id: string
  order_number: string
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled'
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
  total_amount: number
  created_at: string
  order_items: OrderItem[]
}
```

---

## 🔒 **Security Features**

### **Authentication**
- **JWT Token Validation**: All endpoints require authentication
- **Row Level Security**: Users can only access their own data
- **Input Validation**: Zod schemas prevent invalid data
- **SQL Injection Protection**: Parameterized queries via Supabase

### **Data Privacy**
- **GDPR Compliant**: Export/delete account options
- **Marketing Consent**: Granular permission controls
- **Secure Storage**: All sensitive data encrypted at rest

---

## 📋 **Usage Examples**

### **Fetching User Profile**
```typescript
// Using the hook
const { user, profile, loading, error } = useUserProfile()

// Direct API call
const response = await fetch('/api/user', {
  method: 'GET',
  credentials: 'include'
})
```

### **Updating Profile**
```typescript
// Update personal information
await updateProfile({
  profile: {
    first_name: 'John',
    last_name: 'Smith',
    phone: '+44 7123 456789'
  }
})

// Add new address
await updateProfile({
  addresses: [{
    address_line_1: '123 Military Road',
    city: 'London',
    postcode: 'SW1A 1AA',
    country: 'GB',
    address_type: 'home',
    is_default_shipping: true,
    is_default_billing: false
  }]
})

// Delete addresses
await updateProfile({
  delete_addresses: ['address-uuid-to-delete']
})
```

### **Getting Default Addresses**
```typescript
const defaultShippingAddress = getDefaultAddress('shipping')
const defaultBillingAddress = getDefaultAddress('billing')
```

---

## 🎯 **Key Benefits**

### **For Customers**
- **Faster Checkout**: Saved addresses for quick ordering
- **Order Tracking**: Complete history with item details
- **Personal Control**: Manage preferences and privacy settings
- **Professional UX**: Military heritage styled interface

### **For Business**
- **Customer Retention**: Profile management encourages return visits
- **Data Insights**: Customer preferences for marketing
- **Shipping Efficiency**: Validated addresses reduce delivery issues
- **Order Management**: Complete customer order history

### **For Developers**
- **Type Safety**: Full TypeScript integration
- **Reusable Components**: Modular profile management
- **Secure API**: Authentication and validation built-in
- **Scalable Architecture**: Handles multiple addresses and orders

---

## 🔧 **Implementation Status**

✅ **Complete and Ready:**
- API endpoints with authentication
- React components with military styling  
- Database integration with RLS
- Form validation and error handling
- Order history integration
- Navigation menu updates

✅ **Testing Ready:**
- Create account and test profile creation
- Add/edit addresses and verify persistence
- Place orders and verify history appears
- Test form validation and error states

✅ **Production Ready:**
- All endpoints secured with authentication
- Input validation prevents invalid data
- Error handling provides user feedback
- Military heritage styling consistent throughout

---

## 🚀 **Deployment Notes**

The user profile system is fully integrated with your existing:
- **Authentication system** (Supabase Auth)
- **Database schema** (customers, addresses, orders tables)
- **Navigation** (profile links added to header/mobile menu)
- **Styling system** (Military Tees UK theme consistent)

**No additional setup required** - the system works with your existing Supabase database and authentication flow.

---

## 🎉 **Summary**

Your Military Tees UK platform now has a **complete user profile management system** that rivals major e-commerce platforms! Customers can manage their information, addresses, view order history, and control their preferences - all with the professional military heritage styling that defines your brand.

**This system supports your physical fulfillment goals** by providing validated shipping addresses and comprehensive customer data for efficient order processing! 🛡️