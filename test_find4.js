const mineflayer = require('mineflayer')

const bot = mineflayer.createBot({
  host: '111.231.77.118',
  port: 25565,
  username: 'TestBot4'
})

bot.on('spawn', async () => {
  console.log('Spawned at:', bot.entity.position)
  
  // 等待区块加载
  console.log('Waiting for chunks to load...')
  await bot.waitForChunksToLoad()
  console.log('Chunks loaded')
  
  const mcData = require('minecraft-data')(bot.version)
  const stoneId = mcData.blocksByName['stone'].id
  console.log('Looking for stone id:', stoneId)
  
  const pos = bot.entity.position
  
  // 先检查脚下
  const below = bot.blockAt(pos.offset(0, -1, 0))
  console.log('Below bot:', below ? below.name : 'null', 'type:', below ? below.type : 'null')
  
  // 检查周围
  console.log('Searching around...')
  let found = null
  for (let dx = -3; dx <= 3; dx++) {
    for (let dy = -3; dy <= 3; dy++) {
      for (let dz = -3; dz <= 3; dz++) {
        try {
          const block = bot.blockAt(pos.offset(dx, dy, dz))
          if (block && block.name) {
            console.log(`(${dx},${dy},${dz}): ${block.name} (type=${block.type})`)
            if (block.type === stoneId) {
              found = { dx, dy, dz, block }
            }
          }
        } catch (e) {
          // ignore
        }
      }
    }
  }
  
  if (found) {
    console.log('FOUND STONE at:', found.dx, found.dy, found.dz)
  } else {
    console.log('No stone found')
  }
  
  process.exit(0)
})

setTimeout(() => process.exit(1), 20000)
