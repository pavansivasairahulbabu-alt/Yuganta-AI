import { createContext, useState, useContext, useEffect } from "react";
import API_URL from "../config/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [token, setToken] = useState(localStorage.getItem("token"));

	useEffect(() => {
		// Check if user is logged in on mount
		const storedUser = localStorage.getItem("user");
		const storedToken = localStorage.getItem("token");

		if (storedUser && storedToken) {
			setUser(JSON.parse(storedUser));
			setToken(storedToken);
		}
		setLoading(false);
	}, []);

	const login = async (email, password) => {
		try {
			const response = await fetch(
				`${API_URL}/api/auth/login`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ email, password }),
				}
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Login failed");
			}

			localStorage.setItem("user", JSON.stringify(data));
			localStorage.setItem("token", data.token);
			setUser(data);
			setToken(data.token);

			return { success: true };
		} catch (error) {
			return { success: false, error: error.message };
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

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Signup failed");
			}

			localStorage.setItem("user", JSON.stringify(data));
			localStorage.setItem("token", data.token);
			setUser(data);
			setToken(data.token);

			return { success: true };
		} catch (error) {
			return { success: false, error: error.message };
		}
	};

	const logout = () => {
		setUser(null);
		setToken(null);
		localStorage.removeItem("user");
		localStorage.removeItem("token");
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

	const value = {
		user,
		token,
		loading,
		login,
		signup,
		logout,
		enrollCourse,
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
