# Rate Limiting Implementation

## Overview

This e-commerce platform now includes enterprise-grade rate limiting to protect sensitive endpoints from abuse and ensure system stability.

## Protected Routes

### 🔐 Authentication Routes
- **Endpoints**: `/api/auth/*`, login, signup
- **Limit**: 5 attempts per 15 minutes
- **Lockout**: 30 minutes after exceeding limit
- **Purpose**: Prevent brute force attacks and account enumeration

### 🔑 Password Reset
- **Endpoint**: `/api/auth/password-reset`
- **Limit**: 3 attempts per hour
- **Lockout**: 1 hour after exceeding limit
- **Purpose**: Ultra-strict protection against password reset abuse

### 💳 Payment/Checkout
- **Endpoints**: `/api/checkout`, `/api/payment*`, `/api/stripe*`, `/api/orders`
- **Limit**: 10 attempts per 10 minutes
- **Lockout**: 20 minutes after exceeding limit
- **Purpose**: Protect payment processing from abuse

### 📧 Contact Forms
- **Endpoints**: `/api/newsletter`, `/api/custom-quote`, contact forms
- **Limit**: 5 attempts per hour
- **Lockout**: 1 hour after exceeding limit
- **Purpose**: Prevent spam and form abuse

### 🛡️ Admin Routes
- **Endpoints**: `/api/admin/*`
- **Limit**: 20 operations per 15 minutes
- **Lockout**: 30 minutes after exceeding limit
- **Purpose**: Protect administrative functions

### 🌐 General API
- **Endpoints**: All other `/api/*` routes
- **Limit**: 100 requests per minute
- **Lockout**: 5 minutes after exceeding limit
- **Purpose**: General DDoS protection

## Features

### Smart Rate Limiting
- **IP-based tracking** with User-Agent fingerprinting for accuracy
- **Progressive blocking** with temporary lockouts
- **Success-based reduction** - legitimate successful requests reduce counters
- **Configurable limits** per route type

### HTTP Headers
All rate-limited responses include standard headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in window
- `X-RateLimit-Reset`: When the window resets (ISO timestamp)
- `Retry-After`: Seconds to wait before retrying (when blocked)

### Response Format
When rate limited, endpoints return:
```json
{
  "error": "Rate limit exceeded - temporarily blocked",
  "retryAfter": 1800,
  "limit": 5,
  "remaining": 0,
  "resetTime": "2025-09-13T20:00:00.000Z"
}
```

## Technical Implementation

### Storage
- **Development**: In-memory storage with automatic cleanup
- **Production**: Recommend Redis for distributed rate limiting

### Key Generation
Rate limits are applied using composite keys:
```
{route_type}:{client_ip}:{user_agent_hash}
```

### Middleware Integration
Each protected route includes:
```typescript
import { rateLimitMiddleware, recordSuccess, RATE_LIMITS } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = rateLimitMiddleware.auth(request)
  if (rateLimitResult) {
    return rateLimitResult
  }

  // ... route logic ...

  // Record successful request (optional - reduces counter)
  recordSuccess(request, RATE_LIMITS.AUTH, 'auth')

  return response
}
```

## Security Benefits

1. **Brute Force Protection**: Limits authentication attempts
2. **DDoS Mitigation**: Prevents overwhelming the server
3. **Spam Prevention**: Limits form submissions
4. **Payment Security**: Protects checkout processes
5. **Resource Conservation**: Prevents API abuse

## Production Notes

### Recommended Upgrades
- **Replace memory storage with Redis** for horizontal scaling
- **Add geolocation filtering** for suspicious regions
- **Implement CAPTCHA** for blocked users
- **Add monitoring/alerting** for rate limit violations

### Monitoring
- Rate limit violations are logged to console
- HTTP 429 responses indicate rate limiting is active
- Headers provide client-side rate limit awareness

## Configuration

Rate limits are configured in `/src/lib/rate-limit.ts` in the `RATE_LIMITS` object. Adjust values based on your traffic patterns and security requirements.

---

✅ **Status**: Fully implemented and tested
🔒 **Security Level**: Enterprise-grade
📊 **Coverage**: All sensitive e-commerce endpoints protected