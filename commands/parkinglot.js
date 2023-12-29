import axios from 'axios'
import { distance } from '../distance.js'
import parkinglotTemplate from '../templates/parkinglot.js'
import fs from 'node:fs'

export default async (event) => {
  try {
    const { data } = await axios.get('https://raw.githubusercontent.com/wwlllin/parkdata/main/TCMSV_alldesc_final.json')
    const replies = []
    data.data.park
      .map((value) => {
        value.distance = distance(event.message.latitude, event.message.longitude, value.EntranceCoord.EntrancecoordInfo[0].Xcod, value.EntranceCoord.EntrancecoordInfo[0].Ycod, 'K')
        return value
      })
      .filter((value) => {
        return value.distance <= 2
      })
      .sort((a, b) => {
        // console.log(a.distance - b.distance)
        return a.distance - b.distance
      })
      .slice(0, 5)
      .map((value) => {
        // console.log(value)
        const template = parkinglotTemplate()
        template.body.contents[0].text = value.name || 'none'
        template.body.contents[1].contents[0].contents[1].text = value.address || 'none'
        template.body.contents[1].contents[1].contents[1].text = value.serviceTime || 'none'
        template.body.contents[1].contents[2].contents[1].text = value.payex || 'none'
        template.body.contents[1].contents[3].contents[1].text =
          `${Math.floor(value.distance * 1000)} M` || 'none'
        template.body.contents[1].contents[4].contents[1].text =
          `${Math.floor(value.distance * 1000 / 60)} 分鐘` || 'none'
        replies.push(template)
        console.log(replies)
        return template
      })

    if (process.env.DEBUG === true) {
      fs.writeFileSync('../dump/parkinglot.json', JSON.stringify(replies, null, 2))
    }

    const result = await event.reply(
      replies.length === 0
        ? '查無資料'
        : {
            type: 'flex',
            altText: '查詢結果',
            contents: {
              type: 'carousel',
              contents: replies
            }
          })
    console.log(result)
  } catch (error) {
    console.log(error)
  }
}
