import React, { useState, useEffect, useRef } from "react";

export default function ListView({ userID, incomingListID }) {
  const [listName, setListName] = useState("");
  const [taskName, setTaskName] = useState("");
  const [tasks, setTasks] = useState([]);
  const [listID, setListID] = useState(incomingListID);
  const taskInputRef = useRef(null);
  const [taskID, setTaskID] = useState("new");

  //! need to be able to update tasks and check them off
  //! need to add the ability to delete tasks
  //! need to add the ability to delete lists
  //! need to add the ability to add friends to lists
  //! need to add the ability to add friends to the app

  useEffect(() => {
    setListID(incomingListID);
    console.log("List ID updated:", incomingListID);
    if (incomingListID !== "new") {
      fetch(`http://localhost:8888/getlist/${incomingListID}`)
        .then((response) => response.json())
        .then((data) => {
          console.log("List:", data);
          setListName(data.Title);
          setTasks(data.Tasks);
        });
    }
  }, [incomingListID]);

  // Handle onBlur event for the title input field
  const handleTitleBlur = (event) => {
    const inputValue = event.target.value;
    setListName(inputValue);

    if (listName && listID) {
      // Make a fetch request when listName updates
      fetch(`http://localhost:8888/putuserlists/${userID}/${listID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ listName }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("List name updated:", listName);
          console.log("List name updated:", data);
          setListID(data.newID);
          console.log("List ID updated:", data.newID);
        })
        .catch((error) => {
          console.error("Error updating list name:", error);
        });
    }
  };

  // Handle onBlur event for the task input field
  const handleTaskBlur = (event) => {
    const inputValue = event.target.value;
    setTaskName(inputValue);
  };

  // Function to add a new task
  const addTask = () => {
    if (taskName.trim() !== "") {
      setTasks([...tasks, taskName]);

      // Make a fetch request when add task button is clicked

      if (taskName && listID !== "new") {
        fetch(`http://localhost:8888/puttask/${listID}/${taskID}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ taskName }),
        })
          .then((response) => {
            console.log("Task added:", response);
          })
          .catch((error) => {
            console.error("Error adding task:", error);
          });
      }

      setTaskName("");
      taskInputRef.current.focus();
    }
  };

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
            <input type="text" value={task} />
          </li>
        ))}
      </ul>
    </div>
  );
}
