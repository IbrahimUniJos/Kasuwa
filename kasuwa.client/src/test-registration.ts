// Temporary test file to debug registration
import { authService } from './services/auth';
import { UserType } from './types/api';

async function testRegistration() {
  console.log('Testing registration...');
  
  try {
    // Test customer registration
    const customerData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@test.com',
      password: 'TestPassword123!',
      confirmPassword: 'TestPassword123!',
      dateOfBirth: '1990-01-01',
      preferredLanguage: 'en'
    };
    
    console.log('Testing customer signup with data:', {
      ...customerData,
      password: '[HIDDEN]',
      confirmPassword: '[HIDDEN]'
    });
    
    const result = await authService.signupCustomer(customerData);
    console.log('Registration successful:', result);
    
  } catch (error: any) {
    console.error('Registration failed:');
    console.error('Error message:', error.message);
    console.error('Error status:', error.status);
    console.error('Error details:', error.errors);
    console.error('Full error:', error);
  }
}

// Test with direct register call as well
async function testDirectRegister() {
  console.log('\nTesting direct register...');
  
  try {
    const registerData = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@test.com',
      password: 'TestPassword123!',
      confirmPassword: 'TestPassword123!',
      userType: UserType.Customer
    };
    
    console.log('Testing direct register with data:', {
      ...registerData,
      password: '[HIDDEN]',
      confirmPassword: '[HIDDEN]'
    });
    
    const result = await authService.register(registerData);
    console.log('Direct register successful:', result);
    
  } catch (error: any) {
    console.error('Direct register failed:');
    console.error('Error message:', error.message);
    console.error('Error status:', error.status);
    console.error('Error details:', error.errors);
    console.error('Full error:', error);
  }
}

// Test vendor signup
async function testVendorSignup() {
  console.log('\nTesting vendor signup...');
  
  try {
    const vendorData = {
      firstName: 'Bob',
      lastName: 'Vendor',
      email: 'bob.vendor@test.com',
      password: 'TestPassword123!',
      confirmPassword: 'TestPassword123!',
      businessName: 'Bob\'s Store',
      businessDescription: 'A great store',
      businessAddress: '123 Business St',
      businessPhone: '(555) 123-4567' // Properly formatted phone number
    };
    
    console.log('Testing vendor signup with data:', {
      ...vendorData,
      password: '[HIDDEN]',
      confirmPassword: '[HIDDEN]'
    });
    
    // Test phone number formatting
    console.log('Formatted phone:', authService.formatPhone('5551234567'));
    console.log('Formatted phone:', authService.formatPhone('+1-555-123-4567'));
    console.log('Phone validation test:', authService.validatePhoneNumber('(555) 123-4567'));
    
    const result = await authService.signupVendor(vendorData);
    console.log('Vendor signup successful:', result);
    
  } catch (error: any) {
    console.error('Vendor signup failed:');
    console.error('Error message:', error.message);
    console.error('Error status:', error.status);
    console.error('Error details:', error.errors);
    console.error('Full error:', error);
  }
}

// Test different phone number formats
async function testPhoneFormats() {
  console.log('\nTesting phone number formats...');
  
  const phoneNumbers = [
    '5551234567',           // 10 digits
    '(555) 123-4567',       // Standard US format
    '555-123-4567',         // Dashed format
    '555.123.4567',         // Dotted format
    '+1 (555) 123-4567',    // International US format
    '+1-555-123-4567',      // International dashed
    '15551234567',          // 11 digits with country code
    '+44 20 7946 0958',     // UK format
    '123',                  // Invalid - too short
    '+1234567890123'        // Invalid - too long for US
  ];
  
  phoneNumbers.forEach(phone => {
    const isValid = authService.validatePhoneNumber(phone);
    const formatted = authService.formatPhone(phone);
    console.log(`Phone: "${phone}" | Valid: ${isValid} | Formatted: "${formatted}"`);
  });
}

// Run all tests
export async function runRegistrationTests() {
  await testRegistration();
  await testDirectRegister();
  await testVendorSignup();
  await testPhoneFormats();
}

// Make it available globally for browser console testing
(window as any).testRegistration = runRegistrationTests;
(window as any).testPhoneFormats = testPhoneFormats;

console.log('Registration test functions loaded. Run window.testRegistration() in console to test.');