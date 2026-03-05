import { createContext, useState, useContext, useEffect } from "react";
import API_URL from "../config/api";

const MentorContext = createContext();

export const MentorProvider = ({ children }) => {
	const [mentor, setMentor] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Check if mentor is logged in on mount
		const storedMentor = localStorage.getItem("mentor");
		const loginTime = localStorage.getItem("mentorLoginTime");

		if (storedMentor && loginTime) {
			const currentTime = new Date().getTime();
			const timeDiff = currentTime - parseInt(loginTime);
			const twoHours = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

			// Check if 2 hours have passed
			if (timeDiff >= twoHours) {
				// Session expired, clear storage
				localStorage.removeItem("mentor");
				localStorage.removeItem("mentorToken");
				localStorage.removeItem("mentorLoginTime");
				setMentor(null);
			} else {
				setMentor(JSON.parse(storedMentor));
			}
		}
		setLoading(false);
	}, []);

	const login = async (email, password) => {
		try {
			const response = await fetch(
				`${API_URL}/api/mentor-auth/login`,
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
			localStorage.setItem("mentor", JSON.stringify(data.mentor));
			localStorage.setItem("mentorToken", data.token);
			localStorage.setItem("mentorLoginTime", new Date().getTime().toString());
			setMentor(data.mentor);
			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: "Network error. Please try again.",
			};
		}
	};

	const logout = () => {
		localStorage.removeItem("mentor");
		localStorage.removeItem("mentorToken");
		localStorage.removeItem("mentorLoginTime");
		setMentor(null);
	};

	const isAuthenticated = mentor !== null;

	return (
		<MentorContext.Provider
			value={{
				mentor,
				loading,
				login,
				logout,
				isAuthenticated,
			}}
		>
			{children}
		</MentorContext.Provider>
	);
};

export const useMentor = () => {
	const context = useContext(MentorContext);
	if (!context) {
		throw new Error("useMentor must be used within MentorProvider");
	}
	return context;
};
