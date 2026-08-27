import { motion, useScroll } from "framer-motion";
import { useRef } from "react";
import LiIcon from "./LiIcon";
import SectionHeading from "./SectionHeading";

const Details = ({ position, company, time, work }) => {
  const ref = useRef(null);
  return (
    <li
      ref={ref}
      className="relative my-8 first:mt-0 last:mb-0 w-[60%] mx-auto flex flex-col items-start justify-between md:w-[80%]"
    >
      <LiIcon reference={ref} />
      <motion.div
        initial={{ y: 50 }}
        whileInView={{ y: 0 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        <h3 className="capitalize font-bold text-2xl sm:text-xl xs:text-lg">
          {position} <span className="text-primary dark:text-primaryDark">@{company}</span>
        </h3>
        <span className="capitalize text-dark/75 font-medium dark:text-light/50 xs:text-sm">
          {time}
        </span>
        <div className="font-medium w-full md:text-sm mt-2">
          {work}
        </div>
      </motion.div>
    </li>
  );
};

const Internship = () => {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center start"],
    layoutEffect: false,
  });

  return (
    <div className="my-64">
      <div className="w-full flex justify-center mb-32 md:mb-16">
        <SectionHeading
          title="Internships"
          subTitle="PROFESSIONAL EXPERIENCE"
          theme="purple"
        />
      </div>

      <div ref={ref} className="relative w-[75%] mx-auto lg:w-[90%] md:w-full">
        <motion.div
          className="absolute left-9 top-0 w-[4px] md:w-[2px] md:left-[30px] xs:left-[20px] h-full bg-dark dark:bg-primaryDark origin-top"
          style={{ scaleY: scrollYProgress }}
        />
        <ul className="w-full flex flex-col items-start justify-between ml-4 xs:ml-2">
          <Details
            position="Backend Developer Intern"
            company="Kautilyam – IT Product & Services"
            time="May 2026 – Jun 2026"
            work={
              <ul className="list-disc ml-4 space-y-1">
                <li>Worked as a Software Engineer Intern (Backend Development), contributing to the design, development, and maintenance of scalable web applications.</li>
                <li>Implemented backend services, business logic, data-processing workflows, and database integrations.</li>
                <li>Collaborated with frontend developers and team members to deliver end-to-end software solutions.</li>
                <li>Worked with MongoDB databases for efficient data storage, retrieval, optimization, and management.</li>
                <li>Participated in software development lifecycle (SDLC) activities, including requirement analysis, development, testing, and deployment.</li>
                <li>Utilized Git for version control, code collaboration, and maintaining development workflows.</li>
                <li>Contributed to code reviews and followed software engineering best practices to ensure clean, maintainable, and production-ready code.</li>
                <li>Gained hands-on experience in backend architecture and deployment processes within a professional development environment.</li>
                <li className="list-none pt-2 -ml-4">
                  <span className="font-bold">Key Skills:</span> Java, Spring Boot, ReactJS, MongoDB, DSA, Backend Development
                </li>
              </ul>
            }
          />
        </ul>
      </div>
    </div>
  );
};

export default Internship;
