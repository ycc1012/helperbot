/**
 * 智能 Bot - 状态机版本 (正确用法)
 * 根据官方 README 编写
 */
const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
  host: '111.231.77.118',
  port: 25565,
  username: 'SmartBot2',
  version: '1.21.11'
})

// 先加载 pathfinder
bot.loadPlugin(require('mineflayer-pathfinder').pathfinder)

// 状态机实例
let stateMachine = null

// 等待登录完成
bot.once('spawn', () => {
  console.log(`SmartBot2 logged in as ${bot.username}`)
  
  // 正确的 statemachine 导入
  const {
    StateTransition,
    BotStateMachine,
    EntityFilters,
    BehaviorFollowEntity,
    BehaviorLookAtEntity,
    BehaviorGetClosestEntity,
    NestedStateMachine
  } = require('mineflayer-statemachine')
  
  // targets 用于状态间传递数据
  const targets = {}
  
  // 创建状态
  const getClosestPlayer = new BehaviorGetClosestEntity(bot, targets, EntityFilters().PlayersOnly)
  const followPlayer = new BehaviorFollowEntity(bot, targets)
  const lookAtPlayer = new BehaviorLookAtEntity(bot, targets)
  
  // 创建转换
  const transitions = [
    // 找到玩家后立即跟随
    new StateTransition({
      parent: getClosestPlayer,
      child: followPlayer,
      shouldTransition: () => true
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
    })
  ]
  
  // 创建嵌套状态机层
  const rootLayer = new NestedStateMachine(transitions, getClosestPlayer)
  
  // 创建状态机
  stateMachine = new BotStateMachine(bot, rootLayer, 'stateMachine')
  
  console.log('State machine created')
})

// 每 tick 更新状态机
bot.on('physicsTick', () => {
  if (stateMachine) {
    stateMachine.update()
  }
})

// 监听玩家指令
bot.on('chat', (username, message) => {
  if (username === bot.username) return
  
  const msg = message.toLowerCase()
  
  if (msg.includes('stop')) {
    process.exit(0)
  }
  
  console.log(`<${username}> ${message}`)
})

console.log('SmartBot2 starting...')
