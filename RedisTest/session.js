const express = require("express");
const session = require("express-session");
const redis = require("redis");
const client = redis.createClient();
const redisStore = require("connect-redis").default;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

client.on("connect", function (err) {
  if (err) {
    console.log("Could not establish a connection with Redis. " + err);
  } else {
    console.log("Connected to Redis successfully!");
  }
});

app.use(
  session({
    store: new redisStore({ client: client }),
    secret: "topsecret~!@#$%^&*",
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

app.get("/", (req, res) => {
  const session = req.session;
  if (session.username && session.password) {
    if (session.username) {
      res.send(
        `<h1>Welcome ${session.username}! </h1><br><a href="/logout"><button>Log out</button></a >`
      );
    }
  } else {
    res.sendFile(__dirname + "/login.html");
  }
});

app.post("/login", (req, res) => {
  const session = req.session;
  const { username, password } = req.body;
  session.username = username;
  session.password = password;
  res.type("html");
  res.send("Successfully logged in!");
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return console.log(err);
    }
    res.redirect("/");
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server started at port: ${PORT}`);
});
