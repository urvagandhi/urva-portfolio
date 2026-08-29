import React from "react";

const Layout = ({ children, className = "" }) => {
  return (
    <div
      className={`block h-full w-full bg-transparent p-32 xl:p-24 lg:p-16 md:p-12 sm:p-8 xs:p-4 xs:py-6 ${className}`}
    >
      {children}
    </div>
  );
};

export default Layout;
