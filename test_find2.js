const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
  host: '111.231.77.118',
  port: 25565,
  username: 'TestBot2'
})

bot.on('spawn', () => {
  console.log('Spawned at:', bot.entity.position)
  
  const mcData = require('minecraft-data')(bot.version)
  const stoneId = mcData.blocksByName['stone'].id
  
  console.log('Looking for stone id:', stoneId)
  
  const pos = bot.entity.position
  const searchRadius = 8
  
  // 只检查脚下的方块
  const below = bot.blockAt({ x: Math.floor(pos.x), y: Math.floor(pos.y) - 1, z: Math.floor(pos.z) })
  console.log('Below bot:', below)
  console.log('Below type:', below ? below.type : 'null')
  console.log('Below name:', below ? below.name : 'null')
  
  // 检查周围
  for (let dx = -2; dx <= 2; dx++) {
    for (let dy = -2; dy <= 4; dy++) {
      for (let dz = -2; dz <= 2; dz++) {
        try {
          const p = { x: Math.floor(pos.x) + dx, y: Math.floor(pos.y) + dy, z: Math.floor(pos.z) + dz }
          const block = bot.blockAt(p)
          
          if (block && block.type) {
            console.log(`(${dx},${dy},${dz}) type=${block.type} name=${block.name || 'unknown'}`)
          }
        } catch (e) {
          // ignore
        }
      }
    }
  }
  
  console.log('Done')
  process.exit(0)
})

setTimeout(() => process.exit(1), 15000)
