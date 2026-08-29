import { motion, useScroll, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import LiIcon from "./LiIcon";
import SectionHeading from "./SectionHeading";
import { Award, X } from "lucide-react";
import { useModalControls } from "@/components/hooks/useModalControls";

const Details = ({ position, company, companyLink, time, address, work, certificate, onViewCertificate }) => {
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
                <h3 className="capitalize font-bold text-2xl sm:text-xl xs:text-lg flex items-center gap-2 flex-wrap">
                    <span>{position}</span>{" "}
                    <a
                        className="capitalize text-primary dark:text-primaryDark"
                        href={companyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        @{company}
                    </a>
                    {certificate && (
                        <button
                            onClick={() => onViewCertificate(certificate, `${position} @ ${company}`)}
                            className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-solid border-rose-500/20 hover:bg-rose-500/20 transition-all duration-300 ml-2 cursor-pointer"
                        >
                            <Award className="w-3.5 h-3.5" /> View Certificate
                        </button>
                    )}
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
    const [activeCertificate, setActiveCertificate] = useState(null);

    const { canPortal } = useModalControls(
        !!activeCertificate,
        () => setActiveCertificate(null)
    );

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "center start"],
        layoutEffect: false,
    });

    const handleViewCertificate = (url, title) => {
        setActiveCertificate({ url, title });
    };

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
                        certificate="/images/certifications/Urva_Gandhi_HACKaMINed_Winner.png"
                        onViewCertificate={handleViewCertificate}
                    />

                    <Details
                        position="2nd Runner-Up"
                        company="Odoo × Gujarat Vidyapith Hackathon 2026"
                        companyLink="https://github.com/urvagandhi"
                        time="2026"
                        address="Gujarat, India"
                        work="Created a Product Lifecycle Management (PLM) solution integrated with Odoo. Won 2nd Runner-Up for demonstrating rapid backend development, ERP integration workflows, and clean database design."
                        certificate="/images/certifications/Urva_Gandhi_Second_Runners_Up_Odoo_x_GVP_26.png"
                        onViewCertificate={handleViewCertificate}
                    />

                    <Details
                        position="1st Place Winner"
                        company="RWEsearch & Health AI Innovation Hackathon 2025"
                        companyLink="https://github.com/urvagandhi/RWEsearch-Hackathon"
                        time="August 2025 - September 2025"
                        address="Remote"
                        work="Developed a healthcare analytics platform predicting hospital readmissions (30/60/90 days) and delivering cost + clinical insights. Ranked 1st Place among 140+ competing teams. Designed a Smart Model Loader for instant evaluation of ML models (Logistic Regression, Random Forest, XGBoost, Deep Learning). Developed an interactive Streamlit dashboard."
                        onViewCertificate={handleViewCertificate}
                    />

                    <Details
                        position="Round 2 Qualifier"
                        company="Adobe India 'Connecting the Dots' Hackathon 2025"
                        companyLink="https://github.com/urvagandhi/CTRL ALT Adobe-PS 1A"
                        time="July 2025"
                        address="Remote"
                        work="Participated in Adobe's 'Connecting the Dots' hackathon, qualifying for Round 2. Built an offline PDF Outline Extractor using heuristics on font size, boldness, and layout. Designed a persona-driven document intelligence pipeline with keyword filtering + semantic ranking. Optimized processing to <10s per 50-page PDF."
                        certificate="/images/certifications/Urva_Gandhi_Adobe.png"
                        onViewCertificate={handleViewCertificate}
                    />

                    <Details
                        position="Participant"
                        company="Smart India Hackathon 2024"
                        companyLink="https://www.sih.gov.in/"
                        time="2024"
                        address="India"
                        work="Participated with innovative AI-driven solutions for real-world problems. Gained experience in rapid prototyping and collaborative development under time constraints."
                        certificate="/images/certifications/Urva_Gandhi_SIH.png"
                        onViewCertificate={handleViewCertificate}
                    />
                </ul>
            </div>

            {canPortal && createPortal(
                <AnimatePresence>
                    {activeCertificate && (
                        <motion.div
                            key="certificate-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 cursor-default"
                        >
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                onMouseDown={() => setActiveCertificate(null)}
                                className="absolute inset-0 bg-dark/60 dark:bg-black/80 backdrop-blur-md"
                            />
                            {/* Background Decorative Glows */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="absolute inset-0 pointer-events-none overflow-hidden"
                            >
                                <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-rose-500/15 dark:bg-rose-500/10 blur-[100px]" />
                                <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-amber-500/10 dark:bg-amber-500/5 blur-[100px]" />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, rotateX: -5, y: 15 }}
                                animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, rotateX: 5, y: 15 }}
                                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                onMouseDown={(e) => e.stopPropagation()}
                                className="relative w-full max-w-4xl h-[80vh] bg-light/90 dark:bg-dark/90 backdrop-blur-xl border border-solid border-white/20 dark:border-white/5 shadow-[0_25px_50px_-12px_rgba(244,63,94,0.15)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] rounded-[2.5rem] overflow-hidden flex flex-col cursor-default"
                            >
                                {/* Top Decorative Border */}
                                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500" />

                                {/* Header */}
                                <div className="px-8 py-5 border-b border-solid border-dark/10 dark:border-light/10 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-gradient-to-br from-rose-500/10 to-amber-500/10 text-rose-500 dark:text-rose-400 border border-solid border-rose-500/20">
                                            <Award className="w-6 h-6 animate-pulse" />
                                        </div>
                                        <div className="flex flex-col">
                                            <h3 className="text-xl font-bold text-dark dark:text-light tracking-wide sm:text-base">
                                                {activeCertificate.title}
                                            </h3>
                                            <span className="text-xs font-semibold text-rose-500/80 dark:text-rose-400/80">
                                                Verified Achievement Certificate
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setActiveCertificate(null)}
                                        className="p-2.5 rounded-2xl bg-dark/5 dark:bg-light/5 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:bg-rose-500/20 dark:hover:text-rose-400 border border-solid border-transparent hover:border-rose-500/20 transition-all duration-300 cursor-pointer text-dark/75 dark:text-light/75"
                                        aria-label="Close certificate"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Image Container */}
                                <div className="flex-1 p-8 flex items-center justify-center min-h-0 bg-dark/5 dark:bg-black/20">
                                    <div className="relative max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl border border-solid border-white/30 dark:border-white/10 group">
                                        {/* Glass reflection shine */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
                                        
                                        <img
                                            src={activeCertificate.url}
                                            alt={activeCertificate.title}
                                            className="max-w-full max-h-[50vh] object-contain rounded-2xl transition-all duration-500 group-hover:scale-[1.01]"
                                        />
                                    </div>
                                </div>

                                {/* Action Footer */}
                                <div className="px-8 py-5 border-t border-solid border-dark/10 dark:border-light/10 flex items-center justify-between sm:flex-col sm:gap-4 sm:items-stretch bg-light/30 dark:bg-dark/30">
                                    <span className="text-xs font-bold text-dark/40 dark:text-light/40 tracking-wider uppercase">
                                        Hackathon Achievement Portal
                                    </span>
                                    <div className="flex items-center gap-3 sm:justify-end">
                                        <a
                                            href={activeCertificate.url.replace('.png', '.pdf')}
                                            download
                                            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white dark:text-dark dark:from-rose-400 dark:to-amber-400 dark:hover:from-rose-500 dark:hover:to-amber-500 font-extrabold text-sm transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-rose-500/20 hover:-translate-y-0.5 cursor-pointer"
                                        >
                                            Download PDF
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

export default Experience;
