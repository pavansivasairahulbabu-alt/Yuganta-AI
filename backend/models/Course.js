import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
		trim: true,
	},
	description: {
		type: String,
		required: true,
	},
	instructorId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Instructor",
		default: null,
	},
	instructor: {
		type: String,
		required: true,
	},
	rating: {
		type: Number,
		default: 0,
		min: 0,
		max: 5,
	},
	students: {
		type: Number,
		default: 0,
	},
	lessons: {
		type: Number,
		default: 0,
	},
	duration: {
		type: String,
		default: "",
	},
	level: {
		type: String,
		enum: ["Beginner", "Intermediate", "Advanced"],
		default: "Beginner",
	},
	category: {
		type: String,
		required: true,
	},
	image: {
		type: String,
		default: "",
	},
	thumbnail: {
		type: String,
		default: "",
	},
	videoUrl: {
		type: String,
		default: "",
	},
	brochureLink: {
		type: String,
		default: "",
	},
	videoPublicId: {
		type: String,
		default: "",
	},
	videos: [
		{
			title: String,
			url: String,
			publicId: String,
			duration: String,
			order: Number,
		},
	],
	modules: [
		{
			title: {
				type: String,
				required: true,
			},
			description: {
				type: String,
				default: "",
			},
			order: {
				type: Number,
				required: true,
			},
			videos: [
				{
					title: {
						type: String,
						required: true,
					},
					url: {
						type: String,
						default: "",
					},
					publicId: {
						type: String,
						default: "",
					},
					duration: {
						type: String,
						default: "",
					},
					description: {
						type: String,
						default: "",
					},
					order: {
						type: Number,
						required: true,
					},
				},
			],
		},
	],
	price: {
		type: String,
		default: "Free",
	},
	isFree: {
		type: Boolean,
		default: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

const Course = mongoose.model("Course", courseSchema);

export default Course;
