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
let targets = {}
let tickCount = 0

bot.once('spawn', () => {
  console.log(`SmartBot2 logged in`)
  
  const {
    StateTransition,
    BotStateMachine,
    BehaviorFollowEntity,
    BehaviorLookAtEntity,
    NestedStateMachine
  } = require('mineflayer-statemachine')
  
  const followPlayer = new BehaviorFollowEntity(bot, targets)
  const lookAtPlayer = new BehaviorLookAtEntity(bot, targets)
  
  const idle = {
    stateName: 'idle',
    active: false,
    onStateEntered: () => {},
    onStateExited: () => {}
  }
  
  const transitions = [
    new StateTransition({
      parent: idle,
      child: followPlayer,
      shouldTransition: () => targets.entity !== undefined
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
    }),
    new StateTransition({
      parent: followPlayer,
      child: idle,
      shouldTransition: () => targets.entity === undefined
    })
  ]
  
  const rootLayer = new NestedStateMachine(transitions, idle)
  stateMachine = new BotStateMachine(bot, rootLayer, 'stateMachine')
  
  console.log('State machine created')
})

bot.on('physicsTick', () => {
  tickCount++
  
  // 每秒更新目标
  if (tickCount % 20 === 0) {
    let closest = null
    let closestDist = Infinity
    
    for (const player of Object.values(bot.players)) {
      if (player.username === 'SmartBot2') continue
      if (!player.entity) continue
      
      const dist = bot.entity.position.distanceTo(player.entity.position)
      if (dist < closestDist) {
        closestDist = dist
        closest = player
      }
    }
    
    if (closest && (!targets.entity || targets.entity.id !== closest.entity.id)) {
      targets.entity = closest.entity
      console.log(`Now following ${closest.username}, distance: ${closestDist.toFixed(1)}`)
    }
    
    // 输出 Bot 位置
    if (targets.entity && closest) {
      console.log(`Bot pos: ${bot.entity.position}, Target: ${closest.username} at ${closest.entity.position}`)
    }
  }
  
  if (stateMachine) {
    stateMachine.update()
  }
})

bot.on('chat', (username, message) => {
  if (username === bot.username) return
  
  const msg = message.toLowerCase()
  
  if (msg.includes('follow') || msg.includes('跟随') || msg.includes('come')) {
    const player = bot.players[username]
    if (player && player.entity) {
      targets.entity = player.entity
      bot.chat(`好的 ${username}，我来跟随你！`)
    }
  }
  
  if (msg.includes('stop') || msg.includes('停止')) {
    targets.entity = undefined
    bot.pathfinder.setGoal(null)
    bot.chat(`好的，我停下了。`)
  }
  
  console.log(`<${username}> ${message}`)
})

console.log('SmartBot2 starting...')
