import "../styles/Auctionsuccess.css";
import { useState,useEffect } from "react";
import { useAuthStore } from "../store/global-store.jsx";
import { useMutation } from "@tanstack/react-query";
import socket from "../store/socketglobal.jsx"
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "./common/LoadingSpinner"; 
import { toast } from "react-toastify";

function StartAuction() {
  const Navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [showPlayers, setShowPlayers] = useState(false);
  const auctionCode = useAuthStore((state) => state.auctionCode);
  useEffect(() => {
    socket.on("updateTeams", ({ teams }) => {
      console.log("Received updated teams:", teams);
      setTeams(teams); // Update the state with received teams
    });

    socket.on("Teamrequest", ({ teamName,username,auctionCode}) => {
      console.log("Received Teamrequest:", teamName);
      const toastId = toast.info(
        <div>
          <strong>{username}</strong> wants to join as <strong>{teamName}</strong>
          <div style={{ marginTop: "10px" }}>
            <button
              onClick={() => {
                socket.emit("teamapproved", { teamName, auctionCode });
                toast.dismiss(toastId);
                toast.success(`${teamName} has been approved`);
              }}
              style={{ marginRight: "10px" }}
            >
              Accept
            </button>
            <button
              onClick={() => {
                socket.emit("teamrejected", { teamName, auctionCode });
                toast.dismiss(toastId);
                toast.error(`${teamName} has been rejected`);
              }}
            >
              Reject
            </button>
          </div>
        </div>,
        { autoClose: false, closeOnClick: false }
      );
    });
  
    return () => {
      socket.off("updateTeams");
      socket.off("Teamrequest");
    };
  }, []);



  const fetchPlayers = async () => {
    const res = await fetch(`/api/auction/fetchPlayers/${auctionCode}`, {
      method: "GET",
      credentials: "include", // Include credentials
    });
    if (!res.ok) throw new Error("Failed to fetch players");
    return res.json();
  };

  const { mutate:fetchingplayer, isLoading, isError, error } = useMutation({
    mutationFn: fetchPlayers,
    onSuccess: (data) => {
      setPlayers(data);
      setShowPlayers(true);
    },
    onError: (error) => {
      console.error("Error fetching players:", error.message);
    },
  });

  const handleTogglePlayers = () => {
    if (showPlayers) {
      setShowPlayers(false);
    } else {
      fetchingplayer();
    }
  };

  const Auctionstarted = async () => {
    const res = await fetch(`/api/auction/startAuction/${auctionCode}`, {
      method: "GET",
      credentials: "include", // Include credentials
    });
    if (!res.ok) throw new Error("Failed to start auction");
    return res.json();
  };
  const { mutate:StartingAuction} = useMutation({
    mutationFn: Auctionstarted,
    onSuccess: (data) => {
      console.log("Auction started successfully:", data);
      socket.emit("teamdetails",{teams,auctionCode})
      Navigate("/Adminpanel");
    },
    onError: (error) => {
      console.error("Error starting auction:", error.message);
    },
  });

  return (
    <div className="auction-container">
      {/* Teams Dropdown - Top Left */}
      <div className="dropdown-container team-dropdown">
        <button className="dropdown-btn">Teams</button>
        <div className="dropdown-content expanded-list">
          {teams.length === 0 ? <p>No Teams Available</p> : 
            teams.map((team, index) => <p key={index}>{team.teamName}</p>)}
        </div>
      </div>

      {/* Players Dropdown - Top Right */}
      <div className="dropdown-container player-dropdown">
        <button
          className="dropdown-btn"
          onClick={handleTogglePlayers}
          disabled={isLoading}
        >
          {isLoading ? <LoadingSpinner size="sm" /> : showPlayers ? "Hide Players" : "Show Players"}
        </button>
        {showPlayers && (
          <div className="dropdown-content expanded-list">
            {isLoading ? (
              <LoadingSpinner size="md" />
            ) : isError ? (
              <p>Error: {error.message}</p>
            ) : (
              players.length === 0 ? <p>No Players Available</p> : 
              players.map((player, index) => (
                <p key={index}>{player.name} - ${player.basePrice}</p>
              ))
            )}
          </div>
        )}
      </div>

      {/* Start Round Button - Centered */}
      <div className="start-auction-wrapper">
        <button className="start-auction-btn" onClick={()=>StartingAuction()}>Start Round</button>
      </div>
    </div>
  );
}

export default StartAuction;