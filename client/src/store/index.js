import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    firstNumber : 1,
    secondNumber : 1,
    gameOn : false,
    sign : ['+', '✕', '-'],
    index : 0,
    winnerFound : false,
    scoreWin : 5
  },
  mutations: {
    startGame(state){
      state.gameOn = true
    },
    updateNumber(state, payload){
      state.firstNumber = payload.num1
      state.secondNumber = payload.num2
      state.index = payload.index
    },
    getWinner(state){
      state.winnerFound = true
    },
    setUp(state){
      state.firstNumber = 0
      state.secondNumber = 0
      state.gameOn = false
      state.winnerFound = false
    },
    
  },
  actions: {
    startGame(context){
      context.commit('startGame')
    },
    updateNumber(context, payload){
      context.commit('updateNumber', payload)
    },
    getWinner(context){
      context.commit('getWinner')
    },
    playAgain(context){
      context.commit('setUp')
    },
  },
  modules: {
  }
})
