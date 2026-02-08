import Link from "next/link";

const CircularText = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 300 300"
        className={className}
    >
        <defs>
            <path
                id="circlePath"
                d="M 150, 150 m -120, 0 a 120,120 0 1,1 240,0 a 120,120 0 1,1 -240,0"
                fill="none"
            />
        </defs>
        <text fontSize="22" fontWeight="700" letterSpacing="3">
            <textPath href="#circlePath" startOffset="0%">
                FULL STACK DEVELOPER • FULL STACK DEVELOPER •
            </textPath>
        </text>
    </svg>
);

const HireMe = () => {
    return (
        <div className="fixed left-4 bottom-4 flex flex-col items-center justify-center overflow-hidden z-20 md:right-4 md:left-auto md:bottom-4 md:top-auto md:fixed sm:right-2">
            <div className="w-48 h-auto flex items-center justify-center relative md:w-24">
                <CircularText className="fill-dark dark:fill-light animate-spin-slow w-full h-auto" />
                <Link
                    href="mailto:urvagandhi24@gmail.com"
                    className="flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-dark text-light shadow-md border border-solid border-dark w-20 h-20 rounded-full font-semibold hover:bg-light hover:text-dark dark:bg-light dark:text-dark dark:hover:bg-dark dark:hover:text-light dark:hover:border-light md:w-12 md:h-12 md:text-[10px]"
                >
                    Hire Me
                </Link>
            </div>
        </div>
    );
};

export default HireMe;
