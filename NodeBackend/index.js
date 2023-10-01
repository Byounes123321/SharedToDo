const express = require("express");
const app = express();
const port = process.env.PORT || 8888;
const bcrypt = require("bcrypt");
const cors = require("cors");
const crypto = require("crypto");
const secret = crypto.randomBytes(64).toString("hex");
const session = require("express-session");
const RedisStore = require("connect-redis").default;
const redis = require("redis");
const redisClient = redis.createClient("127.0.0.1", "6379");
const http = require("http");
const socketIo = require("socket.io");
const server = http.createServer(app);
const { Server } = require("socket.io");

(async () => {
  await redisClient.connect();
})();
/*
  Where im at
  1. I can create a new list and i think edit an existing list(need to finish get user lists)
  2. Need to work on the social aspect of the app( sharing lists, adding friends, etc.)
  3. Need to work on security and reauthentification after 10 minutes( also need to make sure user is logged in before making any requests)
 */

redisClient.on("connect", function (err) {
  if (err) {
    console.log("Could not establish a connection with Redis.", err);
  } else {
    console.log("Connected to Redis successfully!");
  }
});

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      sameSite: true,
      secure: false,
      httpOnly: false,
      maxAge: 1000 * 60 * 60, // 60 minutes (1 hour)
    },
  })
);

app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// Middleware
http: app.use(express.json());

// Listen for incoming WebSocket connections
const io = new Server(server, { cors: { origin: "*" } });
io.on("connection", (socket) => {
  console.log("A user connected");
});

//import Database connection
const connection = require("./Components/DbConnect.js");
//Connect to Database
connection.connect(function (err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }
  console.log("connected as id " + connection.threadId);
});

// User Sign Up
app.post("/signup", (req, res) => {
  const { email, password, username } = req.body;
  //Check if username already exists
  connection.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send("Server error");
      }
      if (results.length > 0) {
        res.status(400).send("Username already in use");
      }
    }
  );
  // Check if the email already exists
  connection.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send("Server error");
      }
      if (results.length > 0) {
        res.status(400).send("Email already in use");
      } else {
        // Encrypt the password
        bcrypt.hash(password, 10).then((hash) => {
          // Insert the user into the database
          connection.query(
            "INSERT INTO users (email, password, username) VALUES (?, ?, ?)",
            [email, hash, username],
            (err, results) => {
              if (err) {
                console.log(err);
                res.status(500).send("Server error");
              }
              res.status(200).send("User registered");
            }
          );
        });
      }
    }
  );
});

let id = 0;
// User Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  connection.query(
    "SELECT email, password FROM users WHERE email = ?",
    [email],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send("Server Error");
      } else if (results.length === 0) {
        // User not found
        res.status(400).send("User not found");
      } else {
        const savedEmail = results[0].email;
        const savedPass = results[0].password;

        // check if emails match
        if (savedEmail !== email) {
          res.status(400).send("Username or Password don't match");
        }

        // Use bcrypt.compare to check if the input password matches the stored hashed password
        bcrypt.compare(password, savedPass, (bcryptErr, isMatch) => {
          if (bcryptErr) {
            console.log(bcryptErr);
            res.status(500).send("Server Error");
          } else if (isMatch) {
            // Set the session data
            const session = req.session;
            // console.log("1", session);
            // console.log("2", session.id);
            id = session.id;
            // console.log("3", email);
            // console.log("4", password);
            session.email = email;
            session.password = password;
            // console.log("5", session);

            // Save the session
            session.save((saveErr) => {
              if (saveErr) {
                console.error(saveErr);
                res.status(500).send("Server Error");
              } else {
                // Redirect to the dashboard after the session is saved
                // console.log("6", session);
                res
                  .status(200)
                  .type("html")
                  .send("Login successful " + req.session.email);
              }
            });
          } else {
            res.status(400).send("Username or Password don't match");
          }
        });
      }
    }
  );
});

app.get("/dashboard", (req, res) => {
  // Retrieve the session data asynchronously
  req.sessionStore.get(id, async (error, sessionData) => {
    if (error) {
      console.error("Error retrieving session:", error);
      return res.status(500).send("Error retrieving session");
    }

    if (!sessionData) {
      return res.status(404).send("Session not found");
    }

    if (sessionData.email) {
      // Use session properties
      const userEmail = sessionData.email;
      // console.log("userEmail", userEmail);

      connection.query(
        "SELECT username, U_ID FROM users WHERE email = ?",
        [userEmail],
        (err, results) => {
          if (err) {
            console.log(err);
            return res.status(500).send("Server Error");
          } else if (results.length > 0) {
            const username = results[0].username;
            const userID = results[0].U_ID;
            // console.log(userID);
            // Send a response with the retrieved user data
            return res.status(200).send({ email: userEmail, username, userID });
          } else {
            console.log("User not found");
            return res.status(404).send("User not found");
          }
        }
      );
    } else {
      console.log("no user in session");
      return res.redirect("/");
    }
  });
});

//Get all users Lists
app.get("/getuserlists/:userID", (req, res) => {
  const userID = req.params.userID;
  connection.query(
    "SELECT users_lists.L_ID, lists.Title FROM users_lists INNER JOIN lists ON users_lists.L_ID = lists.L_ID WHERE users_lists.U_ID = ?",
    [userID],
    (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).send("Server Error");
      } else if (results.length > 0) {
        const listData = results.map((row) => ({
          L_ID: row.L_ID,
          Title: row.Title,
        })); // Extract L_ID and Title
        // console.log(listData); // Log listData
        return res.status(200).json(listData); // Send listData as JSON
      } else {
        console.log("User not found");
        return res.status(404).send("User not found");
      }
    }
  );
});

// new list / update name
app.put("/putuserlists/:userID/:listID", (req, res) => {
  const userID = req.params.userID;
  const listID = req.params.listID;
  const newListName = req.body.listName;
  io.emit("ListUpdate");
  console.log("newListName", newListName);
  console.log("userID", userID);
  if (listID === "new") {
    connection.query(
      "INSERT INTO lists (Title) VALUES (?)",
      [newListName],
      (err, results) => {
        if (err) {
          console.log(err);
          return res.status(500).send("Server Error");
        } else {
          const newListID = results.insertId;
          console.log("newListID", newListID);
          connection.query(
            "INSERT INTO users_lists (U_ID, L_ID) VALUES (?, ?)",
            [userID, newListID],
            (err, results) => {
              if (err) {
                console.log(err);
                return res.status(500).send("Server Error");
              } else {
                return res.status(200).send({ newID: newListID });
              }
            }
          );
        }
      }
    );
  } else {
    connection.query(
      "UPDATE lists SET Title = ? WHERE L_ID = ?",
      [newListName, listID],
      (err, results) => {
        if (err) {
          console.log(err);
          return res.status(500).send("Server Error");
        } else {
          return res.status(200).send("List updated successfully");
        }
      }
    );
  }
});

// new/update task
app.put("/puttask/:listID/:taskID", (req, res) => {
  const listID = req.params.listID;
  const taskID = req.params.taskID;
  const taskName = req.body.taskName;

  console.log("task entered");

  if (taskID === "new") {
    connection.query(
      "INSERT INTO tasks (L_ID, taskName) VALUES (?, ?)",
      [listID, taskName],
      (err, results) => {
        if (err) {
          console.log(err);
          return res.status(500).send("Server Error");
        } else {
          const newTaskID = results.insertId;
          return res.status(200).json({ newID: newTaskID }); // Send JSON response
        }
      }
    );
  } else {
    connection.query(
      "UPDATE tasks SET taskName = ? WHERE T_ID = ?",
      [taskName, taskID], // Update the task name and completion status
      (err, results) => {
        if (err) {
          console.log(err);
          return res.status(500).send("Server Error");
        } else {
          return res.status(200).send("Task updated successfully");
        }
      }
    );
  }
});

app.get("/getlist/:listID", (req, res) => {
  const listID = req.params.listID;

  // Replace this query with your database query to fetch the list by ID
  connection.query(
    "SELECT Title FROM lists WHERE L_ID = ?",
    [listID],
    (err, listResults) => {
      if (err) {
        console.log(err);
        return res.status(500).send("Server Error");
      } else if (listResults.length === 0) {
        console.log("List not found");
        return res.status(404).send("List not found");
      } else {
        const listTitle = listResults[0].Title;

        // Replace this query with your database query to fetch tasks for the list by ID
        connection.query(
          "SELECT TaskName, done, T_ID FROM tasks WHERE L_ID = ?",
          [listID],
          (err, taskResults) => {
            if (err) {
              console.log(err);
              return res.status(500).send("Server Error");
            } else {
              const taskNames = taskResults.map((task) => task.TaskName);
              const taskDone = taskResults.map((task) => task.done);
              const taskID = taskResults.map((task) => task.T_ID);

              // Create an array of task objects with name and done properties
              const tasks = taskNames.map((name, index) => ({
                name,
                done: taskDone[index], // Add the done property here
                id: taskID[index],
              }));

              // Construct the response object with list details including tasks
              const listDetails = {
                Title: listTitle,
                Tasks: tasks, // Include the tasks array here
              };

              console.log("List:", listDetails);
              return res.status(200).json(listDetails);
            }
          }
        );
      }
    }
  );
});
// Update task
app.put("/updatetask/:taskID", (req, res) => {
  const taskID = req.params.taskID;
  const taskName = req.body.taskName;
  const completed = req.body.completed; // Add a completed field to the request body
  console.log("taskName", taskName);
  if (taskName === undefined) {
    connection.query(
      "UPDATE tasks SET done = ? WHERE T_ID = ?", // Update the completion status
      [completed, taskID],
      (err, results) => {
        if (err) {
          console.log(err);
          return res.status(500).send("Server Error");
        } else {
          return res.status(200).send("Task updated successfully");
        }
      }
    );
  } else {
    connection.query(
      "UPDATE tasks SET taskName = ? WHERE T_ID = ?",
      [taskName, taskID],
      (err, results) => {
        if (err) {
          console.log(err);
          return res.status(500).send("Server Error");
        } else {
          return res.status(200);
        }
      }
    );
  }
});

// Delete list
app.delete("/deletelist/:listID", async (req, res) => {
  const listID = req.params.listID;
  io.emit("ListUpdate");
  try {
    // Use Promise.all to perform multiple queries in parallel
    await Promise.all([
      query("DELETE FROM lists WHERE L_ID = ?", [listID]),
      query("DELETE FROM users_lists WHERE L_ID = ?", [listID]),
      query("DELETE FROM tasks WHERE L_ID = ?", [listID]),
    ]);
    console.log("List deleted successfully", listID);
    return res.status(200);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server Error");
  }
});

// Helper function to execute a MySQL query as a promise
function query(sql, values) {
  return new Promise((resolve, reject) => {
    connection.query(sql, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

// Delete task
app.delete("/deletetask/:taskID", async (req, res) => {
  const taskID = req.params.taskID;
  console.log("deleting task", taskID);
  if (taskID === undefined) {
    return res.status(400).send("Task not found");
  }
  connection.query(
    "DELETE FROM tasks WHERE T_ID = ?",
    [taskID],
    (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).send("Server Error");
      } else {
        io.emit("TaskDelete");
        return res.status(200);
      }
    }
  );
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return console.error(err);
    }
    res.redirect("/"); // Redirect to the login page or another appropriate location
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
