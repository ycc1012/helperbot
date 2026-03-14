/**
 * 智能 Bot - 状态机调试版
 */
const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
  host: '111.231.77.118',
  port: 25565,
  username: 'SmartBot2',
  version: '1.21.11'
})

bot.loadPlugin(require('mineflayer-pathfinder').pathfinder)

let stateMachine = null
let tickCount = 0

bot.once('spawn', () => {
  console.log(`SmartBot2 logged in`)
  
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
  stateMachine = new BotStateMachine(bot, rootLayer, 'stateMachine')
  
  console.log('State machine created')
})

// 每 tick 输出调试信息
bot.on('physicsTick', () => {
  tickCount++
  if (tickCount % 20 === 0) {  // 每秒一次
    console.log(`Tick ${tickCount}, Bot pos:`, bot.entity?.position)
    console.log('Players:', Object.keys(bot.players))
  }
  
  if (stateMachine) {
    stateMachine.update()
  }
})

bot.on('chat', (username, message) => {
  if (username === bot.username) return
  console.log(`<${username}> ${message}`)
})

console.log('SmartBot2 starting...')
