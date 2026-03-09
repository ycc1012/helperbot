module.exports = {
  name: 'find',
  version: '1.0.0',
  
  onLoad(bot, pathfinder) {
    console.log('  - find 插件已加载')
  },
  
  onChat(sender, message, command, args, bot) {
    if (command === 'find') {
      const blockName = args.join(' ')
      
      if (!blockName) {
        bot.chat('用法: find <方块名>')
        return true
      }
      
      bot.chat('搜索中...')
      
      // 使用 async 函数处理
      this.findBlockAsync(bot, blockName).catch(err => {
        bot.chat(`搜索出错: ${err.message}`)
      })
      
      return true
    }
  },
  
  async findBlockAsync(bot, blockName) {
    // 等待区块加载
    await bot.waitForChunksToLoad()
    
    const mcData = require('minecraft-data')(bot.version)
    const blockData = mcData.blocksByName[blockName]
    
    if (!blockData) {
      bot.chat(`未知的方块: ${blockName}`)
      return
    }
    
    const blockId = blockData.id
    const pos = bot.entity.position
    const searchRadius = 16
    let found = null
    let minDist = searchRadius + 1
    
    for (let dx = -searchRadius; dx <= searchRadius; dx++) {
      for (let dy = -searchRadius; dy <= searchRadius; dy++) {
        for (let dz = -searchRadius; dz <= searchRadius; dz++) {
          try {
            const targetPos = pos.offset(dx, dy, dz)
            const block = bot.blockAt(targetPos)
            
            if (block && block.type === blockId) {
              const dist = Math.sqrt(dx*dx + dy*dy + dz*dz)
              if (dist < minDist) {
                minDist = dist
                found = { 
                  x: Math.floor(targetPos.x), 
                  y: Math.floor(targetPos.y), 
                  z: Math.floor(targetPos.z) 
                }
              }
            }
          } catch (e) {
            // ignore
          }
        }
      }
    }
    
    if (found) {
      bot.chat(`找到 ${blockName} at (${found.x}, ${found.y}, ${found.z}), dist ${minDist.toFixed(1)}`)
    } else {
      bot.chat(`范围内找不到 ${blockName}`)
    }
  }
}
