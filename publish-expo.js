#!/usr/bin/env node

/**
 * Automated Expo publish script
 * Logs in with credentials and publishes the app
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const USERNAME = 'arwenrhea88@gmail.com';
const PASSWORD = 'Ranger12345.';

console.log('🚀 Starting Expo publish process...\n');

// Step 1: Check current directory
const appJsonPath = path.join(__dirname, 'app.json');
if (!fs.existsSync(appJsonPath)) {
  console.error('❌ Error: app.json not found. Run this from the ranger-app directory.');
  process.exit(1);
}

// Step 2: Attempt login and publish
try {
  console.log('📝 Logging into Expo...');
  
  // Use echo to pipe password to expo login
  const loginCmd = `echo ${PASSWORD} | npx expo login --username ${USERNAME}`;
  
  try {
    execSync(loginCmd, { 
      cwd: __dirname,
      stdio: 'inherit',
      shell: true 
    });
    console.log('✅ Login successful!\n');
  } catch (e) {
    console.log('ℹ️  Login attempt completed (may already be logged in)\n');
  }

  // Step 3: Publish
  console.log('📤 Publishing app to Expo...');
  execSync('npx expo publish', { 
    cwd: __dirname,
    stdio: 'inherit',
    shell: true 
  });

  console.log('\n✅ SUCCESS! Your app has been published!');
  console.log('\n📱 Share this link with your team:');
  console.log('   exp://exp.host/@cheind/ranger-app');
  console.log('\n📲 To test:');
  console.log('   1. Download "Expo Go" app from App Store or Google Play');
  console.log('   2. Open the link above in Expo Go');
  console.log('   3. Or scan the QR code that appeared above\n');

} catch (error) {
  console.error('\n❌ Publishing failed:');
  console.error(error.message);
  process.exit(1);
}
