const express = require("express")
const app = express()
const http = require("http")
const server = http.createServer(app)
const { Server } = require("socket.io")
const io = new Server(server)
const cookieParser = require("cookie-parser")
const bp = require("body-parser")

app.use(express.static("static"))
app.use(cookieParser())
app.use(bp.json())
app.use(bp.urlencoded({ extended:true }))

app.get("/", (req, res) => {
  if(req.cookies.alias != undefined){
    res.sendFile(__dirname + "/pages/chat.html")
  }else{
    res.sendFile(__dirname + "/pages/login.html")
  }
})

app.post("/login", (req, res) => {
  res.cookie("alias", req.body.alias, { maxAge:600000 })
  res.redirect("/")
})

io.on("connection", (socket) => {
  socket.on("msg", (msg) => {
    io.emit("msg", msg)
  })
})

server.listen(2000, () => {
  console.log("Listening on *:2000")
})