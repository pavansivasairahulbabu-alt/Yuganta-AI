import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { InstructorProvider } from "./context/InstructorContext";
import { MentorProvider } from "./context/MentorContext";
import { ScrollToTop } from "./components/ScrollToTop";
import MainNavbar from "./components/MainNavbar";
import CoursesNavbar from "./components/CoursesNavbar";
import Hero from "./components/Hero";
import FreeCourses from "./components/FreeCourses";
import LearningPaths from "./components/LearningPaths";
import Footer from "./components/Footer";
import LoadingSpinner from "./components/LoadingSpinner";
import LandingPage from "./pages/LandingPage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage"; 
import CourseDetailsPage from "./pages/CourseDetailsPage";
import MyLearningPage from "./pages/MyLearningPage";
import MentorshipPage from "./pages/MentorshipPage";
import MentorshipBookingPage from "./pages/MentorshipBookingPage";
import MyMentorshipSessionsPage from "./pages/MyMentorshipSessionsPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import InstructorLoginPage from "./pages/InstructorLoginPage";
import InstructorDashboard from "./pages/InstructorDashboard";
import MentorLoginPage from "./pages/MentorLoginPage";
import MentorDashboard from "./pages/MentorDashboard";
import MentorForgotPasswordPage from "./pages/MentorForgotPasswordPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminMentorManagement from "./pages/AdminMentorManagement";
import AdminInstructorManagement from "./pages/AdminInstructorManagement";
import AdminAssignMentors from "./pages/AdminAssignInstructors";
import AdminAssignInstructors from "./pages/AdminAssignInstructors";
import AdminMentorAssignments from "./pages/AdminMentorAssignments";
import AdminRegistrations from "./pages/AdminRegistrations";
import AdminBlogManagement from "./pages/AdminBlogManagement";
import AdminMentorshipBookings from "./pages/AdminMentorshipBookings";
import InstructorForgotPasswordPage from "./pages/InstructorForgotPasswordPage";
import BlogsPage from "./pages/BlogsPage";
import BlogDetailPage from "./pages/BlogDetailPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import CareersPage from "./pages/CareersPage";
import CourtBookerPage from "./pages/projects/CourtBookerPage";
import AIAgentAvatarPage from "./pages/projects/AIAgentAvatarPage";
import HVACAgentPage from "./pages/projects/HVACAgentPage";
import AILearningPlatformPage from "./pages/projects/AILearningPlatformPage";
import InstructorsPage from "./pages/InstructorsPage";
import AgenticAICrashCoursePage from "./pages/courses/AgenticAICrashCoursePage";
import AgenticAIPioneerProgramPage from "./pages/courses/AgenticAIPioneerProgramPage";
import DsaMlProgramPage from "./pages/courses/MasteringDataStructures&Algorithms";

function CoursesHomePage() {
	return (
		<>
			<Hero />
			<FreeCourses />
			<LearningPaths />
		</>
	);
}

function MainLayout({ children }) {
	return (
		<>
			<MainNavbar />
			{children}
			<Footer />
		</>
	);
}

function CoursesLayout({ children }) {
	return (
		<>
			<CoursesNavbar />
			{children}
			<Footer />
		</>
	);
}

export default function App() {
	const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark-theme");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const timer = setTimeout(() => {
			setLoading(false);
		}, 2000);
		return () => clearTimeout(timer);
	}, []);

	// Apply theme to document body and save to localStorage
	useEffect(() => {
		document.body.className = theme;
		localStorage.setItem("theme", theme);
	}, [theme]);

	const toggleTheme = () => {
		setTheme((prevTheme) => (prevTheme === "light-theme" ? "dark-theme" : "light-theme"));
	};

	if (loading) {
		return <LoadingSpinner />;
	}

	return (
		<ThemeProvider value={{ theme, toggleTheme }}>
			<AuthProvider>
				<InstructorProvider>
					<MentorProvider>
						<Router>
							<ScrollToTop />
							<Toaster
								position="top-right"
								toastOptions={{
									duration: 3000,
									style: {
										background: '#1a1a1a',
										color: '#fff',
										border: '1px solid rgba(139, 92, 246, 0.3)',
									},
									success: {
										iconTheme: {
											primary: '#8b5cf6',
											secondary: '#fff',
										},
									},
									error: {
										iconTheme: {
											primary: '#ef4444',
											secondary: '#fff',
										},
									},
								}}
							/>
							<div className='min-h-screen'>
								<Routes>
									{/* Public Routes */}
									<Route
										path='/'
										element={
											<MainLayout>
												<LandingPage />
											</MainLayout>
										}
									/>
									<Route
										path='/login'
										element={<LoginPage />}
									/>
									<Route
										path='/signup'
										element={<SignupPage />}
									/>
									<Route
										path='/forgot-password'
										element={<ForgotPasswordPage />}
									/>
									<Route
										path='/about'
										element={
											<MainLayout>
												<AboutPage />
											</MainLayout>
										}
									/>
									<Route
										path='/contact'
										element={
											<MainLayout>
												<ContactPage />
											</MainLayout>
										}
									/>
									<Route
										path='/instructors'
										element={
											<MainLayout>
												<InstructorsPage />
											</MainLayout>
										}
									/>
									<Route
										path='/careers'
										element={
											<MainLayout>
												<CareersPage />
											</MainLayout>
										}
									/>

									{/* Course Routes */}
									<Route
										path='/courses'
										element={
											<CoursesLayout>
												<CoursesHomePage />
											</CoursesLayout>
										}
									/>
									<Route
										path='/free-courses'
										element={
											<CoursesLayout>
												<CoursesPage />
											</CoursesLayout>
										}
									/>
									<Route
										path='/courses/:id'
										element={
											<CoursesLayout>
												<CourseDetailPage />
											</CoursesLayout>
										}
									/>
									<Route
										path='/courses/agentic-ai-crash-course-page'
										element={
											<CoursesLayout>
												<AgenticAICrashCoursePage />
											</CoursesLayout>
										}
									/>
									<Route
										path='/courses/agentic-ai-pioneer-program'
										element={
											<CoursesLayout>
												<AgenticAIPioneerProgramPage />
											</CoursesLayout>
										}
									/>
									<Route
										path='/courses/dsa-machine-learning'
										element={
											<CoursesLayout>
												<DsaMlProgramPage />
											</CoursesLayout>
										}
									/>

									{/* New Course Details Route */}
									<Route
										path='/course-details/:courseId'
										element={<CourseDetailsPage />}
									/>

									{/* Protected User Routes */}
									<Route
										path='/my-learning'
										element={
											<CoursesLayout>
												<MyLearningPage />
											</CoursesLayout>
										}
									/>
									<Route
										path='/mentorships'
										element={
											<CoursesLayout>
												<MentorshipPage />
											</CoursesLayout>
										}
									/>
									<Route
										path='/mentorships/book'
										element={
											<CoursesLayout>
												<MentorshipBookingPage />
											</CoursesLayout>
										}
									/>
									<Route
										path='/my-mentorship-sessions'
										element={
											<CoursesLayout>
												<MyMentorshipSessionsPage />
											</CoursesLayout>
										}
									/>
									<Route
										path='/profile'
										element={
											<CoursesLayout>
												<ProfilePage />
											</CoursesLayout>
										}
									/>

									{/* Blog Routes */}
									<Route
										path='/blogs'
										element={
											<MainLayout>
												<BlogsPage />
											</MainLayout>
										}
									/>
									<Route
										path='/blogs/:slug'
										element={
											<MainLayout>
												<BlogDetailPage />
											</MainLayout>
										}
									/>

									{/* Project Pages */}
									<Route
										path='/projects/court-booker'
										element={
											<MainLayout>
												<CourtBookerPage />
											</MainLayout>
										}
									/>
									<Route
										path='/projects/ai-agent-avatar'
										element={
											<MainLayout>
												<AIAgentAvatarPage />
											</MainLayout>
										}
									/>
									<Route
										path='/projects/hvac-agent'
										element={
											<MainLayout>
												<HVACAgentPage />
											</MainLayout>
										}
									/>
									<Route
										path='/projects/ai-learning-platform'
										element={
											<MainLayout>
												<AILearningPlatformPage />
											</MainLayout>
										}
									/>

									{/* Admin Routes */}
									<Route path='/admin' element={<AdminLoginPage />} />
									<Route path='/admin/login' element={<AdminLoginPage />} />
									<Route path='/admin/dashboard' element={<AdminDashboard />} />
									<Route path='/admin/mentors' element={<AdminMentorManagement />} />
									<Route path='/admin/instructors' element={<AdminInstructorManagement />} />							<Route path='/admin/blogs' element={<AdminBlogManagement />} />											<Route path='/admin/assign-mentors' element={<AdminAssignMentors />} />
									<Route path='/admin/mentorships' element={<AdminMentorAssignments />} />
									<Route path='/admin/bookings' element={<AdminMentorshipBookings />} />
									<Route path='/admin/assign-instructors' element={<AdminAssignInstructors />} />
									<Route path='/admin/registrations' element={<AdminRegistrations />} />

									{/* Instructor Routes */}
									<Route
										path='/instructor'
										element={<InstructorLoginPage />}
									/>
									<Route
										path='/instructor/login'
										element={<InstructorLoginPage />}
									/>
									<Route
										path='/instructor/forgot-password'
										element={<InstructorForgotPasswordPage />}
									/>
									<Route
										path='/instructor/dashboard'
										element={<InstructorDashboard />}
									/>

									{/* Mentor Routes */}
									<Route
										path='/mentor/login'
										element={<MentorLoginPage />}
									/>
									<Route
										path='/mentor/forgot-password'
										element={<MentorForgotPasswordPage />}
									/>
									<Route
										path='/mentor/dashboard'
										element={<MentorDashboard />}
									/>
								</Routes>
							</div>
						</Router>
					</MentorProvider>
				</InstructorProvider>
			</AuthProvider>
		</ThemeProvider>
	);
}
