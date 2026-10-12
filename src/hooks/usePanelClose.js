"use client";

import { createContext, useContext } from "react";

export const PanelCloseContext = createContext(null);

// Returns the animated "please close me" function for whichever Modal or
// SidePanel this component is rendered inside — call this from a close/
// cancel button in a Modal's or SidePanel's own content instead of calling
// the page's raw onClose prop directly, so that click plays the same exit
// transition Escape and a backdrop click already get, rather than
// unmounting the panel instantly out from under its own animation.
// Falls back to a no-op outside either (never throws).
export default function usePanelClose() {
  return useContext(PanelCloseContext) || (() => {});
}
