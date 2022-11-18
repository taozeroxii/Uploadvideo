const express = require('express')
const expressWs = require('express-ws')
const path = require('path')
var bodyParser = require('body-parser')
require('dotenv').config()
const fs = require('fs')
const PORT = process.env.PORT
const resizeVideo = require('./utils/resizevideo')


const app  = express()
expressWs(app)

app.set('view engine','pug')
app.set('views', path.join(__dirname, './views'))
app.use(express.static(path.join(__dirname, './public')))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())


const rooms = {}

app.get('/', (req, res) => res.render('index'))

app.ws('/upload', (ws, req) => {
  ws.on('message',async (videoBuffer) =>{
    console.log(videoBuffer)
    const filename = +new Date()
    const videoPath = path.join(__dirname,  `./public/temp/${filename}`)
    await fs.promises.writeFile(videoPath, videoBuffer)
    ws.send(JSON.stringify({ uploaded: true }))
    const sizes = [480, 360]
    const result = []
    for(const size of sizes){
      const outputUrl =`/${filename}-${size}p.mp4`
      const outputPath = path.join(__dirname,  `./public${outputUrl}`)
      await resizeVideo(videoPath, size, outputPath)
      result.push(outputPath)
    }
    ws.send(JSON.stringify({ resize: true , result}))


  })
})

app.listen(PORT,()=> {console.log(`server is stardted on : http://localhost:${PORT}`)})



