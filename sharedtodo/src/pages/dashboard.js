import { useState, useEffect } from "react";
import UserLists from "/Components/UserList.jsx";
import ListView from "/Components/ListView.jsx";

function Dashboard() {
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [listId, setListId] = useState("");

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
  }, []);

  const newList = () => {
    setListId("new");
  };

  const handleListClick = (listID) => {
    setListId(listID);
  };

  return (
    <div>
      <header>
        {userName ? <h1>Welcome, {userName}</h1> : <h1>Loading...</h1>}
      </header>
      <div className="DashboardBody">
        {" "}
        <aside>
          <h2>Your Lists</h2>
          <button onClick={newList}>Create New List</button>
          <br />
          <UserLists userID={userId} onListClick={handleListClick} />
        </aside>
        <ListView userID={userId} incomingListID={listId} />
      </div>
    </div>
  );
}

export default Dashboard;
