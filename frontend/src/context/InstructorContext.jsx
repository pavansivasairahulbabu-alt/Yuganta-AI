import { createContext, useState, useContext, useEffect } from "react";
import API_URL from "../config/api";

const InstructorContext = createContext();

export const InstructorProvider = ({ children }) => {
	const [instructor, setInstructor] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Check if instructor is logged in on mount
		const storedInstructor = localStorage.getItem("instructor");
		const loginTime = localStorage.getItem("instructorLoginTime");
		
		if (storedInstructor && loginTime) {
			const currentTime = new Date().getTime();
			const timeDiff = currentTime - parseInt(loginTime);
			const twoHours = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
			
			// Check if 2 hours have passed
			if (timeDiff >= twoHours) {
				// Session expired, clear storage
				localStorage.removeItem("instructor");
				localStorage.removeItem("instructorToken");
				localStorage.removeItem("instructorLoginTime");
				setInstructor(null);
			} else {
				setInstructor(JSON.parse(storedInstructor));
			}
		}
		setLoading(false);
	}, []);

	const login = async (email, password) => {
		try {
			const response = await fetch(
				`${API_URL}/api/instructor-auth/login`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email, password }),
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				return {
					success: false,
					error: errorData.message || "Login failed",
				};
			}

			const data = await response.json();
			const instructorData = {
				_id: data._id,
				name: data.name,
				email: data.email,
				expertise: data.expertise,
				approved: data.approved,
				role: "instructor",
			};

			const loginTime = new Date().getTime();
			localStorage.setItem("instructor", JSON.stringify(instructorData));
			localStorage.setItem("instructorToken", data.token);
			localStorage.setItem("instructorLoginTime", loginTime.toString());
			setInstructor(instructorData);
			return { success: true };
		} catch (error) {
			console.error("Login error:", error);
			return {
				success: false,
				error: "Network error or server unavailable",
			};
		}
	};

	const logout = () => {
		setInstructor(null);
		localStorage.removeItem("instructor");
		localStorage.removeItem("instructorToken");
		localStorage.removeItem("instructorLoginTime");
	};

	// Auto-logout after 2 hours
	useEffect(() => {
		if (!instructor) return;

		const checkSession = () => {
			const loginTime = localStorage.getItem("instructorLoginTime");
			if (!loginTime) {
				logout();
				return;
			}

			const currentTime = new Date().getTime();
			const timeDiff = currentTime - parseInt(loginTime);
			const twoHours = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

			if (timeDiff >= twoHours) {
				alert("Your session has expired. Please log in again.");
				logout();
				window.location.href = "/instructor";
			}
		};

		// Check session every minute
		const interval = setInterval(checkSession, 60000);

		return () => clearInterval(interval);
	}, [instructor]);

	const value = {
		instructor,
		loading,
		login,
		logout,
		isAuthenticated: !!instructor,
	};

	return (
		<InstructorContext.Provider value={value}>
			{children}
		</InstructorContext.Provider>
	);
};

export const useInstructor = () => {
	const context = useContext(InstructorContext);
	if (!context) {
		throw new Error(
			"useInstructor must be used within an InstructorProvider"
		);
	}
	return context;
};
