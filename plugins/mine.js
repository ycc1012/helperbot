const { GoalNear } = require('mineflayer-pathfinder').goals

module.exports = {
  name: 'mine',
  version: '1.2.0',
  
  state: {
    mining: false,
    targetBlock: null,
    targetPos: null,
    count: 0,
    maxCount: 999999,
    miningInterval: null,
    strategy: 'tunnel',  // tunnel, stairs, layer
    strategyIndex: 0,
    strategies: ['tunnel', 'stairs', 'layer'],
    lastMinedPos: null
  },
  
  onLoad(bot, pathfinder) {
    console.log('  - mine 插件已加载')
  },
  
  onChat(sender, message, command, args, bot) {
    // mine <方块> [数量]
    if (command === 'mine') {
      if (this.state.miningInterval) {
        clearInterval(this.state.miningInterval)
        this.state.miningInterval = null
      }
      this.state.mining = false
      bot.pathfinder.setGoal(null)
      
      const lastArg = args[args.length - 1]
      const count = !isNaN(lastArg) ? parseInt(lastArg) : 999999
      const blockName = !isNaN(lastArg) ? args.slice(0, -1).join(' ') : args.join(' ')
      
      if (!blockName) {
        bot.chat('用法: mine <方块> [数量]')
        return true
      }
      
      this.state.count = 0
      this.state.maxCount = count
      this.state.targetBlock = blockName
      this.state.mining = true
      this.state.strategyIndex = 0
      this.state.strategy = 'tunnel'
      this.state.lastMinedPos = null
      
      bot.chat(`开始挖掘 ${blockName}，目标 ${count} 个`)
      
      this.doMine(bot, blockName)
      return true
    }
    
    if (command === 'mine.stop') {
      if (this.state.miningInterval) {
        clearInterval(this.state.miningInterval)
        this.state.miningInterval = null
      }
      this.state.mining = false
      bot.pathfinder.setGoal(null)
      bot.chat(`已停止挖掘，共挖了 ${this.state.count} 个`)
      return true
    }
    
    if (command === 'mine.status') {
      if (this.state.mining) {
        bot.chat(`正在挖掘: ${this.state.targetBlock}, 已挖 ${this.state.count} 个, 当前策略: ${this.state.strategy}`)
      } else {
        bot.chat('未在挖掘')
      }
      return true
    }
  },
  
  async doMine(bot, blockName) {
    const self = this
    
    const mineOnce = async function() {
      if (!self.state.mining) return
      if (self.state.count >= self.state.maxCount) {
        bot.chat(`挖掘完成！共 ${self.state.count} 个`)
        self.state.mining = false
        return
      }
      
      await bot.waitForChunksToLoad()
      
      const mcData = require('minecraft-data')(bot.version)
      const blockData = mcData.blocksByName[blockName]
      
      if (!blockData) {
        bot.chat(`未知的方块: ${blockName}`)
        self.state.mining = false
        return
      }
      
      const blockId = blockData.id
      const pos = bot.entity.position
      const searchRadius = 8
      let found = null
      
      // 尝试所有策略，直到找到方块
      const strategies = self.state.strategies
      const startIndex = self.state.strategyIndex
      
      for (let i = 0; i < strategies.length; i++) {
        const idx = (startIndex + i) % strategies.length
        const strategy = strategies[idx]
        
        if (strategy === 'tunnel') {
          found = self.findForTunnel(bot, pos, blockId, searchRadius)
        } else if (strategy === 'stairs') {
          found = self.findForStairs(bot, pos, blockId, searchRadius)
        } else {
          found = self.findForLayer(bot, pos, blockId, searchRadius)
        }
        
        if (found) {
          if (strategy !== self.state.strategy) {
            bot.chat(`切换策略: ${strategy}`)
            self.state.strategy = strategy
          }
          self.state.strategyIndex = idx
          break
        }
      }
      
      if (!found) {
        bot.chat(`范围内没有更多 ${blockName}`)
        self.state.mining = false
        return
      }
      
      self.state.targetPos = found
      
      // 寻路到方块旁边
      bot.pathfinder.setGoal(new GoalNear(found.x, found.y, found.z, 1))
      
      // 等待到达后挖掘
      const checkInterval = setInterval(async function() {
        if (!self.state.mining) {
          clearInterval(checkInterval)
          return
        }
        
        const dist = bot.entity.position.distanceTo(found)
        if (dist < 2) {
          clearInterval(checkInterval)
          
          bot.pathfinder.setGoal(null)
          await new Promise(r => setTimeout(r, 500))
          
          try {
            const targetBlockPos = bot.entity.position.offset(
              found.x - Math.floor(bot.entity.position.x),
              found.y - Math.floor(bot.entity.position.y),
              found.z - Math.floor(bot.entity.position.z)
            )
            const block = bot.blockAt(targetBlockPos)
            
            if (block && block.type === blockId) {
              await bot.dig(block)
              self.state.count++
              self.state.lastMinedPos = found
              bot.chat(`已挖掘 ${self.state.count}/${self.state.maxCount}`)
              
              if (self.state.count < self.state.maxCount) {
                setTimeout(() => mineOnce(), 800)
              }
            }
          } catch (err) {
            console.log('挖掘中断:', err.message)
            setTimeout(() => mineOnce(), 1000)
          }
        }
      }, 500)
    }
    
    mineOnce()
  },
  
  // 隧道策略：优先找同一高度前方
  findForTunnel(bot, pos, blockId, radius) {
    // 同一高度
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dz = -radius; dz <= radius; dz++) {
        const targetPos = pos.offset(dx, 0, dz)
        const block = bot.blockAt(targetPos)
        if (block && block.type === blockId) {
          return { x: Math.floor(targetPos.x), y: Math.floor(targetPos.y), z: Math.floor(targetPos.z) }
        }
      }
    }
    
    // 上下1格
    for (let dy = -1; dy <= 1; dy++) {
      if (dy === 0) continue
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dz = -radius; dz <= radius; dz++) {
          const targetPos = pos.offset(dx, dy, dz)
          const block = bot.blockAt(targetPos)
          if (block && block.type === blockId) {
            return { x: Math.floor(targetPos.x), y: Math.floor(targetPos.y), z: Math.floor(targetPos.z) }
          }
        }
      }
    }
    
    return null
  },
  
  // 楼梯策略：优先找下方
  findForStairs(bot, pos, blockId, radius) {
    // 先找下方
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        const targetPos = pos.offset(dx, -1, dz)
        const block = bot.blockAt(targetPos)
        if (block && block.type === blockId) {
          return { x: Math.floor(targetPos.x), y: Math.floor(targetPos.y), z: Math.floor(targetPos.z) }
        }
      }
    }
    
    // 再找同一高度
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dz = -radius; dz <= radius; dz++) {
        const targetPos = pos.offset(dx, 0, dz)
        const block = bot.blockAt(targetPos)
        if (block && block.type === blockId) {
          return { x: Math.floor(targetPos.x), y: Math.floor(targetPos.y), z: Math.floor(targetPos.z) }
        }
      }
    }
    
    return null
  },
  
  // 平铺策略：找最近的（除了脚下）
  findForLayer(bot, pos, blockId, radius) {
    let found = null
    let minDist = radius + 1
    
    // 优先上方
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = 1; dy <= radius; dy++) {
        for (let dz = -radius; dz <= radius; dz++) {
          const targetPos = pos.offset(dx, dy, dz)
          const block = bot.blockAt(targetPos)
          if (block && block.type === blockId) {
            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz)
            if (dist < minDist) {
              minDist = dist
              found = { x: Math.floor(targetPos.x), y: Math.floor(targetPos.y), z: Math.floor(targetPos.z) }
            }
          }
        }
      }
    }
    
    // 同一高度（不挖脚下）
    if (!found) {
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dz = -radius; dz <= radius; dz++) {
          if (dx === 0 && dz === 0) continue
          const targetPos = pos.offset(dx, 0, dz)
          const block = bot.blockAt(targetPos)
          if (block && block.type === blockId) {
            const dist = Math.sqrt(dx*dx + dz*dz)
            if (dist < minDist) {
              minDist = dist
              found = { x: Math.floor(targetPos.x), y: Math.floor(targetPos.y), z: Math.floor(targetPos.z) }
            }
          }
        }
      }
    }
    
    return found
  }
}
