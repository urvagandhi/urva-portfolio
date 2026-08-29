import React from "react";
import {
  CursorProvider,
  Cursor,
  CursorFollow,
} from "@/vendor/animate-ui/components/animate/cursor";

export default function CustomCursor() {
  return (
    <div className="block md:hidden">
      <CursorProvider global>
        <Cursor className="text-primary dark:text-primaryDark" />
        <CursorFollow side="bottom" sideOffset={15} align="end" alignOffset={5}>
          Developer
        </CursorFollow>
      </CursorProvider>
    </div>
  );
}
