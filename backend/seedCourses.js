import mongoose from "mongoose";
import Course from "./models/Course.js";
import dotenv from "dotenv";

dotenv.config();

const courses = [
	{
		title: "Generative AI Pinnacle Plus Program",
		description: "Master the art of Generative AI with hands-on projects, real-world applications, and expert mentorship. Learn to build AI models, work with large language models, and create innovative AI solutions.",
		instructor: "Dr. Sarah Chen",
		rating: 4.8,
		students: 2547,
		lessons: 45,
		duration: "30 Hours",
		level: "Advanced",
		category: "Artificial Intelligence",
		thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
		modules: [
			{
				title: "Introduction to Generative AI",
				description: "Understanding the fundamentals of generative models",
				order: 1,
				videos: [
					{ title: "What is Generative AI?", url: "", duration: "15:30", order: 1 },
					{ title: "Types of Generative Models", url: "", duration: "20:15", order: 2 },
					{ title: "GANs vs VAEs vs Transformers", url: "", duration: "25:45", order: 3 }
				]
			},
			{
				title: "Large Language Models",
				description: "Deep dive into LLMs and their applications",
				order: 2,
				videos: [
					{ title: "GPT Architecture", url: "", duration: "30:00", order: 1 },
					{ title: "Fine-tuning LLMs", url: "", duration: "35:20", order: 2 },
					{ title: "Prompt Engineering", url: "", duration: "22:15", order: 3 }
				]
			},
			{
				title: "Image Generation with AI",
				description: "Creating images using AI models",
				order: 3,
				videos: [
					{ title: "Stable Diffusion Basics", url: "", duration: "28:30", order: 1 },
					{ title: "DALL-E and Midjourney", url: "", duration: "24:45", order: 2 }
				]
			}
		]
	},
	{
		title: "Data Science Learning Path",
		description: "Comprehensive journey from Python basics to advanced machine learning. Build real-world data science projects and master statistical analysis, data visualization, and predictive modeling.",
		instructor: "Prof. Michael Rodriguez",
		rating: 4.9,
		students: 5234,
		lessons: 120,
		duration: "50 Hours",
		level: "Intermediate",
		category: "Data Science",
		thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
		modules: [
			{
				title: "Python for Data Science",
				description: "Master Python programming for data analysis",
				order: 1,
				videos: [
					{ title: "Python Basics", url: "", duration: "18:30", order: 1 },
					{ title: "NumPy and Pandas", url: "", duration: "32:15", order: 2 },
					{ title: "Data Manipulation", url: "", duration: "28:45", order: 3 }
				]
			},
			{
				title: "Statistical Analysis",
				description: "Understanding statistics for data science",
				order: 2,
				videos: [
					{ title: "Descriptive Statistics", url: "", duration: "25:00", order: 1 },
					{ title: "Hypothesis Testing", url: "", duration: "30:20", order: 2 },
					{ title: "Probability Distributions", url: "", duration: "27:15", order: 3 }
				]
			},
			{
				title: "Machine Learning Fundamentals",
				description: "Introduction to ML algorithms",
				order: 3,
				videos: [
					{ title: "Supervised Learning", url: "", duration: "35:30", order: 1 },
					{ title: "Unsupervised Learning", url: "", duration: "32:45", order: 2 },
					{ title: "Model Evaluation", url: "", duration: "28:20", order: 3 }
				]
			}
		]
	},
	{
		title: "Building Advanced AI Agents with CrewAI",
		description: "Learn to build sophisticated AI agents that can collaborate, reason, and solve complex problems. Master multi-agent systems and autonomous AI workflows.",
		instructor: "Alex Thompson",
		rating: 4.7,
		students: 1823,
		lessons: 35,
		duration: "25 Hours",
		level: "Advanced",
		category: "Artificial Intelligence",
		thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80",
		modules: [
			{
				title: "Introduction to AI Agents",
				description: "Understanding autonomous agents",
				order: 1,
				videos: [
					{ title: "What are AI Agents?", url: "", duration: "16:30", order: 1 },
					{ title: "Agent Architecture", url: "", duration: "22:15", order: 2 },
					{ title: "CrewAI Framework", url: "", duration: "19:45", order: 3 }
				]
			},
			{
				title: "Multi-Agent Systems",
				description: "Building collaborative agent systems",
				order: 2,
				videos: [
					{ title: "Agent Communication", url: "", duration: "28:00", order: 1 },
					{ title: "Task Delegation", url: "", duration: "25:20", order: 2 },
					{ title: "Agent Coordination", url: "", duration: "23:15", order: 3 }
				]
			}
		]
	},
	{
		title: "Full Stack Web Development Bootcamp",
		description: "Complete web development course covering frontend, backend, databases, and deployment. Build production-ready applications using modern frameworks and best practices.",
		instructor: "Jessica Williams",
		rating: 4.8,
		students: 8945,
		lessons: 150,
		duration: "80 Hours",
		level: "Beginner",
		category: "Web Development",
		thumbnail: "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=800&q=80",
		modules: [
			{
				title: "HTML, CSS & JavaScript",
				description: "Frontend fundamentals",
				order: 1,
				videos: [
					{ title: "HTML Essentials", url: "", duration: "20:30", order: 1 },
					{ title: "CSS Styling & Flexbox", url: "", duration: "28:15", order: 2 },
					{ title: "JavaScript Basics", url: "", duration: "35:45", order: 3 },
					{ title: "DOM Manipulation", url: "", duration: "32:20", order: 4 }
				]
			},
			{
				title: "React & Modern Frontend",
				description: "Building interactive UIs with React",
				order: 2,
				videos: [
					{ title: "React Components", url: "", duration: "30:00", order: 1 },
					{ title: "State Management", url: "", duration: "28:20", order: 2 },
					{ title: "Hooks & Effects", url: "", duration: "32:15", order: 3 }
				]
			},
			{
				title: "Node.js & Backend",
				description: "Server-side development",
				order: 3,
				videos: [
					{ title: "Node.js Fundamentals", url: "", duration: "25:30", order: 1 },
					{ title: "Express.js", url: "", duration: "30:45", order: 2 },
					{ title: "RESTful APIs", url: "", duration: "28:20", order: 3 }
				]
			}
		]
	},
	{
		title: "Machine Learning with Python",
		description: "Deep dive into machine learning algorithms, neural networks, and deep learning. Hands-on projects with scikit-learn, TensorFlow, and PyTorch.",
		instructor: "Dr. Raj Patel",
		rating: 4.9,
		students: 6789,
		lessons: 95,
		duration: "60 Hours",
		level: "Intermediate",
		category: "Machine Learning",
		thumbnail: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80",
		modules: [
			{
				title: "ML Foundations",
				description: "Core concepts and algorithms",
				order: 1,
				videos: [
					{ title: "Introduction to ML", url: "", duration: "22:30", order: 1 },
					{ title: "Linear Regression", url: "", duration: "30:15", order: 2 },
					{ title: "Classification Algorithms", url: "", duration: "35:45", order: 3 }
				]
			},
			{
				title: "Deep Learning",
				description: "Neural networks and deep learning",
				order: 2,
				videos: [
					{ title: "Neural Networks Basics", url: "", duration: "38:00", order: 1 },
					{ title: "CNNs for Image Recognition", url: "", duration: "42:20", order: 2 },
					{ title: "RNNs and LSTMs", url: "", duration: "40:15", order: 3 }
				]
			}
		]
	},
	{
		title: "Cloud Computing with AWS",
		description: "Master Amazon Web Services from basics to advanced. Learn EC2, S3, Lambda, DynamoDB, and serverless architecture. Prepare for AWS certification.",
		instructor: "Mark Johnson",
		rating: 4.7,
		students: 4532,
		lessons: 75,
		duration: "45 Hours",
		level: "Intermediate",
		category: "Cloud Computing",
		thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
		modules: [
			{
				title: "AWS Fundamentals",
				description: "Getting started with AWS",
				order: 1,
				videos: [
					{ title: "AWS Overview", url: "", duration: "18:30", order: 1 },
					{ title: "IAM and Security", url: "", duration: "25:15", order: 2 },
					{ title: "EC2 Instances", url: "", duration: "30:45", order: 3 }
				]
			},
			{
				title: "Storage and Databases",
				description: "AWS storage solutions",
				order: 2,
				videos: [
					{ title: "S3 Buckets", url: "", duration: "28:00", order: 1 },
					{ title: "RDS and DynamoDB", url: "", duration: "32:20", order: 2 }
				]
			}
		]
	},
	{
		title: "Cybersecurity Fundamentals",
		description: "Learn ethical hacking, network security, cryptography, and security best practices. Hands-on labs with real-world scenarios.",
		instructor: "Emily Davis",
		rating: 4.8,
		students: 3421,
		lessons: 65,
		duration: "40 Hours",
		level: "Intermediate",
		category: "Cybersecurity",
		thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
		modules: [
			{
				title: "Security Basics",
				description: "Introduction to cybersecurity",
				order: 1,
				videos: [
					{ title: "Cybersecurity Overview", url: "", duration: "20:30", order: 1 },
					{ title: "Network Security", url: "", duration: "28:15", order: 2 },
					{ title: "Encryption Basics", url: "", duration: "25:45", order: 3 }
				]
			},
			{
				title: "Ethical Hacking",
				description: "Penetration testing basics",
				order: 2,
				videos: [
					{ title: "Reconnaissance", url: "", duration: "30:00", order: 1 },
					{ title: "Vulnerability Assessment", url: "", duration: "32:20", order: 2 }
				]
			}
		]
	},
	{
		title: "Mobile App Development with React Native",
		description: "Build cross-platform mobile apps for iOS and Android using React Native. Learn navigation, state management, and app deployment.",
		instructor: "Carlos Martinez",
		rating: 4.6,
		students: 2987,
		lessons: 55,
		duration: "35 Hours",
		level: "Intermediate",
		category: "Mobile Development",
		thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80",
		modules: [
			{
				title: "React Native Basics",
				description: "Getting started with mobile development",
				order: 1,
				videos: [
					{ title: "Setup and Installation", url: "", duration: "15:30", order: 1 },
					{ title: "Components and Props", url: "", duration: "22:15", order: 2 },
					{ title: "Styling in React Native", url: "", duration: "20:45", order: 3 }
				]
			},
			{
				title: "Navigation and State",
				description: "Building app navigation",
				order: 2,
				videos: [
					{ title: "React Navigation", url: "", duration: "28:00", order: 1 },
					{ title: "Redux for State Management", url: "", duration: "35:20", order: 2 }
				]
			}
		]
	},
	{
		title: "DevOps Engineering Complete Course",
		description: "Master CI/CD pipelines, Docker, Kubernetes, Jenkins, and infrastructure as code. Learn modern DevOps practices and tools.",
		instructor: "David Kim",
		rating: 4.9,
		students: 5621,
		lessons: 85,
		duration: "55 Hours",
		level: "Advanced",
		category: "DevOps",
		thumbnail: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&q=80",
		modules: [
			{
				title: "DevOps Fundamentals",
				description: "Introduction to DevOps culture",
				order: 1,
				videos: [
					{ title: "What is DevOps?", url: "", duration: "18:30", order: 1 },
					{ title: "Git and Version Control", url: "", duration: "25:15", order: 2 },
					{ title: "CI/CD Concepts", url: "", duration: "22:45", order: 3 }
				]
			},
			{
				title: "Containerization",
				description: "Docker and containers",
				order: 2,
				videos: [
					{ title: "Docker Basics", url: "", duration: "30:00", order: 1 },
					{ title: "Docker Compose", url: "", duration: "28:20", order: 2 },
					{ title: "Kubernetes Introduction", url: "", duration: "35:15", order: 3 }
				]
			}
		]
	},
	{
		title: "Blockchain Development Masterclass",
		description: "Learn blockchain technology, smart contracts, Solidity programming, and DApp development. Build decentralized applications on Ethereum.",
		instructor: "Satoshi Nakamura",
		rating: 4.7,
		students: 2145,
		lessons: 60,
		duration: "42 Hours",
		level: "Advanced",
		category: "Blockchain",
		thumbnail: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80",
		modules: [
			{
				title: "Blockchain Basics",
				description: "Understanding blockchain technology",
				order: 1,
				videos: [
					{ title: "What is Blockchain?", url: "", duration: "20:30", order: 1 },
					{ title: "Cryptocurrency Fundamentals", url: "", duration: "25:15", order: 2 },
					{ title: "Ethereum Overview", url: "", duration: "22:45", order: 3 }
				]
			},
			{
				title: "Smart Contracts",
				description: "Solidity programming",
				order: 2,
				videos: [
					{ title: "Solidity Basics", url: "", duration: "32:00", order: 1 },
					{ title: "Writing Smart Contracts", url: "", duration: "38:20", order: 2 },
					{ title: "Testing and Deployment", url: "", duration: "30:15", order: 3 }
				]
			}
		]
	}
];

const seedCourses = async () => {
	try {
		await mongoose.connect(process.env.MONGODB_URI);
		console.log("MongoDB connected...");

		// Clear existing courses
		await Course.deleteMany({});
		console.log("Existing courses cleared");

		// Insert new courses
		await Course.insertMany(courses);
		console.log(`${courses.length} courses added successfully!`);

		process.exit(0);
	} catch (error) {
		console.error("Error seeding courses:", error);
		process.exit(1);
	}
};

seedCourses();
