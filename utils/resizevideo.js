const ffmpeg = require("fluent-ffmpeg");

module.exports = (videoPath, size, outputPath) => {
  return new Promise((resolve,reject) => {
    ffmpeg(videoPath)
      .videoCodec("libx264")
      .format("mp4")
      .size(`?x${size}`) // ปรับขนาด video 360p หน่วยความสูง
      .on(`error` , reject)
      .on('end' , resolve)
      .save(outputPath)
  });
};
