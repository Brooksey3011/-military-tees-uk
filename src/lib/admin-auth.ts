// This file is now DEPRECATED - use secure-admin-auth.ts instead
// Keeping for reference during migration period only

// Re-export the secure implementation
export { SecureAdminAuth as AdminAuthService } from './secure-admin-auth'

// MIGRATION NOTES:
// 1. All admin authentication now uses server-side JWT with HttpOnly cookies
// 2. 2FA implementation uses proper TOTP with otplib library
// 3. Session management is database-backed for revocation capability
// 4. No more localStorage - security vulnerability eliminated
// 5. Proper constant-time comparison for all crypto operations

// OLD VULNERABLE METHODS (DO NOT USE):
// - localStorage session storage
// - Client-side only validation
// - Weak TOTP implementation
// - No proper session revocation