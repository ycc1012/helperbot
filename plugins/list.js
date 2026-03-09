module.exports = {
  name: 'list',
  version: '1.0.0',
  
  onLoad(bot, pathfinder) {
    console.log('  - list 插件已加载')
  },
  
  onChat(sender, message, command, args, bot) {
    if (command === 'list') {
      const items = bot.inventory.items()
      
      if (items.length === 0) {
        bot.chat('背包是空的')
        return true
      }
      
      const itemNames = items.map(item => `${item.name}(${item.count})`).join(', ')
      
      // 分片发送（避免消息太长）
      if (itemNames.length > 200) {
        bot.chat('背包物品:')
        const chunks = itemNames.match(/.{1,200}/g)
        for (const chunk of chunks) {
          bot.chat(chunk)
        }
      } else {
        bot.chat('背包: ' + itemNames)
      }
      
      return true
    }
  }
}
