import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const Skill = ({ name, x, y, lg, md, sm, xs, color = "default" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.1 });
  const [position, setPosition] = useState({ x, y });

  useEffect(() => {
    let timeoutId = null;
    
    const handleResize = () => {
      // Debounce resize calculations
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        if (window.innerWidth < 480 && xs) {
          setPosition(xs);
        } else if (window.innerWidth < 768 && sm) {
          setPosition(sm);
        } else if (window.innerWidth < 1024 && md) {
          setPosition(md);
        } else if (window.innerWidth < 1280 && lg) {
          setPosition(lg);
        } else {
          setPosition({ x, y });
        }
      }, 150); // Debounce by 150ms
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      window.removeEventListener("resize", handleResize);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [x, y, lg, md, sm, xs]);
  
  const colorClasses = {
    default: "bg-dark dark:bg-light",
    language: "bg-gradient-to-r from-purple-600 to-pink-500",
    backend: "bg-gradient-to-r from-emerald-500 to-teal-500",
    frontend: "bg-gradient-to-r from-blue-500 to-cyan-400",
    database: "bg-gradient-to-r from-orange-500 to-amber-400",
    ml: "bg-gradient-to-r from-rose-500 to-red-500",
    devops: "bg-gradient-to-r from-indigo-500 to-violet-500",
  };

  return (
    <motion.div
      ref={ref}
      className={`absolute flex cursor-pointer items-center justify-center rounded-full ${colorClasses[color]} px-6 py-3 font-semibold text-light shadow-lg backdrop-blur-sm lg:px-4 lg:py-2 md:px-3 md:py-1.5 md:text-sm xs:px-2 xs:py-1 xs:text-xs z-10 will-change-transform hover:scale-110 transition-transform duration-300`}
      whileHover={{ 
        scale: 1.1
      }}
      initial={{ x: 0, y: 0, opacity: 0 }}
      animate={isInView ? { 
        x: position.x, 
        y: position.y, 
        opacity: 1,
      } : { x: 0, y: 0, opacity: 0 }}
      transition={{ 
        duration: 1.5, 
        type: "spring", 
        stiffness: 50,
        damping: 20
      }}
    >
      {name}
    </motion.div>
  );
};

const Skills = () => {
  return (
    <>
      <motion.h2 
        className="mt-64 w-full text-center text-8xl font-bold md:mt-32 md:text-6xl xs:text-4xl"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        Skills
      </motion.h2>
      
      {/* Legend */}
      <motion.div 
        className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm md:text-xs"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        viewport={{ once: true }}
      >
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-500"></span>
          Languages
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"></span>
          Backend
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"></span>
          Frontend
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-400"></span>
          Database
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-gradient-to-r from-rose-500 to-red-500"></span>
          ML & AI
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"></span>
          DevOps
        </span>
      </motion.div>

      <div className="relative flex h-screen w-full items-center justify-center rounded-full bg-circularLight dark:bg-circularDark lg:h-[80vh] sm:h-[60vh] xs:h-[50vh] lg:bg-circularLightLg lg:dark:bg-circularDarkLg md:bg-circularLightMd md:dark:bg-circularDarkMd sm:bg-circularLightSm sm:dark:bg-circularDarkSm mb-64 md:mb-32">
        
        {/* Center - Pulsing */}
        <motion.div
          className="flex cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-dark via-gray-800 to-dark p-8 font-bold text-light shadow-2xl dark:from-light dark:via-gray-200 dark:to-light dark:text-dark lg:p-6 md:p-4 xs:p-2 xs:text-xs z-20 will-change-transform"
          whileHover={{ scale: 1.1 }}
          style={{
            boxShadow: "0 0 30px rgba(88, 230, 217, 0.4)"
          }}
        >
          Full-Stack
        </motion.div>

        {/* Languages & Core - Adjusted for Mobile (Using vh/vw mixing for better spread) */}
        <Skill name="Java" x="-20vw" y="2vw" 
          md={{ x: "-18vw", y: "2vw" }} 
          sm={{ x: "-25vw", y: "0vw" }}
          xs={{ x: "-30vw", y: "-5vw" }} // Spread out horizontally
          color="language" 
        />
        <Skill name="Python" x="-5vw" y="-10vw" 
          md={{ x: "-5vw", y: "-10vw" }}
          sm={{ x: "0vw", y: "-20vw" }} 
          xs={{ x: "0vw", y: "-28vw" }} // Move up
          color="language" 
        />
        <Skill name="JavaScript" x="20vw" y="0vw" 
          md={{ x: "18vw", y: "0vw" }}
          sm={{ x: "25vw", y: "-5vw" }} 
          xs={{ x: "30vw", y: "5vw" }} // Spread out right
          color="language" 
        />
        <Skill name="SQL" x="0vw" y="12vw" 
          md={{ x: "0vw", y: "12vw" }}
          sm={{ x: "0vw", y: "20vw" }} 
          xs={{ x: "0vw", y: "28vw" }} // Move down
          color="language" 
        />

        {/* Backend - Outer Ring 1 */}
        <Skill name="Spring Boot" x="15vw" y="-12vw" 
          md={{ x: "15vw", y: "-10vw" }}
          sm={{ x: "20vw", y: "-15vw" }}
          xs={{ x: "25vw", y: "-20vw" }} 
          color="backend" 
        />
        <Skill name="REST APIs" x="-10vw" y="15vw" 
          md={{ x: "-10vw", y: "12vw" }}
          sm={{ x: "-15vw", y: "18vw" }}
          xs={{ x: "-25vw", y: "25vw" }}
          color="backend" 
        />
        <Skill name="Node.js" x="-25vw" y="-10vw" 
          md={{ x: "-22vw", y: "-8vw" }}
          sm={{ x: "-28vw", y: "-12vw" }}
          xs={{ x: "-35vw", y: "-15vw" }}
          color="backend" 
        />

        {/* Frontend - Outer Ring 2 */}
        <Skill name="React.js" x="0vw" y="-20vw" 
          md={{ x: "0vw", y: "-18vw" }}
          sm={{ x: "-15vw", y: "-25vw" }}
          xs={{ x: "-15vw", y: "-35vw" }}
          color="frontend" 
        />
        <Skill name="Next.js" x="-20vw" y="-18vw" 
          md={{ x: "-18vw", y: "-16vw" }}
          sm={{ x: "-25vw", y: "-22vw" }}
          xs={{ x: "-35vw", y: "-30vw" }}
          color="frontend" 
        />
        <Skill name="Tailwind CSS" x="10vw" y="18vw" 
          md={{ x: "10vw", y: "15vw" }}
          sm={{ x: "20vw", y: "25vw" }}
          xs={{ x: "20vw", y: "38vw" }}
          color="frontend" 
        />

        {/* Databases - Outer Ring 3 */}
        <Skill name="PostgreSQL" x="28vw" y="10vw" 
          md={{ x: "25vw", y: "8vw" }}
          sm={{ x: "28vw", y: "10vw" }}
          xs={{ x: "13vw", y: "41vw" }}
          color="database" 
        />
        <Skill name="MongoDB" x="32vw" y="-9vw" 
          md={{ x: "28vw", y: "-8vw" }}
          sm={{ x: "28vw", y: "-10vw" }}
          xs={{ x: "20vw", y: "15vw" }}
          color="database" 
        />

        {/* ML & AI - Outer Ring 4 (Corners) */}
        <Skill name="TensorFlow" x="-35vw" y="-3vw" 
          md={{ x: "-30vw", y: "-2vw" }}
          sm={{ x: "-35vw", y: "-5vw" }}
          xs={{ x: "-38vw", y: "10vw" }}
          color="ml" 
        />
        <Skill name="Scikit-learn" x="35vw" y="0vw" 
          md={{ x: "32vw", y: "0vw" }}
          sm={{ x: "35vw", y: "5vw" }}
          xs={{ x: "20vw", y: "-40vw" }}
          color="ml" 
        />
        <Skill name="XGBoost" x="20vw" y="-20vw" 
          md={{ x: "18vw", y: "-18vw" }}
          sm={{ x: "25vw", y: "-28vw" }}
          xs={{ x: "15vw", y: "-45vw" }}
          color="ml" 
        />

        {/* DevOps & Tools - Outer Edges */}
        <Skill name="Docker" x="-26vw" y="10vw" 
          md={{ x: "-24vw", y: "8vw" }}
          sm={{ x: "-30vw", y: "15vw" }}
          xs={{ x: "-38vw", y: "28vw" }}
          color="devops" 
        />
        <Skill name="Git" x="12vw" y="10vw" 
          md={{ x: "10vw", y: "8vw" }}
          sm={{ x: "15vw", y: "12vw" }}
          xs={{ x: "-15vw", y: "35vw" }}
          color="devops" 
        />
      </div>
    </>
  );
};

export default Skills;
