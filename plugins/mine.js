const { GoalNear } = require('mineflayer-pathfinder').goals

module.exports = {
  name: 'mine',
  version: '1.0.0',
  
  state: {
    mining: false,
    targetBlock: null,
    targetPos: null
  },
  
  onLoad(bot, pathfinder) {
    console.log('  - mine 插件已加载')
  },
  
  onChat(sender, message, command, args, bot) {
    if (command === 'mine') {
      const blockName = args.join(' ')
      
      if (!blockName) {
        bot.chat('用法: mine <方块> (如: mine log)')
        return true
      }
      
      bot.chat('开始挖掘...')
      
      this.startMiningAsync(bot, blockName).catch(err => {
        bot.chat(`挖掘出错: ${err.message}`)
      })
      
      return true
    }
    
    if (command === 'mine.resume') {
      if (this.state.targetBlock && this.state.targetPos) {
        this.resumeMining(bot)
      } else {
        bot.chat('没有可恢复的挖矿任务')
      }
      return true
    }
    
    if (command === 'mine.stop') {
      this.stopMining(bot)
      return true
    }
    
    if (command === 'mine.status') {
      if (this.state.mining && this.state.targetPos) {
        const p = this.state.targetPos
        bot.chat(`正在挖掘: ${this.state.targetBlock} at (${p.x}, ${p.y}, ${p.z})`)
      } else {
        bot.chat('未在挖掘')
      }
      return true
    }
  },
  
  async startMiningAsync(bot, blockName) {
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
          } catch (e) {}
        }
      }
    }
    
    if (!found) {
      bot.chat(`范围内找不到 ${blockName}`)
      return
    }
    
    this.state.mining = true
    this.state.targetBlock = blockName
    this.state.targetPos = found
    
    bot.chat(`找到 ${blockName}，距离 ${minDist.toFixed(1)}，前往中...`)
    
    // 寻路到方块
    bot.pathfinder.setGoal(new GoalNear(found.x, found.y, found.z, 1))
    
    // 等待后挖掘
    setTimeout(() => {
      if (!this.state.mining) return
      
      try {
        // 直接使用坐标偏移获取方块
        const dx = found.x - Math.floor(bot.entity.position.x)
        const dy = found.y - Math.floor(bot.entity.position.y)
        const dz = found.z - Math.floor(bot.entity.position.z)
        
        const targetPos = bot.entity.position.offset(dx, dy, dz)
        const block = bot.blockAt(targetPos)
        
        if (block) {
          bot.dig(block, (err) => {
            if (err) {
              bot.chat(`挖掘出错: ${err.message}`)
            } else {
              bot.chat(`${this.state.targetBlock} 已挖掘！`)
            }
            this.state.mining = false
          })
        }
      } catch (e) {
        bot.chat(`挖掘出错: ${e.message}`)
        this.state.mining = false
      }
    }, 4000)
  },
  
  resumeMining(bot) {
    if (!this.state.targetPos) return
    
    bot.chat('恢复挖矿...')
    const p = this.state.targetPos
    bot.pathfinder.setGoal(new GoalNear(p.x, p.y, p.z, 1))
  },
  
  stopMining(bot) {
    this.state.mining = false
    bot.pathfinder.setGoal(null)
    bot.chat('已停止挖掘')
  }
}
