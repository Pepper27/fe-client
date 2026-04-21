const axios = require('axios');

const API_BASE = 'http://localhost:3866';

async function testProductListing() {
  try {
    console.log('Testing API connection...');
    
    // Test 1: Get all products
    console.log('\n1. Testing get all products:');
    const allProducts = await axios.get(`${API_BASE}/api/v1/public/products`);
    console.log(`✓ Success! Retrieved ${allProducts.data.data.length} products`);
    
    // Test 2: Get categories
    console.log('\n2. Testing get categories:');
    const categories = await axios.get(`${API_BASE}/api/v1/public/categories`);
    console.log(`✓ Success! Retrieved ${categories.data.data.length} categories`);
    
    // Get a category slug for testing
    if (categories.data.data.length > 0) {
      const firstCategory = categories.data.data[0];
      console.log(`\nUsing category: "${firstCategory.name}" with slug: ${firstCategory.slug}`);
      
      // Test 3: Get products by category
      console.log('\n3. Testing get products by category:');
      const categoryProducts = await axios.get(`${API_BASE}/api/v1/public/products?categorySlug=${firstCategory.slug}`);
      console.log(`✓ Success! Retrieved ${categoryProducts.data.data.length} products for category "${firstCategory.name}"`);
    }
    
    console.log('\n🎉 All tests passed! The product listing by category should now work correctly.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testProductListing();