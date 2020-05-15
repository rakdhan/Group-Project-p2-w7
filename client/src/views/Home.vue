<template>
  <div class="content">
    <iframe src="../assets/clock-ticking-1.wav" allow="autoplay" id="audio" style="display:none"></iframe>
    <audio id="audio" controls loop hidden allow="autoplay" autoplay="autoplay">
      <source src="../assets/clock-ticking-1.wav" type="audio/mp3" />
    </audio>
    <div class="home fix-width" v-if="!name">
      <form @submit.prevent="submitName">
        <input type="text" placeholder="Enter your nickname" v-model="inputName" />
        <input type="submit" value="Enter room" />
      </form>
      <div class="rules">
        How to play this game?
        <br />
        <br />
        <span class="rules-detail">Calculate quickly before others do</span>
      </div>
    </div>

    <div class="room-list" v-if="name && !enterRoom">
      <h1>Room List</h1>
      <div class="home" style="margin-bottom: 20px">
        <form @submit.prevent="createRoom">
          <input
            type="text"
            placeholder="Enter your room name"
            style="font-size: 17px"
            v-model="roomName"
          />
          <input type="submit" value="Create room" />
        </form>
      </div>
      <ul>
        <li v-for="(room,index) in this.rooms" :key="index">
          <span class="room-name" @click="enteringRoom(room, index, room.id)">{{ room.name }}</span>
          - {{room.players.length}}/2
        </li>
      </ul>
    </div>

    <div class="on-room" v-if="enterRoom && !this.$store.state.gameOn">
      <h1>Room - {{ currentRoomName }}</h1>
      <h3 style="font-family: monospace">Player List</h3>
      <ul>
        <li
          v-for="(player,index) in this.rooms[indexRoom].players"
          :key="index"
          style="font-size: 18px"
        >{{ player }}</li>
      </ul>
      <button class="start-button" @click="startGame" v-if="master">Start a game</button>
      <button class="start-button" @click="readyStatus" v-if="!master">Ready</button>
    </div>

    <div v-if="this.$store.state.gameOn && !this.$store.state.winnerFound">
      <div
        class="question-section"
      >{{ this.$store.state.firstNumber}} {{ this.$store.state.sign[this.$store.state.index]}} {{ this.$store.state.secondNumber }}</div>
      <form id="form-answer" @submit.prevent="submitAnswer">
        <p class="broadcast-message">{{ this.$store.state.broadcastMsg }}</p>
        <input type="number" autofocus v-model="answer" ref="answer" />
        <input type="submit" value="Answer" />
      </form>
    </div>

    <div v-if="this.$store.state.winnerFound" class="question-section message-win">
      {{ message }}
      <br />
      <button class="play-again-button" @click="playAgain">Play again</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import io from 'socket.io-client'
import Swal from 'sweetalert2'
const url = 'http://localhost:3000'
const socket = io(url)

export default {
  name: 'Home',
  data(){
    return{
      answer : null,
      name: null,
      score : 0,
      message : '',
      inputName: null,
      enterRoom: false,
      roomName: null,
      rooms: [],
      currentRoomName : null,
      master : false,
      indexRoom : 0,
      ready : false,
      readyCount : 0,
      id : 0,
      currentRoomId: -1,
    }
  },
  methods: {
    submitName(){
      if(!this.inputName){
        return false
      }
      else{
        this.name = this.inputName
        axios({
          method: 'POST',
          url: url + '/register',
          data: {name : this.name}
        })
        .then( user => {
          this.id = user.data.id
        })
      }
      this.rooms = []
      axios({
        method: 'GET',
        url: url + '/rooms',
      })
      .then( room => {
        for(let i = 0; i < room.data.length; i++){
          let tempUser = []
          for(let j = 0; j < room.data[i].Users.length; j++){
            tempUser.push(room.data[i].Users[j].name)
          }
          let obj = {id: room.data[i].id, name: room.data[i].name, master: room.data[i].masterId, players : tempUser}
          this.rooms.push(obj)
        }
      })
    },
    createRoom(){
      axios({
        method: 'POST',
        url: url + '/room',
        data: {name : this.roomName, masterId : this.id}
      })
      .then( (room) => {
        console.log(room.data.id)
        this.$toasted.success('Success created room')
        this.rooms.push({id: room.data.id, name : this.roomName, master: this.id, players: []})
        socket.emit('add-rooms', {id: room.data.id, name : this.roomName, master: this.id, players: []})
        this.roomName = null
      })
    },
    enteringRoom(detail, index, id){
      if(detail.players.length === 2){
        this.$toasted.error('Room is full')
        return false
      } 
      axios({
        method: 'POST',
        url : url + '/enterroom',
        data: {UserId: this.id, RoomId: id}
      })
      this.currentRoomId = id
      this.currentRoomName = detail.name
      if(this.id == detail.master) this.master = true
      this.rooms[index].players.push(this.name)
      socket.emit('add-rooms-player', {id: id, name: this.name})
      this.indexRoom = index
      this.enterRoom = true
    },
    readyStatus(){
      if(!this.ready){
        this.ready = true
        this.readyCount++
        socket.emit('player-ready-count')
      }
    },
    startGame(){
      if(this.readyCount == 1){
        const firstNumber = Math.floor(Math.random()* 98) + 1
        const secondNumber = Math.floor(Math.random()* 98) + 1
        const newIndex = Math.floor(Math.random()* 3) 
        this.$store.dispatch('updateNumber', {num1 : firstNumber, num2 : secondNumber, index: newIndex})
        this.$store.dispatch('startGame')
        socket.emit('start-game', {num1 : firstNumber, num2 : secondNumber, index: newIndex, id: this.currentRoomId})
      } else {
        this.$toasted.error('All player are not ready yet')
        return false
      }
    },
    submitAnswer(){
      this.checkAnswer(Number(this.answer))
      this.answer = ''
      this.$refs.answer.focus()
    },
    checkAnswer(ans){
      let expectedAnswer
      if(this.$store.state.index === 0){
        expectedAnswer = this.$store.state.firstNumber + this.$store.state.secondNumber
      } else if(this.$store.state.index === 1){
        expectedAnswer = this.$store.state.firstNumber * this.$store.state.secondNumber
      } else if(this.$store.state.index === 2){
        expectedAnswer = this.$store.state.firstNumber - this.$store.state.secondNumber
      }
      if(ans === expectedAnswer){
        this.score++
        const firstNumber = Math.floor(Math.random()* 98) + 1
        const secondNumber = Math.floor(Math.random()* 98) + 1
        const newIndex = Math.floor(Math.random()* 3) 
        this.$store.dispatch('updateNumber', {num1 : firstNumber, num2 : secondNumber, index : newIndex})
        socket.emit('answer-correct', {num1 : firstNumber, num2 : secondNumber, index : newIndex})
      } else {
        this.$toasted.error('Your answer is incorrect')
      }
      if(this.score === this.$store.state.scoreWin){
        socket.emit('get-winner', {message: `${this.name}  WIN`, id: this.currentRoomId})
        this.$store.dispatch('getWinner')
        this.message = `YOU WIN`
        Swal.fire({
          title: 'YOU WIN!',
          width: 600,
          padding: '3em',
          background: '#fff url(/images/trees.png)',
          backdrop: `
            rgba(0,0,123,0.4)
            url("https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/i/4bb2c927-94be-4686-97f1-85e57067dc6f/dc6quci-78b421db-9957-4efe-949c-73b7d6ffaf94.gif")
            left top
            repeat
          `
        })
      }
    },
    playAgain(){
      this.score = 0 
      this.readyCount = 0
      this.ready = false
      this.$store.dispatch('playAgain')
      socket.emit('play-again')
    }
  },
  created(){
    socket.on('all-rooms', data => {
      this.rooms = data
    })
    socket.on('add-room-others', () => {
      this.rooms = []
      axios({
        method: 'GET',
        url: url + '/rooms',
      })
      .then( room => {
        for(let i = 0; i < room.data.length; i++){
          let tempUser = []
          for(let j = 0; j < room.data[i].Users.length; j++){
            tempUser.push(room.data[i].Users[j].name)
          }
          let obj = {id: room.data[i].id, name: room.data[i].name, master: room.data[i].masterId, players : tempUser}
          this.rooms.push(obj)
        }
      })
    })
    socket.on('add-rooms-player-others', data => {
      for(let i = 0; i < this.rooms.length; i++){
        if(this.rooms[i].id == data.id){
          this.rooms[i].players.push(data.name)
        }
      }
    })
    socket.on('adding-ready-player', () => {
      this.readyCount++
    })
    socket.on('start-game-other', (data) => {
      const {num1, num2, index, id} = data
      if(this.currentRoomId == id){
        this.$store.dispatch('updateNumber', {num1, num2, index})
        this.$store.dispatch('startGame')
      }
    })
    socket.on('other-alr-answer', (data) => {
      const {num1, num2, index} = data
      this.$store.dispatch('updateNumber', {num1, num2, index})
      this.answer = null
    })
    socket.on('get-winner-alr', (data) => {
      if(this.currentRoomId == data.id){
        this.$store.dispatch('getWinner')
        this.message = data.message
      }
    })
    socket.on('play-again-other', () => {
      this.score = 0
      this.readyCount = 0
      this.ready = false
      this.$store.dispatch('playAgain')
    })
  }
}
</script>

<style scoped>
.home {
  width: 30%;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
}
.rules {
  border: 1px solid black;
  padding: 20px;
  border-radius: 8px;
  margin-top: 10px;
}
.rules-detail {
  font-family: monospace;
  font-weight: bold;
  font-size: 18px;
}
.question-section {
  font-size: 120px;
  position: absolute;
  left: 50%;
  top: 30%;
  transform: translate(-50%, -30%);
}
.message-win {
  font-family: fantasy;
  font-weight: bold;
  font-size: 50px;
}
#form-answer {
  position: absolute;
  bottom: 5%;
  left: 50%;
  transform: translate(-50%, 0);
  width: 60%;
}
ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

ul li {
  font-size: 18px;
  font-family: monospace;
  font-weight: bold;
  margin-top: 10px;
}
.room-name {
  cursor: pointer;
}
.room-name:hover {
  color: blue;
}
.start-button,
.play-again-button {
  margin-top: 20px;
  background-color: blue;
  color: white;
  border-radius: 10px;
  padding: 10px;
  font-size: 20px;
  font-family: monospace;
}

input[type="number"],
input[type="text"],
select {
  text-align: center;
  font-size: 30px;
  width: 100%;
  padding: 12px 20px;
  margin: 8px 0;
  display: inline-block;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

input[type="submit"] {
  width: 100%;
  background-color: #4caf50;
  color: white;
  padding: 14px 20px;
  margin: 8px 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

input[type="submit"]:hover {
  background-color: #45a049;
}
</style>