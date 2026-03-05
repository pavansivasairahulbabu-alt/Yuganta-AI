#!/usr/bin/env node
/**
 * Gmail SMTP Diagnostic Tool
 * Helps diagnose Gmail SMTP connection issues
 */

import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

console.log('\n🔧 Gmail SMTP Diagnostic Tool\n');
console.log('═'.repeat(60));

// Check environment variables
console.log('\n📋 Environment Check:');
console.log('─'.repeat(60));
console.log('EMAIL_USER:', process.env.EMAIL_USER || '❌ NOT SET');
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ SET' : '❌ NOT SET');
console.log('EMAIL_PASSWORD length:', process.env.EMAIL_PASSWORD?.length || 0);

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
	console.error('\n❌ ERROR: EMAIL_USER and EMAIL_PASSWORD must be set in .env\n');
	process.exit(1);
}

// Test with nodemailer's Gmail service preset
console.log('\n🧪 Testing Gmail SMTP Connection:\n');

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL_USER?.trim(),
		pass: process.env.EMAIL_PASSWORD?.trim(),
	},
	pool: {
		maxConnections: 3,
		maxMessages: 100,
		rateDelta: 20000,
		rateLimit: 5,
	},
	logger: true,
	debug: true,
});

async function testConnection() {
	try {
		console.log('Verifying connection...\n');
		
		const result = await transporter.verify();
		
		if (result) {
			console.log('\n✅ SUCCESS! Gmail SMTP connection verified!\n');
			console.log('   Email will be sent from:', process.env.EMAIL_USER);
			console.log('   Service: Gmail');
			console.log('   Status: Ready\n');
			process.exit(0);
		} else {
			console.log('\n❌ Verification returned false\n');
			process.exit(1);
		}
	} catch (error) {
		console.error('\n❌ Connection Failed!\n');
		console.error('Error Code:', error.code);
		console.error('Error Message:', error.message);
		console.error('\n💡 Troubleshooting:');
		console.error('   1. Verify EMAIL_USER is correct Gmail address');
		console.error('   2. Verify EMAIL_PASSWORD is a Gmail App Password (not regular password)');
		console.error('   3. Gmail App Passwords only work if 2FA is enabled');
		console.error('   4. Check Gmail security settings at: https://myaccount.google.com/security');
		console.error('   5. Generate new App Password if needed\n');
		process.exit(1);
	}
}

testConnection();
