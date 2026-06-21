import { useEffect, useState } from "react";

export function useModalControls(isOpen, onClose) {
  const [canPortal, setCanPortal] = useState(false);

  // Check portal target availability
  useEffect(() => {
    setCanPortal(typeof document !== "undefined");
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close modal on escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  return { canPortal };
}

export default useModalControls;
