const express = require('express')
const app = express()
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const port = process.env.PORT || 3000
const cors = require('cors')
const UserController = require('./controllers/UserController')

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended : false}))
app.post('/register', UserController.createOne)
app.post('/room', UserController.createRoom)
app.post('/enterroom', UserController.enterRoom)
app.get('/rooms', UserController.find)

io.on('connection', (socket) => {
  console.log( socket.client.conn.server.clientsCount + " users connected" );
  socket.on('add-rooms', data => {
    socket.broadcast.emit('add-room-others', data)
  })
  socket.on('add-rooms-player', data => {
    socket.broadcast.emit('add-rooms-player-others', data)
  })
  socket.on('player-ready-count', () => {
    socket.broadcast.emit('adding-ready-player')
  })
  socket.on('start-game', (data) => {
    console.log('Game Start !')
    socket.broadcast.emit('start-game-other', data)
  })
  socket.on('answer-correct', (data) => {
    socket.broadcast.emit('other-alr-answer', data)
  })
  socket.on('get-winner', (msg) => {
    socket.broadcast.emit('get-winner-alr', msg)
  })
  socket.on('play-again', () => {
    socket.broadcast.emit('play-again-other')
  })
});

http.listen(port, () => {
  console.log(`listening on *:${port}`);
});