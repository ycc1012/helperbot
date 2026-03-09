const { GoalFollow } = require('mineflayer-pathfinder').goals

module.exports = {
  name: 'follow',
  version: '1.0.0',
  
  onLoad(bot, pathfinder) {
    console.log('  - follow 插件已加载')
  },
  
  onChat(sender, message, command, args, bot) {
    // follow <玩家>
    if (command === 'follow') {
      const targetName = args.length === 0 ? sender : args[0]
      const target = bot.players[targetName]
      
      if (!target || !target.entity) {
        bot.chat(`找不到玩家: ${targetName}`)
        return true
      }
      
      bot.pathfinder.setGoal(new GoalFollow(target.entity, 3), true)
      bot.chat(`正在跟随 ${targetName}`)
      return true
    }
    
    // follow.stop
    if (command === 'follow.stop') {
      bot.pathfinder.setGoal(null)
      bot.chat('已停止跟随')
      return true
    }
  }
}
