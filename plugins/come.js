const { GoalNear } = require('mineflayer-pathfinder').goals

module.exports = {
  name: 'come',
  version: '1.0.0',
  
  onLoad(bot, pathfinder) {
    console.log('  - come 插件已加载')
  },
  
  onChat(sender, message, command, args, bot) {
    if (command === 'come') {
      const player = bot.players[sender]
      if (player && player.entity) {
        const { x, y, z } = player.entity.position
        bot.pathfinder.setGoal(new GoalNear(x, y, z, 2))
        bot.chat(`正在前往 ${sender}`)
      } else {
        bot.chat(`找不到 ${sender}`)
      }
      return true
    }
  }
}
