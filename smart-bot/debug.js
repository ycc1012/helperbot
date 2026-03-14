/**
 * 智能 Bot - 调试版本
 */
const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
  host: '111.231.77.118',
  port: 25565,
  username: 'SmartBot2',
  version: '1.21.11'
})

bot.loadPlugin(require('mineflayer-pathfinder').pathfinder)

bot.once('spawn', () => {
  console.log(`SmartBot2 logged in as ${bot.username}`)
  console.log('pathfinder:', typeof bot.pathfinder)
  console.log('setGoal:', typeof bot.pathfinder?.setGoal)
  
  const {
    StateTransition,
    BotStateMachine,
    EntityFilters,
    BehaviorFollowEntity,
    BehaviorLookAtEntity,
    BehaviorGetClosestEntity,
    NestedStateMachine
  } = require('mineflayer-statemachine')
  
  const targets = {}
  
  const getClosestPlayer = new BehaviorGetClosestEntity(bot, targets, EntityFilters().PlayersOnly)
  const followPlayer = new BehaviorFollowEntity(bot, targets)
  const lookAtPlayer = new BehaviorLookAtEntity(bot, targets)
  
  const transitions = [
    new StateTransition({
      parent: getClosestPlayer,
      child: followPlayer,
      shouldTransition: () => true
    }),
    new StateTransition({
      parent: followPlayer,
      child: lookAtPlayer,
      shouldTransition: () => followPlayer.distanceToTarget() < 2
    }),
    new StateTransition({
      parent: lookAtPlayer,
      child: followPlayer,
      shouldTransition: () => lookAtPlayer.distanceToTarget() >= 2
    })
  ]
  
  const rootLayer = new NestedStateMachine(transitions, getClosestPlayer)
  const stateMachine = new BotStateMachine(bot, rootLayer, 'stateMachine')
  
  console.log('State machine created')
  console.log('states:', rootLayer.states)
})

bot.on('physicsTick', () => {
  // 调试输出
})

bot.on('chat', (username, message) => {
  if (username === bot.username) return
  console.log(`<${username}> ${message}`)
})

console.log('SmartBot2 starting...')
