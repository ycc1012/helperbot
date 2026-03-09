const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
  host: '111.231.77.118',
  port: 25565,
  username: 'TestBot'
})

bot.on('spawn', () => {
  console.log('Spawned at:', bot.entity.position)
  
  const mcData = require('minecraft-data')(bot.version)
  console.log('MC Data loaded, version:', bot.version)
  console.log('stone id:', mcData.blocksByName['stone'])
  
  const pos = bot.entity.position
  const searchRadius = 5
  
  console.log('Searching...')
  
  for (let dx = -searchRadius; dx <= searchRadius; dx++) {
    for (let dy = -searchRadius; dy <= searchRadius; dy++) {
      for (let dz = -searchRadius; dz <= searchRadius; dz++) {
        try {
          const p = { x: pos.x + dx, y: pos.y + dy, z: pos.z + dz }
          const block = bot.blockAt(p)
          
          if (block && block.name) {
            console.log(`Found: ${block.name} at (${Math.floor(p.x)}, ${Math.floor(p.y)}, ${Math.floor(p.z)})`)
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

setTimeout(() => process.exit(1), 10000)
