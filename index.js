const express = require("express")
const app = express()
const { Server } = require("socket.io")
const cookieParser = require("cookie-parser")
const bp = require("body-parser")
const { createClient } = require("@supabase/supabase-js")
const ejs = require("ejs")
const sha256 = require("js-sha256")
const { rateLimit } = require("express-rate-limit")
require("dotenv").config()

const expressServer = app.listen(2000, () => {
  console.log("Listening on *:2000")
})
const io = new Server(expressServer)

const limiter = rateLimit({
	windowMs:10 * 60 * 1000, // 10 minutes
	limit:1,
	standardHeaders:"draft-7",
	legacyHeaders:false, // Disable the `X-RateLimit-*` headers.
  message:"Too many requests!"
})

app.engine("html", ejs.renderFile)
app.set("view engine", "html")
app.use(express.static("static"))
app.use(cookieParser())
app.use(bp.json())
app.use(bp.urlencoded({ extended:true }))

const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON)

app.get("/", async (req, res) => {
  if(!req.cookies.session){
    res.render("login")
  }else{
    const session = JSON.parse(req.cookies.session)
    try{
      const { data:user } = await db.from("anon_users").select().eq("id", session.id)
      if(user == null || user.length === 0){
        res.render("login")
      }else{
        res.render("chat", {
          username:session.alias
        })
      }
    }catch(e){
      res.render("login")
    }
  }
})

app.post("/login", async (req, res) => {
  const { data:user } = await db.from("anon_users").select().eq("alias", req.body.alias)
  if(user == null || user.length === 0){
    res.json({ error:"User not found" })
  }else if(user[0].password !== sha256(req.body.password)){
    res.json({ error:"Incorrect password" })
  }else{
    res.json({ id:user[0].id, alias:user[0].alias })
  }
})

io.on("connection", (socket) => {
  socket.on("msg", async (msg) => {
    const { data:user } = await db.from("anon_users").select().eq("id", msg.split("&&")[0])
    
    io.emit("msg", `${user[0].alias}&&${msg.split("&&")[1]}`)
  })
})

app.use((req, res, next) => {
  res.status(404).render("404")
})