import { useEffect, useState } from "react";

export default function BackToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);

        return () =>
            window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <>
            {isVisible && (
                <button
                    onClick={scrollToTop}
                    className="
        fixed bottom-6 left-1/2 -translate-x-1/2
        z-50
        group
        px-4 py-3
        rounded-full
        bg-white/10
        backdrop-blur-md
        border border-white/20
        shadow-[0_8px_30px_rgba(0,0,0,0.3)]
        hover:bg-gradient-to-r
        hover:from-blue-500
        hover:to-purple-500
        hover:scale-110
        transition-all duration-300
    "
                >
                    <span
                        className="
            text-white
            text-xl
            font-bold
            flex items-center justify-center
            group-hover:-translate-y-1
            transition-transform duration-300
        "
                    >
                        ↑
                    </span>
                </button>


            )}
        </>
    );
}