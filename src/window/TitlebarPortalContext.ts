import { createContext, type Dispatch, type SetStateAction } from "react";

// A native modal must contain the custom titlebar to keep window actions usable.
export const TitlebarPortalContext = createContext<{
	setContainer: Dispatch<SetStateAction<HTMLElement | null>>;
	height: string;
} | null>(null);
