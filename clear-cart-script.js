// Run this in your browser console on the deployed site to clear invalid cart items

console.log('🧹 Clearing invalid cart items...');

// Clear the cart from localStorage
try {
  localStorage.removeItem('military-tees-cart');
  console.log('✅ Cart cleared from localStorage');
} catch (error) {
  console.error('❌ Error clearing localStorage:', error);
}

// Clear any other cart-related storage
try {
  localStorage.removeItem('cart');
  localStorage.removeItem('cartItems');
  localStorage.removeItem('shopping-cart');
  console.log('✅ Additional cart storage cleared');
} catch (error) {
  console.error('❌ Error clearing additional storage:', error);
}

// Clear session storage too
try {
  sessionStorage.removeItem('military-tees-cart');
  sessionStorage.removeItem('cart');
  console.log('✅ Session storage cleared');
} catch (error) {
  console.error('❌ Error clearing session storage:', error);
}

console.log('🔄 Reloading page...');
window.location.reload();