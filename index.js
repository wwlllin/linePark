import 'dotenv/config'
import linebot from 'linebot'
import parkinglot from './commands/parkinglot.js'

const bot = linebot({
  channelId: process.env.CHANNEL_ID,
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
})

bot.on('message', (event) => {
  if (process.env.DEBUG === 'true') {
    console.log(event)
  }
  if (event.message.type === 'text') {
    event.reply({
      type: 'text',
      text: '請傳送位置',
      quickReply: {
        items: [
          {
            type: 'action',
            action: {
              type: 'location',
              label: '位置'
            }
          }
        ]
      }
    })
  }
  if (event.message.type === 'location') {
    parkinglot(event)
  }
})

bot.on('postback', (event) => {
  console.log(event.postback.data)
  if (process.env.DEBUG === 'true') {
    console.log(event)
  }
})

bot.listen('/', process.env.PORT || 3000, () => {
  console.log('機器人啟動')
})
