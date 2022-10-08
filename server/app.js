const dotenv = require('dotenv')
dotenv.config()
const express = require('express')
const app = express()
const path = require('path')
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server,{
      cors: {
      origin: "*",
      methods: ["GET", "POST"],
    }
  }); 

const crypto = require('crypto')
const randomID = () => crypto.randomBytes(8).toString('hex')
const { InMemorySessionStore } = require('./sessionStore')
const { InMemoryMessageStore } = require('./messageStore')
const sessionStore = new InMemorySessionStore()
const messageStore = new InMemoryMessageStore()

app.use(express.static(path.resolve(__dirname, '../dist')))

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../dist', 'index.html'))
})

// handles sessionID, userID, and username

io.use((socket, next) => {
  const sessionID = socket.handshake.auth.sessionID
  if(sessionID) {
    // find existing session

    const session = sessionStore.findSession(sessionID)
    if (session) {
      socket.sessionID = sessionID
      socket.userID = session.userID
      socket.username = session.username
      return next()
    }
  }

  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error("invalid username"));
  }
  // create new session

  socket.sessionID = randomID()
  socket.userID = randomID()
  socket.username = username;
  console.log(socket.username, socket.sessionID, socket.userID)
  next();
});


io.on("connection", (socket) => {
  // persist session
  console.log(socket.sessionID)

  if (socket.sessionID) {
    sessionStore.saveSession(socket.sessionID, {
      userID: socket.userID,
      username: socket.username,
      connected: true,
    })
}

  // emit session details
  socket.emit('session', {
    sessionID: socket.sessionID,
    userID: socket.userID,
  })

  // join the 'userID' room
  socket.join(socket.userID)

  // fetch existing users
  const users = [];
  const messagesPerUser = new Map()
  messageStore.findMessagesForUser(socket.userID).forEach((message) => {
    const { from, to } = message
    const otherUser = socket.userID === from ? to : from
    if (messagesPerUser.has(otherUser)) {
      messagesPerUser.get(otherUser).push(message)
    } else {
      messagesPerUser.set(otherUser, [message])
    }
  })

  sessionStore.findAllSessions().forEach((session)=> {
    users.push({
      userID: session.userID,
      username: session.username,
      connected: session.connected,
      messages: messagesPerUser.get(session.userID) || []
    });
  })
  socket.emit("users", users);

  // notify existing users
  socket.broadcast.emit('user connected', {
    userID: socket.userID,
    username:socket.username,
    connected: true,
    messages: []
  })

  // forward the private message to the right recipient (and to other tabs of the sender)
  socket.on('private message', ({ content, to }) => {
    console.log(content, to)
    const message = {
      content,
      from: socket.userID,
      to,
    }
    socket.to(to).to(socket.userID).emit('private message', message)
    messageStore.saveMessage(message)

  })

  // notify users upon disconnection
  socket.on('disconnect', async () => {
    const matchingSockets = await io.in(socket.userID).allSockets()
    const isDisconnected = matchingSockets.size === 0
    if (isDisconnected) {
      // notify other users
      socket.broadcast.emit('user disconnected', socket.userID)
      // update the connection status of the session
      sessionStore.saveSession(socket.sessionID, {
        userID: socket.userID,
        username: socket.username,
        connected: false,
      })
    }
  })
});

server.listen(process.env.PORT, () => {
    console.log('Listening on port ' + process.env.PORT)
})
