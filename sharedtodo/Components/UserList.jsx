import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";

export default function UserList({ userID, onListClick }) {
  const [userLists, setUserLists] = useState([]);

  const fetchUserLists = () => {
    if (userID) {
      fetch("http://localhost:8888/getuserLists/" + userID)
        .then((response) => response.json())
        .then((data) => {
          console.log("UserLists:", data);
          setUserLists(data);
        });
    }
  };

  useEffect(() => {
    const socket = socketIOClient("http://localhost:8888");

    socket.on("ListUpdate", () => {
      // Call the fetchUserLists function when the socket is triggered
      console.log("ListUpdate socket triggered");
      fetchUserLists();
    });

    // Fetch user lists when the component initially renders
    fetchUserLists();

    return () => {
      socket.disconnect();
    };
  }, [userID]);

  const handleItemClick = (listID) => {
    console.log("List clicked:", listID);
    onListClick(listID);
  };

  return (
    <div>
      <h1>Lists</h1>
      <ul>
        {userLists.map((list) => (
          <li key={list.L_ID} onClick={() => handleItemClick(list.L_ID)}>
            {list.Title}
          </li>
        ))}
      </ul>
    </div>
  );
}
