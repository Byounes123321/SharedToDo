import React, { useState, useEffect, useRef } from "react";

export default function ListView({ userID, listID }) {
  const [listName, setListName] = useState("");
  const [taskName, setTaskName] = useState("");
  const [tasks, setTasks] = useState([]);
  const taskInputRef = useRef(null);

  // Function to handle onBlur event for the title input field
  const handleTitleBlur = (event) => {
    const inputValue = event.target.value;
    console.log("Input value:", inputValue);
    console.log(userID);
    setListName(inputValue);

    // Make a fetch request when listName updates

    if (listName && listName) {
      fetch(`http://localhost:8888/putuserlists/${userID}/${listID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ listName }),
      })
        .then((response) => {
          // Handle the response as needed
          console.log("List name updated:", response());
          // i sent the list id in the response, that needs to be set as the list id for this component
        })
        .catch((error) => {
          console.error("Error updating list name:", error);
        });
    }
  };

  // Function to handle onBlur event for the task input field
  const handleTaskBlur = (event) => {
    const inputValue = event.target.value;
    console.log("Task value:", inputValue);
    setTaskName(inputValue);
  };

  // Function to add a new task
  const addTask = () => {
    if (taskName.trim() !== "") {
      setTasks([...tasks, taskName]);
      setTaskName(""); // Clear the task input field
      taskInputRef.current.focus();
    }
  };
  // if the listid is new send it with no list id attached to make a new list in the database
  // add the user id to the api call to make sure the list is added to the correct user
  // check if name is really changed to avoid unnecessary api calls

  // Make a fetch request when taskName changes
  useEffect(() => {
    if (taskName && listID !== "new") {
      fetch(`http://your-api-endpoint-for-tasks/${listID}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ taskName }),
      })
        .then((response) => {
          // Handle the response as needed
          console.log("Task added:", response);
        })
        .catch((error) => {
          console.error("Error adding task:", error);
        });
    }
  }, [taskName, listID]);

  return (
    <div>
      <h1>
        <input
          type="text"
          placeholder={listID === "new" ? "New List" : listName}
          onBlur={handleTitleBlur}
          value={listName}
          onChange={(e) => setListName(e.target.value)}
        />
      </h1>
      <div>
        <input
          type="text"
          placeholder="Add a task"
          onBlur={handleTaskBlur}
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          ref={taskInputRef}
        />
        <button onClick={addTask}>Add Task</button>
      </div>
      <ul>
        {tasks.map((task, index) => (
          <li key={index}>
            <input type="checkbox" />
            {task}
          </li>
        ))}
      </ul>
    </div>
  );
}
