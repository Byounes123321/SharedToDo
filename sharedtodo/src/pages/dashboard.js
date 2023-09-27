import { useState, useEffect } from "react";
import UserLists from "/Components/UserList.jsx";
function Dashboard() {
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    fetch("http://localhost:8888/dashboard", {
      method: "GET",
      credentials: "include", // Include cookies in the request
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.status === 200) {
          return res.json(); // Parse the response as JSON
        } else {
          throw new Error("Failed to fetch user data");
        }
      })
      .then((data) => {
        setUserName(data.username);
        setUserId(data.userID);
      })
      .catch((err) => {
        console.log(err);
        // Handle the error or redirect to the login page if needed
      });
  }, []); // The empty array [] means this effect runs once after the component mounts

  return (
    <div>
      <header>
        <h1>{userName}'s Dashboard</h1>
      </header>
      <aside>
        <h2>Your Lists</h2>
        <button>Create New List</button>
        <br />
        <UserLists userID={userId} />
      </aside>
    </div>
  );
}

export default Dashboard;
