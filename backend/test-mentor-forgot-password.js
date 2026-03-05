import axios from 'axios';

const testForgotPassword = async () => {
	try {
		console.log('\n📧 Testing Mentor Forgot Password Endpoint...\n');
		
		// Test with a mentor email (you can update this)
		const testEmail = 'mentor@example.com';
		
		console.log(`Sending request to: http://localhost:5000/api/mentor-auth/forgot-password`);
		console.log(`Email: ${testEmail}`);
		
		const response = await axios.post(
			'http://localhost:5000/api/mentor-auth/forgot-password',
			{ email: testEmail },
			{
				headers: { 'Content-Type': 'application/json' }
			}
		);
		
		console.log('\n✅ Success! Response:', response.data);
		
	} catch (error) {
		if (error.response) {
			console.log('\n❌ Error Response:');
			console.log('Status:', error.response.status);
			console.log('Data:', error.response.data);
		} else if (error.request) {
			console.log('\n❌ No response received:', error.request);
		} else {
			console.log('\n❌ Error:', error.message);
		}
	}
};

testForgotPassword();
