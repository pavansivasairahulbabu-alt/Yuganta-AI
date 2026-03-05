import jwt from "jsonwebtoken";
import Instructor from "../models/Instructor.js";

export const protectInstructor = async (req, res, next) => {
	let token;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		try {
			// Get token from header
			token = req.headers.authorization.split(" ")[1];

			// Short-circuit clearly invalid bearer placeholders
			if (!token || token === "null" || token === "undefined") {
				return res.status(401).json({ message: "Not authorized, no token" });
			}

			// Verify token
			const decoded = jwt.verify(token, process.env.JWT_SECRET);

			// Get instructor from token
			req.instructor = await Instructor.findById(decoded.id).select("-password");
			
			if (!req.instructor) {
				return res.status(401).json({ message: "Please login as instructor" });
			}

			return next();
		} catch (error) {
			console.error("Instructor auth error:", error);
			return res.status(401).json({ message: "Not authorized, token failed" });
		}
	}

	if (!token) {
		return res.status(401).json({ message: "Not authorized, no token" });
	}
};
