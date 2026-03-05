export default function CareersPage() {
    return (
        <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] pt-24 px-6 flex flex-col items-center justify-center transition-colors duration-300">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] bg-clip-text text-transparent">
                Careers at Yuganta
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl text-center">
                We are always looking for passionate individuals to join our team.
                Currently, we don't have open positions listed here, but feel free to reach out to us at careers@yugantaai.com.
            </p>
        </div>
    );
}
