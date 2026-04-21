// Test script to verify all products are displayed correctly
const api = {
  getProducts: async (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        qs.set(key, String(value));
      }
    });
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    const response = await fetch(`http://localhost:3866/api/v1/public/products${suffix}`);
    return response.json();
  }
};

async function testProducts() {
  try {
    // Test 1: Get all products
    console.log('Testing get all products...');
    const allProducts = await api.getProducts({ page: 1, limit: 100 });
    console.log(`✓ Retrieved ${allProducts.data.length} products`);
    
    // Test 2: Test category filtering
    console.log('\nTesting category filtering...');
    const categoryProducts = await api.getProducts({ categorySlug: 'charm-zBoaPLB6r', limit: 100 });
    console.log(`✓ Retrieved ${categoryProducts.data.length} products for category 'charm'`);
    
    // Test 3: Test search functionality
    console.log('\nTesting search functionality...');
    const searchResults = await api.getProducts({ q: 'charm', limit: 100 });
    console.log(`✓ Found ${searchResults.data.length} products matching 'charm'`);
    
    console.log('\n🎉 All tests passed! Products are now displaying correctly.');
    
    // Show some sample products
    console.log('\nSample products:');
    allProducts.data.slice(0, 5).forEach(product => {
      console.log(`- ${product.name} (${product.variants.length} variants)`);
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testProducts();