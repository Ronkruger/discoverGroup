import { useContext } from "react";
import { AuthContext } from "./AuthContextInstance";
import type { AuthContextType } from "./AuthContextTypes";

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}