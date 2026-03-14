/**
 * 智能 Bot - 修复版
 * 手动设置跟随目标
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
  
  // 直接创建 follow 和 look 行为
  const followPlayer = new BehaviorFollowEntity(bot, targets)
  const lookAtPlayer = new BehaviorLookAtEntity(bot, targets)
  
  // 空闲状态（用于没有目标时）
  const idle = {
    stateName: 'idle',
    active: false,
    onStateEntered: () => {},
    onStateExited: () => {}
  }
  
  const transitions = [
    // 有目标时跟随
    new StateTransition({
      parent: idle,
      child: followPlayer,
      shouldTransition: () => targets.entity !== undefined
    }),
    // 距离小于2格时看向玩家
    new StateTransition({
      parent: followPlayer,
      child: lookAtPlayer,
      shouldTransition: () => followPlayer.distanceToTarget() < 2
    }),
    // 距离大于等于2格时跟随
    new StateTransition({
      parent: lookAtPlayer,
      child: followPlayer,
      shouldTransition: () => lookAtPlayer.distanceToTarget() >= 2
    }),
    // 没目标时回到空闲
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

// 每 tick 查找最近玩家并更新目标
bot.on('physicsTick', () => {
  tickCount++
  
  // 每秒更新一次目标
  if (tickCount % 20 === 0 && !targets.entity) {
    // 找最近玩家
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
    
    if (closest) {
      targets.entity = closest.entity
      console.log(`Following ${closest.username}, distance: ${closestDist.toFixed(1)}`)
    }
  }
  
  if (stateMachine) {
    stateMachine.update()
  }
})

bot.on('chat', (username, message) => {
  if (username === bot.username) return
  
  const msg = message.toLowerCase()
  
  // 手动设置跟随目标
  if (msg.includes('follow') || msg.includes('跟随') || msg.includes('come')) {
    const player = bot.players[username]
    if (player && player.entity) {
      targets.entity = player.entity
      bot.chat(`好的 ${username}，我来跟随你！`)
    }
  }
  
  // 停止跟随
  if (msg.includes('stop') || msg.includes('停止')) {
    targets.entity = undefined
    bot.pathfinder.setGoal(null)
    bot.chat(`好的，我停下了。`)
  }
  
  console.log(`<${username}> ${message}`)
})

console.log('SmartBot2 starting...')
