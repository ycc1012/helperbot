module.exports = {
  name: 'give',
  version: '1.0.0',
  
  onLoad(bot, pathfinder) {
    console.log('  - give 插件已加载')
  },
  
  onChat(sender, message, command, args, bot) {
    // give <玩家> [物品] [数量]
    if (command === 'give') {
      if (args.length < 1) {
        bot.chat('用法: give <玩家> [物品] [数量]')
        return true
      }
      
      const targetPlayer = args[0]
      const lastArg = args[args.length - 1]
      const count = !isNaN(lastArg) ? parseInt(lastArg) : 1
      const itemName = args.length > 1 ? args.slice(1, count > 1 ? -1 : undefined).join(' ') : null
      
      this.giveItem(bot, sender, targetPlayer, itemName, count)
      return true
    }
    
    // gimme [物品] [数量]
    if (command === 'gimme') {
      const lastArg = args[args.length - 1]
      const count = !isNaN(lastArg) ? parseInt(lastArg) : 1
      const itemName = args.length > 1 && count > 1 ? args.slice(0, -1).join(' ') : args.join(' ')
      
      this.giveItem(bot, sender, sender, itemName, count)
      return true
    }
  },
  
  giveItem(bot, sender, targetPlayer, itemName, count = 1) {
    const items = bot.inventory.items()
    
    if (items.length === 0) {
      bot.chat('背包是空的')
      return
    }
    
    let targetItem = null
    
    if (itemName) {
      // 精确匹配
      targetItem = items.find(item => item.name.toLowerCase() === itemName.toLowerCase())
      
      // 包含匹配
      if (!targetItem) {
        targetItem = items.find(item => item.name.toLowerCase().includes(itemName.toLowerCase()))
      }
      
      if (!targetItem) {
        bot.chat(`没有找到: ${itemName}`)
        return
      }
    } else {
      // 随机物品
      targetItem = items[Math.floor(Math.random() * items.length)]
    }
    
    const giveCount = Math.min(count, targetItem.count)
    
    // 使用 toss 丢给玩家
    bot.toss(targetItem.type, null, giveCount, (err) => {
      if (err) {
        bot.chat(`出错: ${err.message}`)
      } else {
        bot.chat(`给 ${targetPlayer} ${giveCount}个 ${targetItem.name}`)
      }
    })
  }
}
