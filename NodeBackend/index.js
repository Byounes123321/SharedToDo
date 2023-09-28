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

(async () => {
  await redisClient.connect();
})();
/*
  Where im at
  1. I can create a new list and i think edit an existing list(need to finish get user lists)
  2. I can add tasks to the list but it does not save in the database
  3. Need to work on the social aspect of the app( sharing lists, adding friends, etc.)
  4. Need to work on security and reauthentification after 10 minutes( also need to make sure user is logged in before making any requests)
  ! REMEMBER TO INSTALL REDIS WITH DOCKER ON LAPTOP
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
      maxAge: 1000 * 60 * 10, // 10 minutes
    },
  })
);

app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// Middleware
http: app.use(express.json());

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
    "SELECT * FROM users_lists WHERE U_ID = ?",
    [userID],
    (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).send("Server Error");
      } else if (results.length > 0) {
        //! This is where I need to get the list names from the lists table
        return res.status(200).send(results);
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
                return res
                  .status(200)
                  .send("List created successfully")
                  .send(newListID);
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

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return console.error(err);
    }
    res.redirect("/"); // Redirect to the login page or another appropriate location
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
