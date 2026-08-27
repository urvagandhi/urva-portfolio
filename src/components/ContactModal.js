import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useContactModal } from "@/context/ContactModalContext";
import { useModalControls } from "./hooks/useModalControls";
import { BorderBeam } from "@/components/magicui/border-beam";
import Link from "next/link";
import { 
  X, 
  Mail, 
  ExternalLink, 
  MessageSquare, 
  Send, 
  User, 
  Building2, 
  CheckCircle2, 
  Loader2, 
  ArrowLeft, 
  Briefcase,
  Copy,
  Check,
  Zap,
  Tag
} from "lucide-react";

const INQUIRY_TYPES = [
  { id: "Engineering Role", label: "Engineering Role" },
  { id: "Project Proposal", label: "Project Proposal" },
  { id: "AI Collaboration", label: "AI Collaboration" },
  { id: "General Inquiry", label: "General Inquiry" },
];

const ContactModal = () => {
  const { isOpen, closeContactModal } = useContactModal();
  const { canPortal } = useModalControls(isOpen, closeContactModal);

  const [step, setStep] = useState("bento"); // "bento" | "form" | "success"
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: INQUIRY_TYPES[0].label,
    company: "",
    message: "",
  });

  // Reset modal state on open/close
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep("bento");
        setErrorMsg("");
        setSubmitting(false);
        setCopiedEmail(false);
        setFormData({
          name: "",
          email: "",
          subject: INQUIRY_TYPES[0].label,
          company: "",
          message: "",
        });
      }, 300);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const copyEmailToClipboard = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText("urvagandhi24@gmail.com");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleDirectEmail = () => {
    const mailtoUrl = `mailto:urvagandhi24@gmail.com?subject=Inquiry%20regarding%20Software%20/%20AI%20Engineering&body=Hi%20Urva,%0A%0AI%20am%20reaching%20out%20to%20discuss...`;
    window.location.href = mailtoUrl;
    closeContactModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMsg("Please fill out your Name, Email, and Message.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStep("success");
      } else {
        setErrorMsg(data.error || "Failed to send message. Please try direct email.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      setErrorMsg("Network error occurred. Please try direct email.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !canPortal) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto">
        {/* Backdrop overlay */}
        <motion.div
          className="fixed inset-0 bg-dark/80 dark:bg-dark/90 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeContactModal}
        />

        {/* Modal Container — WIDER (max-w-2xl = 672px) */}
        <motion.div
          className="relative w-full max-w-2xl rounded-3xl border border-dark/15 dark:border-light/15 bg-light dark:bg-dark p-6 sm:p-8 md:p-10 shadow-2xl backdrop-blur-xl z-10 overflow-hidden text-dark dark:text-light transition-all"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 250 }}
        >
          <BorderBeam size={280} duration={10} delay={3} colorFrom="#58E6D9" colorTo="#8B5CF6" />

          {/* Top Bar Header with Segmented Navigation & Close X Button */}
          <div className="flex items-center justify-between border-b border-dark/10 dark:border-light/10 pb-4 mb-6 pr-12">
            {/* Segmented Mode Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-dark/5 dark:bg-light/10 border border-dark/10 dark:border-light/10">
              <button
                type="button"
                onClick={() => setStep("bento")}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  step === "bento"
                    ? "bg-white dark:bg-dark text-primary dark:text-primaryDark shadow-sm"
                    : "text-dark/60 dark:text-light/60 hover:text-dark dark:hover:text-light"
                }`}
              >
                Quick Connect
              </button>
              <button
                type="button"
                onClick={() => setStep("form")}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  step === "form"
                    ? "bg-white dark:bg-dark text-primary dark:text-primaryDark shadow-sm"
                    : "text-dark/60 dark:text-light/60 hover:text-dark dark:hover:text-light"
                }`}
              >
                Detailed Form
              </button>
            </div>

            {/* Absolute Close X Button */}
            <button
              onClick={closeContactModal}
              className="absolute top-5 right-5 sm:top-6 sm:right-6 z-20 p-2.5 rounded-full bg-dark/5 dark:bg-light/10 hover:bg-dark/10 dark:hover:bg-light/20 text-dark/70 dark:text-light/70 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* STEP 1: BENTO SELECTION SCREEN */}
          {step === "bento" && (
            <div className="flex flex-col gap-6 pr-4 sm:pr-8">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-primary/10 dark:bg-primaryDark/20 text-primary dark:text-primaryDark text-xs font-extrabold uppercase tracking-wider border border-primary/20 dark:border-primaryDark/30">
                    Contact &amp; Communications
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-dark dark:text-light tracking-tight">
                  Reach Out to Urva Gandhi
                </h3>
                <p className="text-xs sm:text-sm text-dark/70 dark:text-light/70">
                  Select your preferred channel to connect regarding roles or proposals.
                </p>
              </div>

              {/* Bento Card 1: Direct Email with One-Click Copy */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="group relative rounded-2xl border border-dark/15 dark:border-light/15 bg-white dark:bg-dark/60 p-6 shadow-sm hover:border-primary dark:hover:border-primaryDark transition-all duration-300 flex flex-col gap-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3.5 rounded-xl bg-primary/10 text-primary dark:bg-primaryDark/20 dark:text-primaryDark">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-dark dark:text-light">
                        Send Direct Email
                      </h4>
                      <span className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        urvagandhi24@gmail.com
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Instant Mail</span>
                  </span>
                </div>

                {/* Quick Buttons inside Card 1 */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleDirectEmail}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-dark text-light dark:bg-primaryDark dark:text-dark font-bold text-xs sm:text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <span>Launch Mail App</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>

                  <button
                    onClick={copyEmailToClipboard}
                    className="py-2.5 px-4 rounded-xl border border-dark/15 dark:border-light/15 bg-dark/5 dark:bg-light/10 text-dark dark:text-light font-bold text-xs sm:text-sm hover:bg-dark/10 dark:hover:bg-light/20 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    title="Copy Email Address"
                  >
                    {copiedEmail ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span className="text-emerald-500">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Email</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Bento Card 2: Fill Details Here Form Switch */}
              <motion.div
                onClick={() => setStep("form")}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="group relative cursor-pointer rounded-2xl border border-dark/15 dark:border-light/15 bg-white dark:bg-dark/60 p-6 shadow-sm hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-300 flex items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3.5 rounded-xl bg-purple-500/10 text-purple-500 dark:bg-purple-500/20 dark:text-purple-400 group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-base text-dark dark:text-light">
                        Fill Details Here
                      </h4>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                        Interactive Form
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-dark/60 dark:text-light/60 mt-1">
                      Submit a structured inquiry directly through the portfolio server.
                    </p>
                  </div>
                </div>
                <Send className="w-5 h-5 text-dark/40 dark:text-light/40 group-hover:text-purple-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </motion.div>
            </div>
          )}

          {/* STEP 2: INTERACTIVE FORM SCREEN */}
          {step === "form" && (
            <div className="flex flex-col gap-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-dark dark:text-light flex items-center gap-1.5 text-xs">
                      <User className="w-3.5 h-3.5 text-primary dark:text-primaryDark" />
                      <span>Your Name *</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. John Doe"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-dark/20 dark:border-light/20 bg-white dark:bg-dark/80 text-dark dark:text-light placeholder:text-dark/40 dark:placeholder:text-light/40 focus:outline-none focus:border-primary dark:focus:border-primaryDark focus:ring-2 focus:ring-primary/20 dark:focus:ring-primaryDark/30 transition-all text-xs sm:text-sm font-medium shadow-sm"
                    />
                  </div>

                  {/* Email Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-dark dark:text-light flex items-center gap-1.5 text-xs">
                      <Mail className="w-3.5 h-3.5 text-primary dark:text-primaryDark" />
                      <span>Your Email *</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. john@company.com"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-dark/20 dark:border-light/20 bg-white dark:bg-dark/80 text-dark dark:text-light placeholder:text-dark/40 dark:placeholder:text-light/40 focus:outline-none focus:border-primary dark:focus:border-primaryDark focus:ring-2 focus:ring-primary/20 dark:focus:ring-primaryDark/30 transition-all text-xs sm:text-sm font-medium shadow-sm"
                    />
                  </div>
                </div>

                {/* Inquiry Category Quick Pills */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-dark dark:text-light flex items-center gap-1.5 text-xs">
                    <Briefcase className="w-3.5 h-3.5 text-primary dark:text-primaryDark" />
                    <span>Category Quick Select</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {INQUIRY_TYPES.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, subject: type.label }))}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-center truncate cursor-pointer ${
                          formData.subject === type.label
                            ? "border-primary dark:border-primaryDark bg-primary/10 dark:bg-primaryDark/20 text-primary dark:text-primaryDark font-extrabold shadow-sm ring-1 ring-primary/30"
                            : "border-dark/15 dark:border-light/15 bg-white dark:bg-dark/80 text-dark/70 dark:text-light/70 hover:border-primary/40"
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dynamic Subject / Title Field */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-dark dark:text-light flex items-center gap-1.5 text-xs">
                    <Tag className="w-3.5 h-3.5 text-primary dark:text-primaryDark" />
                    <span>Inquiry Subject / Title *</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="e.g. Hiring Senior Full Stack Engineer"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-dark/20 dark:border-light/20 bg-white dark:bg-dark/80 text-dark dark:text-light placeholder:text-dark/40 dark:placeholder:text-light/40 focus:outline-none focus:border-primary dark:focus:border-primaryDark focus:ring-2 focus:ring-primary/20 dark:focus:ring-primaryDark/30 transition-all text-xs sm:text-sm font-medium shadow-sm"
                  />
                </div>

                {/* Company / Org (Optional) */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-dark dark:text-light flex items-center gap-1.5 text-xs">
                    <Building2 className="w-3.5 h-3.5 text-primary dark:text-primaryDark" />
                    <span>Company / Organization (Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="e.g. Google, Tech Startup"
                    className="w-full px-4 py-3 rounded-xl border border-dark/20 dark:border-light/20 bg-white dark:bg-dark/80 text-dark dark:text-light placeholder:text-dark/40 dark:placeholder:text-light/40 focus:outline-none focus:border-primary dark:focus:border-primaryDark transition-all text-xs sm:text-sm font-medium shadow-sm"
                  />
                </div>

                {/* Message Details with Live Character Counter */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-dark dark:text-light flex items-center gap-1.5 text-xs">
                      <MessageSquare className="w-3.5 h-3.5 text-primary dark:text-primaryDark" />
                      <span>Message Details *</span>
                    </label>
                    <span className="text-xs font-medium text-dark/50 dark:text-light/50">
                      {formData.message.length} / 500
                    </span>
                  </div>
                  <textarea
                    name="message"
                    rows={4}
                    maxLength={500}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Describe your proposal, engineering role, or questions..."
                    required
                    className="w-full px-4 py-3 rounded-xl border border-dark/20 dark:border-light/20 bg-white dark:bg-dark/80 text-dark dark:text-light placeholder:text-dark/40 dark:placeholder:text-light/40 focus:outline-none focus:border-primary dark:focus:border-primaryDark focus:ring-2 focus:ring-primary/20 dark:focus:ring-primaryDark/30 transition-all text-xs sm:text-sm font-medium resize-none shadow-sm"
                  />
                </div>

                {/* Action Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-2 w-full py-3.5 rounded-xl bg-dark text-light dark:bg-primaryDark dark:text-dark font-bold text-xs sm:text-sm hover:opacity-95 disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Formatting &amp; Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Message to Urva Gandhi</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 3: SUCCESS DELIVERED SCREEN */}
          {step === "success" && (
            <div className="flex flex-col items-center justify-center text-center py-8 gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="flex flex-col gap-1.5 items-center">
                <h3 className="text-2xl font-extrabold text-dark dark:text-light">
                  Message Delivered!
                </h3>
                <p className="text-xs sm:text-sm text-dark/70 dark:text-light/70 max-w-sm leading-relaxed">
                  Thank you for reaching out! Your inquiry has been formatted and delivered to <strong>urvagandhi24@gmail.com</strong>.
                </p>
              </div>

              <button
                onClick={closeContactModal}
                className="mt-2 px-8 py-3 rounded-xl bg-dark text-light dark:bg-light dark:text-dark font-bold text-xs sm:text-sm hover:opacity-90 transition-opacity shadow-md cursor-pointer"
              >
                Close Window
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default ContactModal;
