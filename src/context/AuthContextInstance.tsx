import { createContext } from "react";
import type { AuthContextType } from "./AuthContextTypes";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);