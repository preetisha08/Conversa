import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("chatUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (userData, token) => {
    localStorage.setItem("chatUser", JSON.stringify(userData));
    localStorage.setItem("chatToken", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("chatUser");
    localStorage.removeItem("chatToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
