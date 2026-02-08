import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import {
    GithubIcon,
    LinkedInIcon,
    MoonIcon,
    SunIcon,
    TwitterIcon,
    PinterestIcon,
    DribbbleIcon,
    LeetCodeIcon,
} from "./Icons";
import Logo from "./Logo";
import useThemeSwitcher from "./hooks/useThemeSwitcher";

const CustomLink = ({ href, title, className = "" }) => {
    const handleClick = (e) => {
        e.preventDefault();
        const element = document.querySelector(href);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <motion.a
            href={href}
            onClick={handleClick}
            className={`${className} relative group cursor-pointer text-base font-semibold tracking-wide
                text-dark/80 dark:text-light/80 hover:text-primary dark:hover:text-primaryDark
                transition-colors duration-300`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            {title}
            <span
                className={`absolute left-0 -bottom-1 h-[2px] w-0 bg-gradient-to-r from-primary via-purple-500 to-primaryDark
                    group-hover:w-full transition-all duration-300 ease-out rounded-full`}
            />
        </motion.a>
    );
};

const CustomMobileLink = ({ href, title, className = "", toggle }) => {
    const handleClick = () => {
        toggle();
        const element = document.querySelector(href);
        if (element) {
            setTimeout(() => {
                element.scrollIntoView({ behavior: "smooth" });
            }, 300);
        }
    };

    return (
        <motion.button
            onClick={handleClick}
            className={`${className} relative group text-light dark:text-dark my-3 text-lg font-semibold tracking-wide`}
            whileHover={{ scale: 1.1, x: 5 }}
            whileTap={{ scale: 0.95 }}
        >
            {title}
            <span
                className={`absolute left-0 -bottom-1 h-[2px] w-0 bg-gradient-to-r from-primaryDark via-cyan-400 to-primary
                    group-hover:w-full transition-all duration-300 ease-out rounded-full`}
            />
        </motion.button>
    );
};

const SocialIcon = ({ href, children, className = "" }) => (
    <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`w-6 ${className}`}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.9 }}
    >
        {children}
    </motion.a>
);

const NavBar = () => {
    const [mode, setMode] = useThemeSwitcher();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleClick = () => {
        setIsOpen(!isOpen);
    };

    return (
        <motion.header
            className={`w-full flex items-center justify-between px-32 font-medium z-50 dark:text-light
                lg:px-16 fixed top-0 left-0 md:px-12 sm:px-8 transition-all duration-500
                ${scrolled
                    ? 'py-4 bg-light/80 dark:bg-dark/80 backdrop-blur-xl shadow-lg shadow-dark/5 dark:shadow-light/5 border-b border-dark/5 dark:border-light/10'
                    : 'py-6 bg-light/60 dark:bg-dark/60 backdrop-blur-md'
                }`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            {/* Hamburger Menu Button */}
            <motion.button
                type="button"
                className="flex-col items-center justify-center hidden lg:flex p-2 rounded-lg
                    hover:bg-dark/5 dark:hover:bg-light/10 transition-colors duration-300"
                aria-controls="mobile-menu"
                aria-expanded={isOpen}
                onClick={handleClick}
                whileTap={{ scale: 0.9 }}
            >
                <span className="sr-only">Open main menu</span>
                <span
                    className={`bg-gradient-to-r from-primary to-primaryDark block h-0.5 w-6 rounded-full
                        transition-all duration-300 ease-out ${isOpen ? "rotate-45 translate-y-1.5" : "-translate-y-0.5"}`}
                />
                <span
                    className={`bg-gradient-to-r from-primary to-primaryDark block h-0.5 w-6 rounded-full
                        transition-all duration-300 ease-out my-1 ${isOpen ? "opacity-0 scale-0" : "opacity-100"}`}
                />
                <span
                    className={`bg-gradient-to-r from-primary to-primaryDark block h-0.5 w-6 rounded-full
                        transition-all duration-300 ease-out ${isOpen ? "-rotate-45 -translate-y-1.5" : "translate-y-0.5"}`}
                />
            </motion.button>

            {/* Desktop Navigation */}
            <div className="w-full flex justify-between items-center lg:hidden">
                <nav className="flex items-center justify-center gap-8">
                    <CustomLink href="#home" title="Home" />
                    <CustomLink href="#about" title="About" />
                    <CustomLink href="#projects" title="Projects" />
                </nav>

                <nav className="flex items-center justify-center gap-3" aria-label="Social media links">
                    <motion.a
                        href="https://x.com/urva_gandhi"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-6"
                        aria-label="Follow me on Twitter"
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <TwitterIcon />
                    </motion.a>
                    <motion.a
                        href="https://github.com/urvagandhi"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-6"
                        aria-label="View my GitHub profile"
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <GithubIcon />
                    </motion.a>
                    <motion.a
                        href="https://www.linkedin.com/in/urva-gandhi/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-6"
                        aria-label="Connect on LinkedIn"
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <LinkedInIcon />
                    </motion.a>
                    <motion.a
                        href="https://leetcode.com/Urva_Gandhi/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-6"
                        aria-label="See my LeetCode profile"
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <LeetCodeIcon />
                    </motion.a>

                    <button
                        type="button"
                        onClick={() => setMode(mode === "light" ? "dark" : "light")}
                        className={`w-6 h-6 ml-3 flex items-center justify-center rounded-full p-1 ease
                            ${mode === "light" ? "bg-dark text-light" : "bg-light text-dark"}`}
                        aria-label={mode === "light" ? "Switch to dark mode" : "Switch to light mode"}
                    >
                        {mode === "dark" ? (
                            <SunIcon className="fill-dark" />
                        ) : (
                            <MoonIcon className="fill-dark" />
                        )}
                    </button>
                </nav>
            </div>

            {/* Mobile Navigation Menu - Rendered via Portal to escape Header's transform context */}
            {isOpen && typeof document !== 'undefined' ? createPortal(
                <motion.div
                    className="fixed inset-0 z-40 bg-dark/50 dark:bg-light/20 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleClick}
                />,
                document.body
            ) : null}

            {isOpen && typeof document !== 'undefined' ? createPortal(
                <motion.div
                    className="fixed top-1/2 left-1/2 z-50 flex flex-col justify-between items-center bg-dark/90 dark:bg-light/75 rounded-2xl backdrop-blur-md py-20 min-w-[70vw] sm:min-w-[90vw] shadow-2xl border border-light/10 dark:border-dark/10"
                    initial={{ scale: 0.5, opacity: 0, x: "-50%", y: "-50%" }}
                    animate={{ scale: 1, opacity: 1, x: "-50%", y: "-50%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                >
                    <nav className="flex items-center flex-col justify-center">
                        <CustomMobileLink href="#home" title="Home" className="" toggle={handleClick} />
                        <CustomMobileLink href="#about" title="About" className="" toggle={handleClick} />
                        <CustomMobileLink href="#projects" title="Projects" className="" toggle={handleClick} />
                    </nav>

                    <nav className="flex items-center justify-center flex-wrap mt-6" aria-label="Social media links">
                        <motion.a
                            href="https://x.com/urva_gandhi"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-6 mr-3 sm:mx-1"
                            aria-label="Follow me on Twitter"
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <TwitterIcon />
                        </motion.a>
                        <motion.a
                            href="https://github.com/urvagandhi"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-6 mx-3 bg-light rounded-full dark:bg-dark sm:mx-1"
                            aria-label="View my GitHub profile"
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <GithubIcon />
                        </motion.a>
                        <motion.a
                            href="https://www.linkedin.com/in/urva-gandhi/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-6 mx-3 sm:mx-1"
                            aria-label="Connect on LinkedIn"
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <LinkedInIcon />
                        </motion.a>
                        <motion.a
                            href="https://leetcode.com/Urva_Gandhi/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-6 mx-3 sm:mx-1"
                            aria-label="See my LeetCode profile"
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <LeetCodeIcon />
                        </motion.a>

                        <button
                            type="button"
                            onClick={() => setMode(mode === "light" ? "dark" : "light")}
                            className={`ml-3 flex items-center justify-center rounded-full p-1
                            ${mode === "light" ? "bg-dark text-light" : "bg-light text-dark"}
                            `}
                            aria-label={mode === "light" ? "Switch to dark mode" : "Switch to light mode"}
                        >
                            {
                                mode === "dark" ?
                                    <SunIcon className={"fill-dark"} />
                                    : <MoonIcon className={"fill-dark"} />
                            }
                        </button>
                    </nav>
                </motion.div>,
                document.body
            ) : null}

            {/* Centered Logo */}
            <motion.div
                className="absolute left-1/2 top-1/2"
                initial={{ scale: 0, x: "-50%", y: "-50%" }}
                animate={{ 
                    scale: scrolled ? 0.8 : 1, 
                    x: "-50%", 
                    y: "-50%",
                    transition: { duration: 0.3 }
                }}
                transition={{ delay: 0.2, type: "spring", damping: 15 }}
            >
                <Logo />
            </motion.div>
        </motion.header>
    );
};

export default NavBar;
