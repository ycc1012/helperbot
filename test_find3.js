const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
  host: '111.231.77.118',
  port: 25565,
  username: 'TestBot3'
})

bot.on('spawn', () => {
  console.log('Spawned at:', bot.entity.position)
  
  const mcData = require('minecraft-data')(bot.version)
  const stoneId = mcData.blocksByName['stone'].id
  
  console.log('Looking for stone id:', stoneId)
  
  const pos = bot.entity.position
  
  // 新版本用 bot.world.getBlock
  console.log('bot.methods:', Object.keys(bot).slice(0, 20))
  
  if (bot.world && bot.world.getBlock) {
    console.log('Using bot.world.getBlock')
    
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 4; dy++) {
        for (let dz = -2; dz <= 2; dz++) {
          try {
            const x = Math.floor(pos.x) + dx
            const y = Math.floor(pos.y) + dy
            const z = Math.floor(pos.z) + dz
            
            const block = bot.world.getBlock(x, y, z)
            
            if (block && block.type) {
              console.log(`(${dx},${dy},${dz}) type=${block.type} name=${block.name || 'unknown'}`)
            }
          } catch (e) {
            // ignore
          }
        }
      }
    }
  } else {
    console.log('No bot.world.getBlock, checking other methods...')
    
    // 尝试其他方法
    if (bot.getBlock) {
      console.log('Using bot.getBlock')
    }
  }
  
  console.log('Done')
  process.exit(0)
})

setTimeout(() => process.exit(1), 15000)
