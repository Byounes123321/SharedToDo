import React, { useState, useEffect } from "react";

export default function UserList(userID) {
  const [userLists, setUserLists] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        "http://localhost:8888/userLists/?" + userID
      );
      const data = await response.json();
      setUserLists(data);
    };
    fetchData();
  }, []);

  return <h1>UserList</h1>;
}
