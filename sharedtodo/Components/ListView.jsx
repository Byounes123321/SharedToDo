import React, { useState, useEffect, useRef } from "react";
import socketIOClient from "socket.io-client";

export default function ListView({ userID, incomingListID }) {
  const [listName, setListName] = useState("");
  const [taskName, setTaskName] = useState("");
  const [tasks, setTasks] = useState([]);
  const [listID, setListID] = useState(incomingListID);
  const taskInputRef = useRef(null);
  const [taskID, setTaskID] = useState("new");
  const [completed, setCompleted] = useState(false);
  const [taskNameTemp, setTaskNameTemp] = useState({});
  const [taskDeleted, setTaskDeleted] = useState(false);
  const [listUsers, setListUsers] = useState([]);

  // Use a ref to store the debounce timeout IDs for deleteTask and taskCompleted
  const debounceDeleteTaskTimeout = useRef(null);
  const debounceTaskCompletedTimeout = useRef(null);

  const socket = useRef(null);

  useEffect(() => {
    // Initialize the socket when the component mounts
    socket.current = socketIOClient("http://localhost:8888");

    // Set up the event listener for "TaskDelete" socket event once
    socket.current.on("TaskDelete", (data) => {
      // Use a debounce mechanism to limit the rate of event processing
      const L_ID = data.L_ID;
      console.log("sockit", L_ID);
      clearTimeout(debounceDeleteTaskTimeout.current);
      debounceDeleteTaskTimeout.current = setTimeout(() => {
        console.log("TaskDelete event received", L_ID, taskID);
        fetchAndUpdateList(L_ID);
      }, 100); // Adjust the debounce delay as needed
    });

    // Clean up the socket connection when the component unmounts
    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    setListID(incomingListID);
    console.log("List ID updated:", incomingListID);

    if (incomingListID === "new") {
      // Clear list name and tasks when creating a new list
      setListName("");
      setTasks([]);
    } else {
      fetch(`http://localhost:8888/getlist/${incomingListID}`)
        .then((response) => response.json())
        .then((data) => {
          console.log("List:", data);
          setListName(data.Title);
          setTasks(data.Tasks);
        });
    }
  }, [incomingListID, taskDeleted]);

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
      if (listID !== "new") {
        // Create a new task object for the task being added
        const newTask = { id: "temp", name: taskName };

        // Update the tasks state to include the new task
        setTasks([...tasks, newTask]);

        fetch(`http://localhost:8888/puttask/${listID}/${taskID}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ taskName }),
        })
          .then((response) => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error("Failed to add task");
            }
          })
          .then((data) => {
            console.log("Task added:", data);
            // Generate a new taskID for the next task
            setTaskID("new");
            // Replace the "temp" task with the newly added task
            setTasks((prevTasks) =>
              prevTasks.map((task) =>
                task.id === "temp" ? { ...task, id: data.newID } : task
              )
            );
          })
          .catch((error) => {
            console.error("Error adding task:", error);
          });
      }
      setTaskName("");
      taskInputRef.current.focus();
    }
  };

  // Function to handle the task name change
  const handleTaskNameChange = (e, taskId) => {
    const updatedTaskName = taskNameTemp[taskId] || ""; // Get the updated name for the specific task ID
    console.log("Task name changed:", taskId, updatedTaskName);

    // Update task name in the server
    fetch("http://localhost:8888/updatetask/" + taskId, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ taskName: updatedTaskName }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Task updated:", data);
        // Generate a new taskID for the next task
        setTaskID("new");
        // Update the task's name in the tasks state
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId ? { ...task, name: updatedTaskName } : task
          )
        );
      })
      .catch((error) => {
        console.error("Error updating task:", error);
      });
  };

  // Function to handle task completion
  const taskCompleted = (e) => {
    const updatedCompleted = e.target.checked;
    const id = e.target.id.split("-")[1];

    // Use a debounce mechanism to limit the rate of event processing
    clearTimeout(debounceTaskCompletedTimeout.current);
    debounceTaskCompletedTimeout.current = setTimeout(() => {
      console.log("Task completed:", id, updatedCompleted);

      // Find the task in tasks by taskId and update its completed status
      fetch("http://localhost:8888/updatetask/" + id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed: updatedCompleted }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Task updated:", data);
          // Generate a new taskID for the next task
          setTaskID("new");
        })
        .catch((error) => {
          console.error("Error updating task:", error);
        });
    }, 500); // Adjust the debounce delay as needed
  };

  // Function to delete a list
  const deleteList = () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this list?"
    );
    console.log("Delete list:", confirmDelete);
    if (confirmDelete) {
      if (listID !== "new") {
        fetch("http://localhost:8888/deletelist/" + listID, {
          method: "DELETE",
        })
          .then((response) => response.json())
          .catch((error) => {
            console.error("Error deleting list:", error);
          });
      }
      setListID("new");
      setListName("");
      setTasks([]);
      console.log("list deleted");
    }
  };

  // Function to fetch and update the list
  const fetchAndUpdateList = (L_ID) => {
    console.log("List ID:", L_ID);
    console.log("Fetching list..." + listID);
    if (L_ID !== "new") {
      console.log("Fetching list:", L_ID);
      fetch(`http://localhost:8888/getlist/${L_ID}`)
        .then((response) => response.json())
        .then((data) => {
          console.log("List:", data);
          setListName(data.Title);
          setTasks(data.Tasks);
        })
        .catch((error) => {
          console.error("Error fetching list:", error);
        });
    }
  };

  // Function to delete a task
  const deleteTask = async (e) => {
    console.log("deleteTask called");
    if (!e || !e.target) {
      console.error("Event object is undefined or lacks a target property.");
      return;
    }

    const id = e.target.id;
    console.log("Task deleted:", id);

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (confirmDelete) {
      console.log(confirmDelete);
      const response = await fetch("http://localhost:8888/deletetask/" + id, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json", // Specify the content type as JSON
        },
        body: JSON.stringify({ L_ID: listID }), // Convert the object to a JSON string
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      console.log("huh?");
      const data = await response.json();
      console.log("Task deleted:", data);
    }
  };
  const addUser = () => {
    // need to add sockets to update other users lists once one person changes something
    const email = prompt("Please enter the email of the user you want to add");
    console.log(email);
    fetch("http://localhost:8888/adduser/" + listID, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
  };

  useEffect(() => {
    fetch("http://localhost:8888/getlistusers/" + listID)
      .then((response) => response.json())
      .then((data) => {
        console.log("Users:", data);
        setListUsers(data);
      });
  }, [listID]);

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
        <button onClick={deleteList}>Delete List</button>
        <button onClick={addUser}>Add User to list</button>
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
        {tasks.map((task) => (
          <li key={task.id}>
            <input
              id={`checkbox-${task.id}`}
              type="checkbox"
              onClick={taskCompleted}
              defaultChecked={task.done}
            />
            <input
              id={`text-${task.id}`}
              type="text"
              value={
                taskNameTemp[task.id] !== undefined
                  ? taskNameTemp[task.id]
                  : task.name
              }
              onChange={(e) =>
                setTaskNameTemp({
                  ...taskNameTemp,
                  [task.id]: e.target.value,
                })
              }
              onBlur={(e) => handleTaskNameChange(e, task.id)}
            />
            <button id={task.id} onClick={(e) => deleteTask(e)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
      <p>Users in list: </p>
      <ul>
        {listUsers.map((user) => (
          <li key={user.U_ID}>{user.username}</li>
        ))}
      </ul>
    </div>
  );
}
