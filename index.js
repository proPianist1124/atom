const express = require("express")
const app = express()
const { Server } = require("socket.io")
const cookieParser = require("cookie-parser")
const bp = require("body-parser")
const ejs = require("ejs")
const sha256 = require("js-sha256")
const { rateLimit } = require("express-rate-limit")
const { v4: uuidv4 } = require("uuid")
const postgres = require("postgres")
require("dotenv").config()

const server = app.listen(2000, () => {
  console.log("Listening on *:2000")
})

const io = new Server(server)

// add helmet here later for security
app.engine("html", ejs.renderFile)
app.set("view engine", "html")
app.use(express.static("static"))
app.use(cookieParser())
app.use(bp.json())
app.use(bp.urlencoded({ extended:true }))

// custom middleware
app.use(async (req, res, next) => {
  if (req.url != "/" && req.url.startsWith("/api/") == false) {
    try {
      const session = JSON.parse(req.cookies.session)
      const user = await db`SELECT * FROM atomchat_users WHERE id = ${session.id}`
      
      if (user == null || user.length === 0) {
        res.redirect("/")
      } else {
        next()
      }
    } catch (e) {
      res.redirect("/")
    }
  } else {
    next()
  }
})

// postgres database
const db = postgres({
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  username: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  port: 5432,
  ssl: "require",
  connection: {
    options: `project=${process.env.ENDPOINT_ID}`,
  }
})

app.get("/", async (req, res) => {
  req.query.page == "signup" ? res.render("signup") : res.render("login")
})

app.get("/home", async (req, res) => {
  const session = JSON.parse(req.cookies.session)

  const servers = await db`SELECT * FROM atomchat_servers WHERE owner = ${session.id}`

  res.render("home", {
    username: session.alias,
    servers: JSON.stringify(servers)
  })
})

app.get("/server/:id", async (req, res) => {
  const session = JSON.parse(req.cookies.session)
  
  try {
    const server = await db`SELECT * FROM atomchat_servers WHERE id = ${req.params.id}`

    if (server == null || server.length === 0) {
      res.status(404).render("404")
    } else {
      res.render("chat", {
        name: "test",
        username: session.alias,
        id: req.params.id
      })
    }
  } catch (e) {
    res.status(404).render("404")
  }
})


// signing up
const signup_ratelimit = rateLimit({
	windowMs: 180 * 60 * 1000, // 10 minutes
	limit: 1,
	standardHeaders: "draft-7",
	legacyHeaders: false,
  message: "Please wait three hours before creating a new account!"
})

app.post("/api/signup", signup_ratelimit, async (req, res) => {
  const user = await db`SELECT * FROM atomchat_users WHERE alias = ${req.body.alias.toLowerCase()}`

  if (req.body.alias.length < 4) {
    res.json({ error: "Alias is too short - minimum is 4 characters" })
  } else if (user == null || user.length === 0) {
    const today = new Date()

    await db`INSERT INTO atomchat_users VALUES (${uuidv4()}, ${`${String(today.getMonth() + 1).padStart(2, "0")} - ${String(today.getDate()).padStart(2, '0')}-${today.getFullYear()}`}, ${req.body.alias.toLowerCase()}, ${sha256(req.body.password)})`

    const created_user = await db`SELECT * FROM atomchat_users WHERE alias = ${req.body.alias.toLowerCase()}`
    res.json({ id: created_user[0].id, alias: created_user[0].alias })
  } else {
    res.json({ error: "Alias is already in use" })
  }
})

// logging in
app.post("/api/login", async (req, res) => {
  const user = await db`SELECT * FROM atomchat_users WHERE alias = ${req.body.alias.toLowerCase()}`

  if (user == null || user.length === 0) {
    res.json({ error: "User not found" })
  } else if(user[0].password !== sha256(req.body.password)) {
    res.json({ error: "Incorrect password" })
  } else {
    res.json({ id: user[0].id, alias: user[0].alias })
  }
})

io.on("connection", (socket) => {
  socket.on("msg", async (msg) => {
    const user = await db`SELECT * FROM atomchat_users WHERE id = ${msg.author}`

    if (user != null || user.length !== 0) {
      io.emit(`msg_${msg.server}`, { author: user[0].alias, text: msg.text })
    }
  })
})

app.get("*", function(req, res){
  res.status(404).render("404")
})