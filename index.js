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

const expressServer = app.listen(2000, () => {
  console.log("Listening on *:2000")
})

const io = new Server(expressServer)

// add helmet here later for security
app.engine("html", ejs.renderFile)
app.set("view engine", "html")
app.use(express.static("static"))
app.use(cookieParser())
app.use(bp.json())
app.use(bp.urlencoded({ extended:true }))

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
  if (!req.cookies.session) {
    res.render("login")
  } else {
    try {
      const session = JSON.parse(req.cookies.session)
      const user = await db`SELECT * FROM atomchat_users WHERE id = ${session.id}`

      if (user == null || user.length === 0){
        res.render("login")
      } else {
        res.render("chat", {
          username: session.alias
        })
      }
    } catch(e) {
      res.render("login")
    }
  }
})

app.get("/signup", async (req, res) => {
  res.render("signup")
})

const signup_ratelimit = rateLimit({
	windowMs: 180 * 60 * 1000, // 10 minutes
	limit: 1,
	standardHeaders: "draft-7",
	legacyHeaders: false,
  message: "Please wait three hours before creating a new account!"
})

app.post("/signup", signup_ratelimit, async (req, res) => {
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

app.post("/login", async (req, res) => {
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
      io.emit("msg", { author: user[0].alias, text: msg.text })
    }
  })
})

app.use((req, res, next) => {
  res.status(404).render("404")
})