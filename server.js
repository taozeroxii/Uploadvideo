const express = require('express');
const expressWs = require('express-ws');
const path = require('path');
const Queue = require('bull');
var bodyParser = require('body-parser');
const { find } = require('lodash');
require('dotenv').config();
const fs = require('fs');
const PORT = process.env.PORT;
const resizeVideo = require('./utils/resizevideo');

const app = express();
const wss = expressWs(app).getWss();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, './views'));
app.use(express.static(path.join(__dirname, './public')));


app.use(bodyParser.urlencoded({ extended: false }));// parse application/x-www-form-urlencoded
app.use(bodyParser.json());// parse application/json

const videoQueue = new Queue('video transcoding', 'redis://127.0.0.1:6379');
videoQueue.process(2 ,async (job, next) => {
  const { id, videoPath, size, outputPath, outputUrl, lastjob} = job.data;
  // console.log(wss.clients, id)
  const ws = find( Array.from(wss.clients), { id })

  if (!ws ) {
    throw new Error('ws is missing')
  }

  await resizeVideo(videoPath, size, outputPath);
  ws.send(JSON.stringify({ url: outputUrl ,lastjob}));

  if(lastjob){
    await fs.promises.unlink(videoPath)
  }
  next();
});

const rooms = {};
app.get('/', (req, res) => res.render('index'));

app.ws('/upload', (ws, req) => {
  const filename = +new Date();
  ws.id = filename;

  ws.on('message', async (videoBuffer) => {
    // console.log(videoBuffer);
    const filename = +new Date();
    const videoPath = path.join(__dirname, `./public/temp/${filename}`);
    await fs.promises.writeFile(videoPath, videoBuffer);
    ws.send(JSON.stringify({ uploaded: true }));

    let c = 0;
    const sizes = [480, 360];
    for (const size of sizes) {
      c++
      const outputUrl = `/${filename}-${size}p.mp4`;
      const outputPath = path.join(__dirname, `./public${outputUrl}`);
      await videoQueue.add({
        id: ws.id,
        videoPath,
        size: 480,
        outputPath,
        outputUrl,
        lastjob: c == sizes.length
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`server is stardted on : http://localhost:${PORT}`);
});
