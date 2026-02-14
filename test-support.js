import axios from 'axios';

const testSupportEndpoint = async () => {
  try {
    console.log('🧪 Testing Support Endpoints\n');
    
    // Test 1: Get support contact (public)
    console.log('📍 Test 1: GET /api/support/contact (public)');
    const getResponse = await axios.get('http://localhost:5000/api/support/contact');
    console.log('✅ Success:', getResponse.data);
    console.log('');

    // Test 2: Update support contact (with mock admin token)
    // Note: This will fail without a valid token, but we can see the error
    console.log('📍 Test 2: PUT /api/support/contact/update (requires admin token)');
    
    try {
      const updateResponse = await axios.put(
        'http://localhost:5000/api/support/contact/update',
        {
          email: 'newemail@test.com',
          phone: '+91-9999999999',
          telegram: 'https://t.me/newtest',
          whatsapp: 'https://wa.me/919999999999',
          businessName: 'Test Business',
          description: 'Test Description'
        },
        {
          headers: {
            'Authorization': 'Bearer invalid_token',
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ Update Success:', updateResponse.data);
    } catch (updateError) {
      const errorData = updateError.response?.data;
      console.log('⚠️  Update failed (expected without valid token)');
      console.log('   Status:', updateError.response?.status);
      console.log('   Message:', errorData?.message || updateError.message);
    }

    console.log('\n✅ Tests completed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
};

testSupportEndpoint();
