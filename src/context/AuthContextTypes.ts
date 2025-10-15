export interface User {
  _id: string;
  email: string;
  fullName: string;
  // Add other user fields as needed
}

export interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}