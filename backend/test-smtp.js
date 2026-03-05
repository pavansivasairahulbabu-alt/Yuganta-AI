import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

console.log('Testing SMTP Connection...');
console.log('Email User:', process.env.EMAIL_USER);
console.log('Email User Length:', process.env.EMAIL_USER?.length);
console.log('Email Password:', process.env.EMAIL_PASSWORD ? '***hidden***' : 'NOT SET');
console.log('Email Password Length:', process.env.EMAIL_PASSWORD?.length);
console.log('Email Password Type:', typeof process.env.EMAIL_PASSWORD);

// Email configuration - Gmail SMTP
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
	maxConnections: 5,
	maxMessages: 100,
	socketTimeout: 60000,
	connectionTimeout: 60000,
	debug: true,
	logger: true
});

async function testSMTP() {
	try {
		// Verify connection configuration
		await transporter.verify();
		console.log('✅ SMTP Server is ready to take our messages');
		
		// Send a test email
		const testEmail = {
			from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
			to: process.env.EMAIL_USER, // Send to yourself
			subject: 'YuganthaAI - SMTP Test Email',
			html: `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
					<h2>SMTP Test Email</h2>
					<p>This is a test email from YuganthaAI.</p>
					<p>If you received this, your SMTP configuration is working correctly!</p>
					<p style="color: #666; font-size: 12px; margin-top: 30px;">
						Sent at: ${new Date().toLocaleString()}
					</p>
				</div>
			`,
		};
		
		const info = await transporter.sendMail(testEmail);
		console.log('✅ Test email sent successfully!');
		console.log('Message ID:', info.messageId);
		
	} catch (error) {
		console.error('❌ SMTP Test Failed:');
		console.error('Error Code:', error.code);
		console.error('Error Message:', error.message);
		console.error('Full Error:', error);
	}
}

testSMTP();
