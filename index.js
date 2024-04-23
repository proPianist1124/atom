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

const server = app.listen(2000, async () => {
  console.log("Listening *:2000")
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
  if (req.url != "/" && req.url != "/?page=signup" && req.url.startsWith("/api/") == false) {
    try {
      const user = await db`SELECT * FROM atom_users WHERE id = ${req.cookies.sid};`
      
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

app.get("/", async (req, res) => {
  try {
    const user = await db`SELECT * FROM atom_users WHERE id = ${req.cookies.sid};`
    
    if (user == null || user.length === 0) {
      req.query.page == "signup" ? res.render("signup") : res.render("login")
    } else {
      res.redirect("/home")
    }
  } catch (e) {
    req.query.page == "signup" ? res.render("signup") : res.render("login")
  }
})

app.get("/home", async (req, res) => {
  const user = await db`SELECT * FROM atom_users WHERE id = ${req.cookies.sid};`
  const servers = user[0].joined

  res.render("home", {
    alias: user[0].alias,
    servers: JSON.stringify(servers.reverse())
  })
})

app.get("/server/:id", async (req, res) => {
  try {
    const user = await db`SELECT * FROM atom_users WHERE id = ${req.cookies.sid};`
    const server = await db`SELECT * FROM atom_servers WHERE id = ${req.params.id};`

    if (server == null || server.length === 0) {
      res.status(404).render("404")
    } else {
      const members = server[0].members
      const joined = user[0].joined

      if (members.includes(req.cookies.alias) == false) {
        members.push(req.cookies.alias)
        joined.push({ id: req.params.id, name: server[0].name })

        // setting user as a new member of the server if aren't currently a member
        await db`UPDATE atom_servers SET members = ${members} WHERE id = ${req.params.id};`
        await db`UPDATE atom_users SET joined = ${joined} WHERE id = ${req.cookies.sid};`
      }

      res.render("chat", {
        id: server[0].id,
        name: server[0].name,
        owner: server[0].owner == req.cookies.sid,
        alias: user[0].alias,
        messages: JSON.stringify(server[0].messages),
        members: JSON.stringify(members)
      })
    }
  } catch (e) {
    res.status(404).render("404")
  }
})


// signing up
/* const signup_ratelimit = rateLimit({
	windowMs: 180 * 60 * 1000, // 10 minutes
	limit: 1,
	standardHeaders: "draft-7",
	legacyHeaders: false,
  message: "Please wait three hours before creating a new account!"
}) */

app.post("/api/signup", async (req, res) => {
  try {
    const user = await db`SELECT * FROM atom_users WHERE alias = ${req.body.alias.toLowerCase()};`

    if (req.body.alias.length < 4) {
      res.json({ error: "Alias is too short - minimum is 4 characters." })
    } else if (req.body.password.length < 5) {
      res.json({ error: "Password is too short - minimum is 5 characters." })
    } else if (req.body.invite_key != process.env.INVITE_KEY) {
      res.json({ error: "Invalid invite key." })
    } else if (user == null || user.length === 0) {
      const today = new Date()

      await db`INSERT INTO atom_users VALUES (${uuidv4()}, ${`${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}-${today.getFullYear()}`}, ${req.body.alias.toLowerCase()}, ${sha256(req.body.password)}, '[]');`

      const created_user = await db`SELECT * FROM atom_users WHERE alias = ${req.body.alias.toLowerCase()};`
      res.json({ sid: created_user[0].id, alias: created_user[0].alias})
    } else {
      res.json({ error: "Alias is already in use." })
    }
  } catch (e) {
    console.log(e)
    res.json({ error: "An error occured." })
  }
})

// logging in
app.post("/api/login", async (req, res) => {
  if (req.body.alias == "" || req.body.password == "") {
    res.json({ error: "Please fill out all fields." })
  } else {
    const user = await db`SELECT * FROM atom_users WHERE alias = ${req.body.alias.toLowerCase()};`

    if (user == null || user.length === 0) {
      res.json({ error: "User not found." })
    } else if (user[0].password !== sha256(req.body.password)) {
      res.json({ error: "Incorrect password." })
    } else {
      res.json({ sid: user[0].id, alias: user[0].alias })
    }
  }
})

// creating a server
app.post("/api/create-server", async (req, res) => {
  try {
    if (req.body.name.length < 4) {
      res.json({ error: "Server name is too short - minimum is 4 characters." })
    } else if (req.body.name > 20) {
      res.json({ error: "Server name is too long - maximum is 20 characters." })
    } else {
      const today = new Date()

      const id = uuidv4()

      await db`INSERT INTO atom_servers VALUES (${id}, ${`${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}-${today.getFullYear()}`}, ${req.body.name}, '[]', '[]', ${req.cookies.sid});`

      res.json({ id })
    }
  } catch (e) {
    res.json({ error: e.message })
  }
})

// deleting a server
app.post("/api/delete-server", async (req, res) => {
  try {
    const server = await db`SELECT * FROM atom_servers WHERE id = ${req.body.id};`

    if (server[0].owner == req.cookies.sid) {
      const members = server[0].members

      members.forEach(async (alias) => {
        const member = await db`SELECT joined FROM atom_users WHERE alias = ${alias};`

        await db`UPDATE atom_users SET joined = ${member[0].joined.filter((server) => server.id != req.body.id)} WHERE alias = ${alias};`
      })

      await db`DELETE FROM atom_servers WHERE id = ${req.body.id};`
      
      res.json({ success: true })
    } else {
      res.json({ error: "Unauthorized access." })
    }
  } catch (e) {
    res.json({ error: e.message })
  }
})

// purge all messages
app.post("/api/purge-msgs", async (req, res) => {
  try {
    const owner = await db`SELECT owner FROM atom_servers WHERE id = ${req.body.id};`

    if (owner[0].owner == req.cookies.sid) {
      await db`UPDATE atom_servers SET messages = '[]' WHERE id = ${req.body.id};`

      res.json({ success: true })
    } else {
      res.json({ error: "Unauthorized access." })
    }
  } catch (e) {
    res.json({ error: e.message })
  }
})

// logging out
app.get("/logout", async (req, res) => {
  res.clearCookie("sid")
  res.clearCookie("alias")
  res.redirect("/")
})

io.on("connection", (socket) => {
  socket.on("msg", async (msg) => {
    try {
      const user = await db`SELECT * FROM atom_users WHERE id = ${msg.author};`

      if (user != null || user.length !== 0) {
        io.emit(`msg_${msg.server}`, { author: user[0].alias, text: msg.text })

        const server = await db`SELECT messages FROM atom_servers WHERE id = ${msg.server};`

        server[0].messages.push({ author: user[0].alias, text: msg.text })
      
        await db`UPDATE atom_servers SET messages = ${server[0].messages} WHERE id = ${msg.server};`
      }
    } catch (e) {
      console.log(e)
    }
  })
})

app.get("*", function(req, res){
  res.status(404).render("404")
})