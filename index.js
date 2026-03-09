const mineflayer = require('mineflayer')
const pathfinder = require('mineflayer-pathfinder').pathfinder
const { Movements } = require('mineflayer-pathfinder')
const fs = require('fs')
const path = require('path')

// ========== 核心配置 ==========
const CONFIG = {
  host: '111.231.77.118',
  port: 25565,
  username: 'HelperBot',
  masters: ['ycc1012'],
  pluginsDir: path.join(__dirname, 'plugins')
}

// 创建 Bot
const bot = mineflayer.createBot(CONFIG)
bot.loadPlugin(pathfinder)

// ========== 插件系统 ==========
const plugins = {}

function loadPlugins() {
  const pluginsDir = CONFIG.pluginsDir
  
  if (!fs.existsSync(pluginsDir)) {
    fs.mkdirSync(pluginsDir, { recursive: true })
    console.log('插件目录已创建:', pluginsDir)
    return
  }
  
  const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'))
  
  for (const file of files) {
    try {
      const pluginPath = path.join(pluginsDir, file)
      const plugin = require(pluginPath)
      
      // 初始化插件
      if (plugin.onLoad) {
        plugin.onLoad(bot, bot.pathfinder)
      }
      
      plugins[plugin.name] = plugin
      console.log(`加载插件: ${plugin.name} v${plugin.version || '1.0.0'}`)
    } catch (err) {
      console.error(`加载插件失败: ${file}`, err.message)
    }
  }
  
  console.log(`共加载 ${Object.keys(plugins).length} 个插件`)
}

// ========== 事件处理 ==========
bot.on('spawn', () => {
  console.log('HelperBot 已登录:', bot.username)
  
  // 初始化 pathfinder movements
  try {
    const mcData = require('minecraft-data')(bot.version)
    const defaultMovements = new Movements(bot, mcData)
    bot.pathfinder.setMovements(defaultMovements)
    console.log('Pathfinder movements 已设置')
  } catch (err) {
    console.error('设置 movements 失败:', err.message)
  }
  
  // 加载插件
  loadPlugins()
  
  // 发送上线消息
  const pluginList = Object.keys(plugins).join(', ')
  bot.chat(`HelperBot 已上线！插件: ${pluginList || '无'}`)
  bot.chat('输入 help 查看命令')
})

bot.on('chat', (username, message) => {
  if (username === bot.username) return
  
  const isMaster = CONFIG.masters.includes(username)
  const isDirect = message.toLowerCase().startsWith(bot.username.toLowerCase() + ',')
  
  if (!isMaster && !isDirect) return
  
  // 解析命令
  let cmd = message
  if (isDirect) {
    cmd = message.substring(bot.username.length + 1).trim()
  }
  
  if (!cmd) return
  
  const parts = cmd.split(' ')
  const command = parts[0].toLowerCase()
  const args = parts.slice(1)
  
  console.log(`收到命令: ${command} ${args.join(' ')} from ${username}`)
  
  // 遍历插件处理命令
  for (const [name, plugin] of Object.entries(plugins)) {
    if (plugin.onChat) {
      try {
        const handled = plugin.onChat(username, message, command, args, bot)
        if (handled) return
      } catch (err) {
        console.error(`插件 ${name} 处理命令出错:`, err.message)
      }
    }
  }
  
  // 内置 help 命令
  if (command === 'help') {
    const cmds = Object.keys(plugins).map(p => `${p}`).join(', ')
    bot.chat(`=== HelperBot 插件 ===`)
    bot.chat(cmds || '无')
    return
  }
  
  bot.chat(`未知命令，输入 help 查看`)
})

bot.on('kicked', console.log)
bot.on('error', console.log)

console.log('HelperBot 核心启动...')
