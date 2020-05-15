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