/**
 * 智能 Bot - 最终版
 * 直接用 pathfinder 实现跟随
 */
const mineflayer = require('mineflayer')
const { pathfinder, goals } = require('mineflayer-pathfinder')

const bot = mineflayer.createBot({
  host: '111.231.77.118',
  port: 25565,
  username: 'SmartBot2',
  version: '1.21.11'
})

bot.loadPlugin(pathfinder)

// 跟随目标
let followTarget = null
let isFollowing = false
let tickCount = 0

bot.on('spawn', () => {
  console.log(`SmartBot2 logged in as ${bot.username}`)
})

// 跟随逻辑
function updateFollow() {
  if (!followTarget || !isFollowing) return
  
  const player = bot.players[followTarget]
  if (!player || !player.entity) {
    bot.chat(`找不到玩家 ${followTarget}`)
    isFollowing = false
    followTarget = null
    bot.pathfinder.setGoal(null)
    return
  }
  
  const pos = player.entity.position
  const dist = bot.entity.position.distanceTo(pos)
  
  if (dist > 2) {
    // 移动到玩家附近
    const goal = new goals.GoalNear(pos.x, pos.y, pos.z, 2)
    bot.pathfinder.setGoal(goal)
    console.log(`Moving to ${followTarget}, dist: ${dist.toFixed(1)}`)
  } else {
    // 已到达，停止移动
    bot.pathfinder.setGoal(null)
    console.log(`Arrived at ${followTarget}, dist: ${dist.toFixed(1)}`)
  }
}

// 每tick检查
bot.on('physicsTick', () => {
  tickCount++
  if (isFollowing) {
    updateFollow()
  }
})

// 监听玩家指令
bot.on('chat', (username, message) => {
  if (username === bot.username) return
  
  const msg = message.toLowerCase()
  
  // 跟随指令
  if (msg.includes('follow') || msg.includes('跟随') || msg.includes('come') || msg.includes('过来')) {
    followTarget = username
    isFollowing = true
    bot.chat(`好的 ${username}，我来跟随你！`)
  }
  
  // 停止跟随
  if (msg.includes('stop') || msg.includes('停止')) {
    isFollowing = false
    followTarget = null
    bot.pathfinder.setGoal(null)
    bot.chat(`好的，我停下了。`)
  }
  
  console.log(`<${username}> ${message}`)
})

console.log('SmartBot2 starting...')
