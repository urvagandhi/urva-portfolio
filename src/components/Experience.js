import { motion, useScroll } from "framer-motion";
import { useRef } from "react";
import LiIcon from "./LiIcon";
import SectionHeading from "./SectionHeading";

const Details = ({ position, company, companyLink, time, address, work }) => {
    const ref = useRef(null);
    return (
        <li
            ref={ref}
            className="my-8 first:mt-0 last:mb-0 w-[60%] mx-auto flex flex-col items-start justify-between md:w-[80%]"
        >
            <LiIcon reference={ref} />
            <motion.div
                initial={{ y: 50 }}
                whileInView={{ y: 0 }}
                transition={{ duration: 0.5, type: "spring" }}
            >
                <h3 className="capitalize font-bold text-2xl sm:text-xl xs:text-lg">
                    {position}{" "}
                    <a
                        className="capitalize text-primary dark:text-primaryDark"
                        href={companyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        @{company}
                    </a>
                </h3>
                <span className="capitalize text-dark/75 font-medium dark:text-light/50 xs:text-sm">
                    {time} | {address}
                </span>
                <p className="font-medium w-full md:text-sm">{work}</p>
            </motion.div>
        </li>
    );
};

const Experience = () => {
    const ref = useRef(null);

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "center start"],
    });

    return (
        <div className="my-64">
            <div className="w-full flex justify-center mb-32 md:mb-16">
                <SectionHeading title="Hackathons" subTitle="ACHIEVEMENTS" theme="rose" />
            </div>

            <div ref={ref} className="relative w-[75%] mx-auto lg:w-[90%] md:w-full">
                <motion.div
                    className="absolute left-9 top-0 w-[4px] md:w-[2px] md:left-[30px] xs:left-[20px] h-full bg-dark dark:bg-primaryDark origin-top"
                    style={{ scaleY: scrollYProgress }}
                />
                <ul className="w-full flex flex-col items-start justify-between ml-4 xs:ml-2">
                    <Details
                        position="Track Runner-Up"
                        company="HACKaMINeD 2026"
                        companyLink="https://github.com/urvagandhi"
                        time="2026"
                        address="Remote"
                        work="Developed 'Agent PaperPal', an advanced AI research assistant project. Secured Track Runner-Up out of 400+ teams and 2300+ registrations. Implemented agentic workflows to streamline academic paper analysis, semantic citation mapping, and interactive querying."
                    />

                    <Details
                        position="2nd Runner-Up"
                        company="Odoo × Gujarat Vidyapith Hackathon 2026"
                        companyLink="https://github.com/urvagandhi"
                        time="2026"
                        address="Gujarat, India"
                        work="Created a Product Lifecycle Management (PLM) solution integrated with Odoo. Won 2nd Runner-Up for demonstrating rapid backend development, ERP integration workflows, and clean database design."
                    />

                    <Details
                        position="1st Place Winner"
                        company="RWEsearch & Health AI Innovation Hackathon 2025"
                        companyLink="https://github.com/urvagandhi/RWEsearch-Hackathon"
                        time="August 2025 - September 2025"
                        address="Remote"
                        work="Developed a healthcare analytics platform predicting hospital readmissions (30/60/90 days) and delivering cost + clinical insights. Ranked 1st Place among 140+ competing teams. Designed a Smart Model Loader for instant evaluation of ML models (Logistic Regression, Random Forest, XGBoost, Deep Learning). Developed an interactive Streamlit dashboard."
                    />

                    <Details
                        position="Round 2 Qualifier"
                        company="Adobe India 'Connecting the Dots' Hackathon 2025"
                        companyLink="https://github.com/urvagandhi/CTRL ALT Adobe-PS 1A"
                        time="July 2025"
                        address="Remote"
                        work="Participated in Adobe's 'Connecting the Dots' hackathon, qualifying for Round 2. Built an offline PDF Outline Extractor using heuristics on font size, boldness, and layout. Designed a persona-driven document intelligence pipeline with keyword filtering + semantic ranking. Optimized processing to <10s per 50-page PDF."
                    />

                    <Details
                        position="Participant"
                        company="Smart India Hackathon 2024"
                        companyLink="https://www.sih.gov.in/"
                        time="2024"
                        address="India"
                        work="Participated with innovative AI-driven solutions for real-world problems. Gained experience in rapid prototyping and collaborative development under time constraints."
                    />
                </ul>
            </div>
        </div>
    );
};

export default Experience;
