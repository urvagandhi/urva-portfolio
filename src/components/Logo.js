import { motion } from "framer-motion";
import Link from "next/link";

const MotionLink = motion.create(Link);

const Logo = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <MotionLink
        href="/"
        className="flex items-center justify-center rounded-full w-16 h-16 bg-dark text-white dark:border-2 dark:border-solid dark:border-light text-2xl font-bold"
        whileHover={{
          scale: 1.2,
          backgroundColor: [
            "#121212",
            "rgba(131,58,180,1)",
            "rgba(253,29,29,1)",
            "rgba(252,176,69,1)",
            "rgba(131,58,180,1)",
            "#121212",
          ],
          boxShadow: [
            "0px 0px 0px rgba(0,0,0,0)",
            "0px 0px 30px rgba(131,58,180,0.6)",
            "0px 0px 30px rgba(253,29,29,0.6)",
            "0px 0px 30px rgba(252,176,69,0.6)",
            "0px 0px 0px rgba(0,0,0,0)",
          ],
          transition: { duration: 1, repeat: Infinity },
        }}
      >
        UG
      </MotionLink>
    </div>
  );
};

export default Logo;
