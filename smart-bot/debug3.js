/**
 * 智能 Bot - 更深度调试
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
  if (tickCount % 40 === 0) {  // 每2秒
    console.log(`\n=== Tick ${tickCount} ===`)
    console.log('Bot pos:', bot.entity?.position)
    console.log('Entities:', Object.keys(bot.entities))
    console.log('Players:', Object.keys(bot.players))
    
    // 手动测试找玩家
    const players = Object.values(bot.players).filter(p => p.entity && p.username !== 'SmartBot2')
    console.log('Players with entity:', players.map(p => p.username))
    
    if (players.length > 0) {
      const target = players[0]
      console.log('First target:', target.username, target.entity?.position)
    }
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
