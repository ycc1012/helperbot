module.exports = {
  name: 'give',
  version: '1.0.0',
  
  onLoad(bot, pathfinder) {
    console.log('  - give 插件已加载')
  },
  
  onChat(sender, message, command, args, bot) {
    // give <玩家> <物品>
    if (command === 'give') {
      if (args.length < 1) {
        bot.chat('用法: give <玩家> <物品>')
        return true
      }
      
      const targetPlayer = args[0]
      const giveItem = args.slice(1).join(' ')
      
      if (!giveItem) {
        bot.chat('用法: give <玩家> <物品>')
        return true
      }
      
      // 使用服务器的 give 命令
      bot.chat(`/give ${targetPlayer} ${giveItem}`)
      bot.chat(`给 ${targetPlayer} ${giveItem}`)
      return true
    }
    
    // gimme <物品>
    if (command === 'gimme') {
      if (args.length < 1) {
        bot.chat('用法: gimme <物品>')
        return true
      }
      
      const giveItem = args.join(' ')
      bot.chat(`/give ${sender} ${giveItem}`)
      bot.chat(`给自己 ${giveItem}`)
      return true
    }
  }
}
