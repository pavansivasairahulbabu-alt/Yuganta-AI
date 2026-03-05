import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
	const { user, logout, isAuthenticated } = useAuth();
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState("profile");
	const [formData, setFormData] = useState({
		fullName: "",
		email: "",
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});
	const [deleteConfirm, setDeleteConfirm] = useState("");
	const [showDeleteWarning, setShowDeleteWarning] = useState(false);

	useEffect(() => {
		if (!isAuthenticated) {
			navigate("/", { replace: true });
		}
		if (user) {
			setFormData({
				fullName: user.fullName || "",
				email: user.email || "",
				currentPassword: "",
				newPassword: "",
				confirmPassword: "",
			});
		}
	}, [isAuthenticated, navigate, user]);

	const handleInputChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleUpdateProfile = async (e) => {
		e.preventDefault();
		// TODO: Implement profile update API call
		toast.success("Profile update functionality will be implemented with backend API");
	};

	const handleChangePassword = async (e) => {
		e.preventDefault();
		if (formData.newPassword !== formData.confirmPassword) {
			toast.error("New passwords don't match!");
			return;
		}
		// TODO: Implement password change API call
		toast.success("Password change functionality will be implemented with backend API");
	};

	const handleDeleteAccount = async () => {
		if (deleteConfirm !== "DELETE") {
			toast.error('Please type "DELETE" to confirm account deletion');
			return;
		}
		// TODO: Implement account deletion API call
		toast.success("Account deletion functionality will be implemented with backend API");
		logout();
		navigate("/", { replace: true });
	};

	if (!user) {
		return <LoadingSpinner />;
	}

	return (
			<div className='min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] pt-20 pb-12 transition-colors duration-300'>
			<div className='max-w-5xl mx-auto px-4 md:px-6 py-8'>
				{/* Profile Header */}
					<div className='bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6 md:p-8 mb-8'>
					<div className='flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6'>
							<div className='w-24 h-24 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center text-4xl font-bold text-blue-500'>
							{user.fullName?.charAt(0).toUpperCase()}
						</div>
						<div className='flex-1 text-center md:text-left'>
							<h1 className='text-2xl md:text-3xl font-bold mb-2'>
								{user.fullName}
							</h1>
								<p className='text-[var(--text-muted)] text-sm md:text-base mb-4'>{user.email}</p>
							<div className='flex flex-wrap gap-2 justify-center md:justify-start'>
									<span className='bg-[var(--bg-secondary)] px-4 py-1 rounded-full text-sm'>
									Student
								</span>
									<span className='bg-[var(--bg-secondary)] px-4 py-1 rounded-full text-sm'>
									Member since {new Date().getFullYear()}
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Tabs */}
				<div className='flex space-x-1 mb-6 bg-[var(--card-bg)] p-1 rounded-lg transition-colors duration-300'>
					<button
						onClick={() => setActiveTab("profile")}
						className={`flex-1 px-6 py-3 rounded-lg font-medium transition duration-200 ${activeTab === "profile"
							? "bg-blue-500 text-white"
							: "text-[var(--text-muted)] hover:text-[var(--text-color)]"
							}`}>
						Edit Profile
					</button>
					<button
						onClick={() => setActiveTab("delete")}
						className={`flex-1 px-6 py-3 rounded-lg font-medium transition duration-200 ${activeTab === "delete"
							? "bg-red-600 text-white"
							: "text-[var(--text-muted)] hover:text-[var(--text-color)]"
							}`}>
						Delete Account
					</button>
				</div>

				{/* Edit Profile Tab */}
				{activeTab === "profile" && (
					<div className='bg-[var(--card-bg)] rounded-xl p-6 md:p-8 transition-colors duration-300'>
						<h2 className='text-xl md:text-2xl font-bold mb-6'>Personal Information</h2>

						<form onSubmit={handleUpdateProfile} className='space-y-6 mb-8'>
							<div>
								<label className='block text-sm font-medium mb-2'>Full Name</label>
								<input
									type='text'
									name='fullName'
									value={formData.fullName}
									onChange={handleInputChange}
									className='w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-[var(--text-color)] focus:outline-none focus:border-purple-500 transition-colors duration-300'
								/>
							</div>

							<div>
								<label className='block text-sm font-medium mb-2'>Email Address</label>
								<input
									type='email'
									name='email'
									value={formData.email}
									onChange={handleInputChange}
									className='w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-[var(--text-color)] focus:outline-none focus:border-purple-500 transition-colors duration-300'
								/>
							</div>

							<button
								type='submit'
								className='w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium transition duration-200'>
								Save Changes
							</button>
						</form>

						<hr className='border-gray-700 my-8' />

						<h2 className='text-xl md:text-2xl font-bold mb-6'>Change Password</h2>

						<form onSubmit={handleChangePassword} className='space-y-6'>
							<div>
								<label className='block text-sm font-medium mb-2'>Current Password</label>
								<input
									type='password'
									name='currentPassword'
									value={formData.currentPassword}
									onChange={handleInputChange}
									className='w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-[var(--text-color)] focus:outline-none focus:border-purple-500 transition-colors duration-300'
									placeholder='Enter current password'
								/>
							</div>

							<div>
								<label className='block text-sm font-medium mb-2'>New Password</label>
								<input
									type='password'
									name='newPassword'
									value={formData.newPassword}
									onChange={handleInputChange}
									className='w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-[var(--text-color)] focus:outline-none focus:border-purple-500 transition-colors duration-300'
									placeholder='Enter new password'
								/>
							</div>

							<div>
								<label className='block text-sm font-medium mb-2'>Confirm New Password</label>
								<input
									type='password'
									name='confirmPassword'
									value={formData.confirmPassword}
									onChange={handleInputChange}
									className='w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-[var(--text-color)] focus:outline-none focus:border-purple-500 transition-colors duration-300'
									placeholder='Confirm new password'
								/>
							</div>

							<button
								type='submit'
								className='w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium transition duration-200'>
								Update Password
							</button>
						</form>
					</div>
				)}

				{/* Delete Account Tab */}
				{activeTab === "delete" && (
					<div className='bg-[var(--card-bg)] rounded-xl p-6 md:p-8 transition-colors duration-300'>
						<div className='flex items-start space-x-4 mb-6'>
							<svg
								className='w-8 h-8 text-red-500 flex-shrink-0 mt-1'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
								/>
							</svg>
							<div>
								<h2 className='text-xl md:text-2xl font-bold text-red-500 mb-2'>
									Danger Zone
								</h2>
								<p className='text-gray-400 mb-4'>
									Once you delete your account, there is no going back. Please be certain.
								</p>
							</div>
						</div>

						{!showDeleteWarning ? (
							<button
								onClick={() => setShowDeleteWarning(true)}
								className='bg-red-500/10 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-6 py-3 rounded-lg font-medium transition duration-200'>
								I want to delete my account
							</button>
						) : (
							<div className='space-y-6 bg-red-500/5 border border-red-500/20 rounded-lg p-6'>
								<div>
									<h3 className='text-lg font-bold text-red-400 mb-3'>
										Before you go, please note:
									</h3>
									<ul className='space-y-2 text-gray-300 mb-6'>
										<li className='flex items-start space-x-2'>
											<span className='text-red-500 mt-1'>•</span>
											<span>All your course progress will be permanently deleted</span>
										</li>
										<li className='flex items-start space-x-2'>
											<span className='text-red-500 mt-1'>•</span>
											<span>You will lose access to all enrolled courses</span>
										</li>
										<li className='flex items-start space-x-2'>
											<span className='text-red-500 mt-1'>•</span>
											<span>Your certificates and achievements will be removed</span>
										</li>
										<li className='flex items-start space-x-2'>
											<span className='text-red-500 mt-1'>•</span>
											<span>This action cannot be undone</span>
										</li>
									</ul>
								</div>

								<div>
									<label className='block text-sm font-medium mb-2'>
										Type <span className='font-bold text-red-400'>DELETE</span> to confirm
									</label>
									<input
										type='text'
										value={deleteConfirm}
										onChange={(e) => setDeleteConfirm(e.target.value)}
										className='w-full bg-[var(--bg-color)] border border-red-500/50 rounded-lg px-4 py-3 text-[var(--text-color)] focus:outline-none focus:border-red-500 transition-colors duration-300'
										placeholder='Type DELETE here'
									/>
								</div>

								<div className='flex flex-col md:flex-row gap-4'>
									<button
										onClick={handleDeleteAccount}
										disabled={deleteConfirm !== "DELETE"}
										className='flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-700 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-medium transition duration-200'>
										Permanently Delete My Account
									</button>
									<button
										onClick={() => {
											setShowDeleteWarning(false);
											setDeleteConfirm("");
										}}
										className='flex-1 bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg font-medium transition duration-200'>
										Cancel
									</button>
								</div>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
