// Quick test to check if our new components can be imported
console.log('Testing imports...');

try {
  // Test relative paths
  const fs = require('fs');
  
  // Check if files exist
  console.log('LeadGate.tsx exists:', fs.existsSync('./components/LeadGate.tsx'));
  console.log('useLeadGate.ts exists:', fs.existsSync('./hooks/useLeadGate.ts'));
  
  // Check component directory
  console.log('Components directory:', fs.readdirSync('./components'));
  console.log('Hooks directory:', fs.readdirSync('./hooks'));
  
  console.log('All files exist. Import paths should work.');
} catch (error) {
  console.error('Error checking files:', error);
}