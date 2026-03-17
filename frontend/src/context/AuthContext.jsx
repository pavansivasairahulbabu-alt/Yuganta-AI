import { createContext, useState, useContext, useEffect } from "react";
import API_URL from "../config/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [token, setToken] = useState(localStorage.getItem("token"));
	const [enrolledCourses, setEnrolledCourses] = useState([]);

	const fetchEnrolledCourses = async (authToken) => {
		try {
			const response = await fetch(`${API_URL}/api/users/enrolled`, {
				headers: { Authorization: `Bearer ${authToken}` },
			});
			if (response.ok) {
				const data = await response.json();
				setEnrolledCourses(Array.isArray(data) ? data : []);
			}
		} catch (error) {
			console.error("Error fetching enrolled courses in AuthContext:", error);
		}
	};

	useEffect(() => {
		// Check if user is logged in on mount
		const storedUser = localStorage.getItem("user");
		const storedToken = localStorage.getItem("token");

		if (storedUser && storedToken) {
			setUser(JSON.parse(storedUser));
			setToken(storedToken);
			fetchEnrolledCourses(storedToken);
		}
		setLoading(false);
	}, []);

	const login = async (email, password) => {
		try {
			const response = await fetch(`${API_URL}/api/auth/login`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, password }),
			});

			const contentType = response.headers.get("content-type");
			if (!contentType || !contentType.includes("application/json")) {
				return {
					success: false,
					error: `Server error: ${response.status} ${response.statusText}`,
					errorCode: null,
					status: response.status,
				};
			}

			const data = await response.json();

			if (!response.ok) {
				return {
					success: false,
					error: data.message || "Login failed",
					errorCode: data.errorCode || null,
					status: response.status,
				};
			}

			localStorage.setItem("user", JSON.stringify(data));
			localStorage.setItem("token", data.token);
			setUser(data);
			setToken(data.token);
			fetchEnrolledCourses(data.token);

			return { success: true };
		} catch (error) {
			return { success: false, error: error.message, errorCode: null };
		}
	};

	const signup = async (fullName, email, password) => {
		try {
			const response = await fetch(
				`${API_URL}/api/auth/signup`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ fullName, email, password }),
				}
			);

			const contentType = response.headers.get("content-type");
			if (!contentType || !contentType.includes("application/json")) {
				return {
					success: false,
					error: `Server error: ${response.status} ${response.statusText}`,
					errorCode: null,
					status: response.status,
				};
			}

			const data = await response.json();

			if (!response.ok) {
				return {
					success: false,
					error: data.message || "Signup failed",
					errorCode: data.errorCode || null,
					status: response.status,
				};
			}

			return {
				success: true,
				email: data.email,
				message: data.message || "OTP sent successfully",
			};
		} catch (error) {
			return { success: false, error: error.message, errorCode: null };
		}
	};

	const verifySignupOtp = async (email, otp) => {
		try {
			const response = await fetch(`${API_URL}/api/auth/verify-signup-otp`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, otp }),
			});

			const contentType = response.headers.get("content-type");
			if (!contentType || !contentType.includes("application/json")) {
				return {
					success: false,
					error: `Server error: ${response.status} ${response.statusText}`,
				};
			}

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "OTP verification failed");
			}

			localStorage.setItem("user", JSON.stringify(data));
			localStorage.setItem("token", data.token);
			setUser(data);
			setToken(data.token);
			fetchEnrolledCourses(data.token);

			return { success: true };
		} catch (error) {
			return { success: false, error: error.message };
		}
	};

	const googleLogin = async (credentialResponse) => {
		try {
			const response = await fetch(`${API_URL}/api/auth/google`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(credentialResponse),
			});

			const contentType = response.headers.get("content-type");
			if (!contentType || !contentType.includes("application/json")) {
				return {
					success: false,
					error: `Server error: ${response.status} ${response.statusText}`,
				};
			}

			const data = await response.json();

			if (!response.ok) {
				return {
					success: false,
					error: data.message || "Google login failed",
				};
			}

			localStorage.setItem("user", JSON.stringify(data));
			localStorage.setItem("token", data.token);
			setUser(data);
			setToken(data.token);
			fetchEnrolledCourses(data.token);

			return { success: true };
		} catch (error) {
			return { success: false, error: error.message };
		}
	};

	const logout = () => {
		setUser(null);
		setToken(null);
		setEnrolledCourses([]);
		localStorage.removeItem("user");
		localStorage.removeItem("token");
	};

	const refreshUser = () => {
		if (token) {
			fetchEnrolledCourses(token);
		}
	};

	const updateProfile = async (profileData) => {
		try {
			const response = await fetch(`${API_URL}/api/users/profile`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(profileData),
			});

			let data;
			const contentType = response.headers.get("content-type");
			if (contentType && contentType.includes("application/json")) {
				data = await response.json();
			} else {
				const text = await response.text();
				return {
					success: false,
					error: `Server error: ${response.status} ${response.statusText}`,
				};
			}

			if (!response.ok) {
				return {
					success: false,
					error: data.message || "Failed to update profile",
				};
			}

			// Update local storage and state with new user info
			const updatedUser = { ...user, ...data };
			localStorage.setItem("user", JSON.stringify(updatedUser));
			setUser(updatedUser);

			return { success: true };
		} catch (error) {
			return { success: false, error: error.message };
		}
	};

	const deleteAccount = async () => {
		try {
			// Ensure API_URL doesn't have a trailing slash
			let baseUrl = API_URL.trim().endsWith('/') ? API_URL.trim().slice(0, -1) : API_URL.trim();
			
			// Detect if baseUrl already includes /api
			let apiPath = "/api/users/delete-account";
			if (baseUrl.endsWith('/api')) {
				baseUrl = baseUrl.slice(0, -4);
			} else if (baseUrl.includes('/api/')) {
				baseUrl = baseUrl.split('/api')[0];
			}
			
			const targetUrl = `${baseUrl}${apiPath}`;
			console.log(`🔍 DIAGNOSTIC: baseUrl=${baseUrl}, API_URL=${API_URL}, targetUrl=${targetUrl}`);
			
			// DIAGNOSTIC: Check health endpoint first
			console.log(`🔍 DIAGNOSTIC: Checking backend health at ${baseUrl}/api/users/health`);
			try {
				const healthRes = await fetch(`${baseUrl}/api/users/health`);
				console.log(`🔍 DIAGNOSTIC: Health check status: ${healthRes.status}`);
				if (healthRes.ok) {
					const healthData = await healthRes.json();
					console.log(`🔍 DIAGNOSTIC: Health check data:`, healthData);
				}
			} catch (e) {
				console.error(`🔍 DIAGNOSTIC: Health check failed:`, e.message);
			}

			if (!token) {
				console.error("❌ ERROR: No auth token found!");
				return { success: false, error: "Authentication token missing. Please log in again." };
			}

			const response = await fetch(targetUrl, {
				method: "POST", // Changed from DELETE to POST for better compatibility
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json"
				},
			});

			console.log("Delete account response status:", response.status);
			console.log("Delete account response headers:", Object.fromEntries(response.headers.entries()));

			if (!response.ok) {
				const contentType = response.headers.get("content-type");
				console.log("Delete account response content-type:", contentType);
				if (contentType && contentType.includes("application/json")) {
					const data = await response.json();
					return {
						success: false,
						error: data.message || "Failed to delete account",
					};
				} else {
					const text = await response.text();
					console.log("Delete account non-json response body:", text.substring(0, 100));
					
					// If we get a non-JSON 404, it might be the frontend serving its index.html
					if (response.status === 404) {
						return {
							success: false,
							error: `Server error: 404 Not Found at ${targetUrl}. Please ensure your backend is running and the VITE_API_URL is correctly set.`,
						};
					}
					
					return {
						success: false,
						error: `Server error: ${response.status} ${response.statusText}. Please check the console for more details.`,
					};
				}
			}

			logout();
			return { success: true };
		} catch (error) {
			console.error("Delete account fetch error:", error);
			return { success: false, error: `Connection Error: ${error.message}. Please check if the backend is running.` };
		}
	};

	const enrollCourse = async (courseId) => {
		try {
			const response = await fetch(
				`${API_URL}/api/users/enroll/${courseId}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				}
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Enrollment failed");
			}

			// Fetch updated list of enrolled courses
			fetchEnrolledCourses(token);

			// Update user with new enrolled courses
			const updatedUser = {
				...user,
				enrolledCourses: data.enrolledCourses,
			};
			setUser(updatedUser);
			localStorage.setItem("user", JSON.stringify(updatedUser));

			return { success: true };
		} catch (error) {
			return { success: false, error: error.message };
		}
	};

	const isCourseEnrolled = (idOrTitle) => {
		if (!idOrTitle || !enrolledCourses) return false;
		const normalize = (value) =>
			String(value || "")
				.toLowerCase()
				.trim()
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/^-+|-+$/g, "");

		const searchStr = normalize(idOrTitle);
		if (!searchStr) return false;

		return enrolledCourses.some((item) => {
			const course = item?.courseId || item;
			if (!course) return false;

			const candidates = [
				course?._id,
				course?.title,
				item?.courseName,
				item?.courseId,
			]
				.map((value) => normalize(value))
				.filter(Boolean);

			return candidates.includes(searchStr);
		});
	};

	const value = {
		user,
		token,
		loading,
		login,
		signup,
		verifySignupOtp,
		logout,
		enrollCourse,
		googleLogin,
		isCourseEnrolled,
		enrolledCourses,
		refreshUser,
		updateProfile,
		deleteAccount,
		isAuthenticated: !!user,
	};

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
