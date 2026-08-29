import { motion, useReducedMotion } from "framer-motion";
import { Meteors } from "@/vendor/ui/meteors";
import { Particles } from "@/vendor/ui/particles";
import NotFoundShared from "./NotFoundShared";

const Meteors404 = () => {
  const reduce = useReducedMotion();
  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden text-center">
      {/* Meteor + particle backdrop (particles as faint white stardust) */}
      <div className="pointer-events-none absolute -inset-16 -z-10 sm:-inset-20">
        <Particles
          className="absolute inset-0"
          quantity={60}
          color="#ffffff"
          size={0.4}
        />
        <Meteors number={26} angle={200} minDuration={3} maxDuration={9} />
      </div>

      <motion.h1
        className="relative w-full select-none text-[7rem] font-extrabold leading-none tracking-tighter text-dark dark:text-light sm:text-8xl xs:text-7xl"
        initial={{ opacity: 0, scale: reduce ? 1 : 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.04 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        404
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="w-full"
      >
        <p className="mt-4 px-2 font-mono text-[10px] uppercase tracking-[0.25em] text-dark/50 dark:text-light/50 sm:text-xs sm:tracking-[0.3em]">
          Signal lost in a sea of pixels
        </p>
        <h2 className="mt-4 text-3xl font-semibold text-dark dark:text-light sm:text-2xl">
          This page fell out of orbit
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-lg text-dark/70 dark:text-light/70 sm:text-base">
          A meteor stole the route and left only stardust in its place — the
          pages below are still drifting in orbit.
        </p>
      </motion.div>

      <NotFoundShared showSearch />
    </div>
  );
};

export default Meteors404;
