/**
 * 智能 Bot - 简单跟随版本
 * 使用 mineflayer-pathfinder 实现跟随
 */
const mineflayer = require('mineflayer')
const { pathfinder, goals } = require('mineflayer-pathfinder')

const bot = mineflayer.createBot({
  host: '111.231.77.118',
  port: 25565,
  username: 'SmartBot',
  version: '1.21.11'
})

// 注入 pathfinder 插件（pathfinder 本身就是 inject 函数）
bot.loadPlugin(pathfinder)

// 跟随目标
let followTarget = null
let isFollowing = false

bot.on('spawn', () => {
  console.log(`SmartBot logged in as ${bot.username}`)
})

// 跟随逻辑
function updateFollow() {
  if (!followTarget || !isFollowing) return
  
  const player = bot.players[followTarget]
  if (!player || !player.entity) {
    bot.chat(`找不到玩家 ${followTarget}`)
    isFollowing = false
    followTarget = null
    return
  }
  
  const pos = player.entity.position
  const dist = bot.entity.position.distanceTo(pos)
  
  if (dist > 2) {
    // 移动到玩家附近
    bot.pathfinder.setGoal(new goals.GoalNear(pos.x, pos.y, pos.z, 2))
  } else {
    // 已到达，停止移动
    bot.pathfinder.setGoal(null)
  }
}

// 每tick检查
bot.on('physicsTick', () => {
  updateFollow()
})

// 监听玩家指令
bot.on('chat', (username, message) => {
  if (username === bot.username) return
  
  const msg = message.toLowerCase()
  
  // 跟随指令
  if (msg.includes('follow') || msg.includes('跟随') || msg.includes('过来') || msg.includes('come')) {
    followTarget = username
    isFollowing = true
    bot.chat(`好的 ${username}，我来跟随你！`)
  }
  
  // 停止跟随
  if (msg.includes('stop') || msg.includes('停止') || msg.includes('stay') || msg.includes('别跟')) {
    isFollowing = false
    followTarget = null
    bot.pathfinder.setGoal(null)
    bot.chat(`好的，我停下了。`)
  }
  
  console.log(`<${username}> ${message}`)
})

console.log('SmartBot starting...')
