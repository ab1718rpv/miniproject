import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/global-store.jsx";
import "../styles/rolechoose.css";
import { User } from 'lucide-react';
import { Users } from 'lucide-react';
import { UserRound } from 'lucide-react';


function RoleSelection() {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const { mutate } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to log out");
        return data;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    onSuccess: () => {
      logout();
      navigate("/login");
    },
  });

  return (
    <div className="role-container">
      <button className="logout-btn" onClick={mutate}><User/></button>
      <h1 className="role-heading">Decide Your Role, Define the Game!</h1>
      <div className="role-buttons">
        <button className="role-btn admin-btn" onClick={() => navigate("/Admin")}>
        <UserRound/>Admin
          <span className="role-text">Create An Auction</span>
        </button>
        <button className="role-btn user-btn" onClick={() => navigate("/users")}>
        <Users/> User
          <span className="role-text">Join In An Auction</span>
        </button>
      </div>
    </div>
  );
}

export default RoleSelection;
