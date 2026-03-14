/**
 * 智能 Bot - 状态机版本
 * 支持跟随、挖矿等行为
 */
const mineflayer = require('mineflayer')
const pathfinder = require('mineflayer-pathfinder').pathfinder
const statemachine = require('mineflayer-statemachine')

const StateMachine = statemachine.BotStateMachine
const StateTransition = statemachine.StateTransition
const BehaviorIdle = statemachine.BehaviorIdle
const BehaviorFollowEntity = statemachine.BehaviorFollowEntity
const BehaviorGetClosestEntity = statemachine.BehaviorGetClosestEntity
const EntityFilters = statemachine.EntityFilters

const bot = mineflayer.createBot({
  host: '111.231.77.118',
  port: 25565,
  username: 'SmartBot',
  version: '1.21.11'
})

bot.loadPlugin(pathfinder)

// 目标对象 - 用于状态间共享信息
const targets = {}

// 创建行为
const idle = new BehaviorIdle()
const getClosestPlayer = new BehaviorGetClosestEntity(bot, targets, EntityFilters().PlayersOnly)
const followPlayer = new BehaviorFollowEntity(bot, targets)

// 创建转换
const transitions = [
  // 空闲 → 找玩家
  new StateTransition({
    parent: idle,
    child: getClosestPlayer,
    name: 'idle_to_find',
    shouldTransition: () => true  // 一直检查
  }),
  // 找到玩家 → 跟随
  new StateTransition({
    parent: getClosestPlayer,
    child: followPlayer,
    name: 'find_to_follow',
    shouldTransition: () => targets.entity !== undefined
  }),
  // 没找到玩家 → 空闲
  new StateTransition({
    parent: getClosestPlayer,
    child: idle,
    name: 'find_to_idle',
    shouldTransition: () => targets.entity === undefined
  }),
  // 跟随中距离太近 → 空闲
  new StateTransition({
    parent: followPlayer,
    child: idle,
    name: 'follow_to_idle',
    shouldTransition: () => followPlayer.distanceToTarget() < 2
  })
]

// 创建状态机
const stateMachine = new StateMachine(transitions, idle, 'SmartBot')

bot.on('spawn', () => {
  console.log(`SmartBot logged in as ${bot.username}`)
  // 启动状态机
  bot.on('physicsTick', () => {
    stateMachine.update()
  })
})

// 监听玩家指令
bot.on('chat', (username, message) => {
  if (username === bot.username) return
  
  const msg = message.toLowerCase()
  
  // 跟随指令
  if (msg.includes('follow') || msg.includes('跟随') || msg.includes('过来')) {
    // 手动触发找玩家
    getClosestPlayer.onStateEntered()
    const player = bot.players[username]
    if (player) {
      targets.entity = player.entity
      bot.chat(`好的 ${username}，我来跟随你！`)
    }
  }
  
  // 停止跟随
  if (msg.includes('stop') || msg.includes('停止') || msg.includes('别跟')) {
    targets.entity = undefined
    bot.chat(`好的，我停下了。`)
  }
  
  // 聊天消息
  console.log(`<${username}> ${message}`)
})

console.log('SmartBot starting...')
