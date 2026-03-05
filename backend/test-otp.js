import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

console.log('Testing OTP Email Sending...');
console.log('Email User:', process.env.EMAIL_USER);
console.log('Email Password:', process.env.EMAIL_PASSWORD ? '***SET***' : 'NOT SET');

// Email configuration - Gmail SMTP (exact same as in instructorAuth.js)
const transporter = nodemailer.createTransport({
	host: 'smtp.gmail.com',
	port: 587,
	secure: false,
	auth: {
		type: 'login',
		user: String(process.env.EMAIL_USER || ''),
		pass: String(process.env.EMAIL_PASSWORD || ''),
	},
	tls: {
		rejectUnauthorized: false
	}
});

// Function to send OTP email (exact same as in instructorAuth.js)
const sendOTPEmail = async (email, otp, instructorName = "Instructor") => {
	const mailOptions = {
		from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
		to: email,
		subject: "YuganthaAI - Password Setup OTP",
		html: `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<h2>Password Setup - YuganthaAI</h2>
				<p>Hello ${instructorName},</p>
				<p>Please use the OTP below to set your password:</p>
				
				<div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
					<p style="margin: 0; color: #666; font-size: 14px;">Your OTP (valid for 10 minutes):</p>
					<p style="margin: 10px 0; font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #333;">${otp}</p>
				</div>
				
				<p>Go to the password setup page and enter this OTP along with your new password.</p>
				<p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/instructor/forgot-password" style="color: #007bff; text-decoration: none;">Set Your Password</a></p>
				
				<p style="color: #666; font-size: 12px; margin-top: 30px;">
					This OTP will expire in 10 minutes.
				</p>
			</div>
		`,
	};

	try {
		const info = await transporter.sendMail(mailOptions);
		console.log(`✅ OTP email sent successfully to ${email}`);
		console.log(`📧 Message ID: ${info.messageId}`);
		return true;
	} catch (error) {
		console.error(`❌ Failed to send OTP email to ${email}:`, error.message);
		throw new Error(`Failed to send OTP email: ${error.message}`);
	}
};

async function testOTP() {
	try {
		// Verify connection
		await transporter.verify();
		console.log('✅ Email server is ready to send messages');
		
		// Generate test OTP
		const otp = Math.floor(100000 + Math.random() * 900000).toString();
		console.log('Generated OTP:', otp);
		
		// Send OTP email
		await sendOTPEmail(process.env.EMAIL_USER, otp, "Test User");
		console.log('✅ OTP test completed successfully!');
		
	} catch (error) {
		console.error('❌ OTP Test Failed:', error.message);
		console.error('Full Error:', error);
	}
}

testOTP();
