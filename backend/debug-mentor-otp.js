#!/usr/bin/env node

/**
 * Mentor OTP Email Debugging Tool
 * Usage: node debug-mentor-otp.js [email]
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const testEmail = process.argv[2] || 'testmentor@example.com';

console.log('\n🔍 Mentor OTP Email Debugging Tool\n');
console.log('═'.repeat(50));

// Check environment variables
console.log('\n📋 Environment Variables Check:');
console.log('─'.repeat(50));
const requiredVars = ['MONGODB_URI', 'JWT_SECRET', 'EMAIL_USER', 'EMAIL_PASSWORD'];
let allVarsSet = true;

requiredVars.forEach(varName => {
	const isSet = !!process.env[varName];
	const status = isSet ? '✅' : '❌';
	if (!isSet) allVarsSet = false;
	console.log(`${status} ${varName}`);
});

if (!allVarsSet) {
	console.log('\n⚠️  Some environment variables are missing!');
	console.log('Please set them in .env file\n');
	process.exit(1);
}

console.log('\n✅ All environment variables are set!\n');

// Test SMTP
console.log('📧 Testing SMTP Configuration:');
console.log('─'.repeat(50));

import("nodemailer").then(async (nodemailerModule) => {
	const nodemailer = nodemailerModule.default;
	
	const transporter = nodemailer.createTransport({
		host: 'smtp.gmail.com',
		port: 587,
		secure: false,
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASSWORD,
		},
		tls: {
			rejectUnauthorized: false
		}
	});
	
	try {
		await transporter.verify();
		console.log('✅ SMTP connection successful!');
		console.log(`   From: ${process.env.EMAIL_FROM || process.env.EMAIL_USER}`);
	} catch (error) {
		console.log('❌ SMTP connection failed!');
		console.log(`   Error: ${error.message}`);
		process.exit(1);
	}
	
	// Test MongoDB
	console.log('\n🗄️  Testing MongoDB Connection:');
	console.log('─'.repeat(50));
	
	try {
		const dbModule = await import('./config/db.js');
		const mentorModule = await import('./models/Mentor.js');
		const Mentor = mentorModule.default;
		
		// Give MongoDB a moment to connect
		await new Promise(resolve => setTimeout(resolve, 2000));
		
		const mentor = await Mentor.findOne({ email: testEmail });
		
		if (mentor) {
			console.log(`✅ Mentor found: ${mentor.name}`);
			console.log(`   Email: ${mentor.email}`);
			console.log(`   ID: ${mentor._id}`);
			console.log(`   Approved: ${mentor.approved}`);
			console.log(`   Active: ${mentor.active}`);
			
			// Try sending test OTP
			console.log('\n📤 Sending Test OTP Email:');
			console.log('─'.repeat(50));
			
			const otp = Math.floor(100000 + Math.random() * 900000).toString();
			const mailOptions = {
				from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
				to: mentor.email,
				subject: "YuganthaAI - Test OTP",
				html: `
					<div style="font-family: Arial, sans-serif;">
						<h2>Test OTP - YuganthaAI</h2>
						<p>Hello ${mentor.name},</p>
						<p>This is a test OTP email. If you received this, the system is working!</p>
						<p style="font-size: 24px; font-weight: bold; color: #333;">${otp}</p>
						<p style="color: #666; font-size: 12px; margin-top: 30px;">
							Sent at: ${new Date().toLocaleString()}
						</p>
					</div>
				`,
			};
			
			try {
				const info = await transporter.sendMail(mailOptions);
				console.log('✅ Test email sent successfully!');
				console.log(`   To: ${mentor.email}`);
				console.log(`   Message ID: ${info.messageId}`);
				console.log(`   OTP for testing: ${otp}`);
			} catch (error) {
				console.log('❌ Failed to send test email!');
				console.log(`   Error: ${error.message}`);
			}
		} else {
			console.log(`❌ Mentor not found with email: ${testEmail}`);
			console.log('\n💡 To test, run: node create-test-mentor.js');
		}
		
		process.exit(0);
	} catch (error) {
		console.log('❌ MongoDB connection failed!');
		console.log(`   Error: ${error.message}`);
		console.log('\n💡 Possible issues:');
		console.log('   1. MongoDB Atlas cluster is offline');
		console.log('   2. IP address not whitelisted');
		console.log('   3. Connection string is incorrect');
		process.exit(1);
	}
}).catch(error => {
	console.error('Error:', error.message);
	process.exit(1);
});
