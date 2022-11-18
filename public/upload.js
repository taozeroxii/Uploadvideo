const formUpload = document.getElementById("formUpload");
const inputUpload = document.getElementById("inputUpload");
const progressUpload = document.getElementById("progressUpload");
const progressBarUpload = document.getElementById("progressBarUpload");
const buttonUpload  = document.getElementById("buttonUpload");
const ws = new WebSocket("ws://localhost:3000/upload");

ws.addEventListener("close", () => {
  alert("การเชื่อมต่อสูญหาย จะทำการโหลดหน้าเว็บใหม่อีกครั้ง");
  location.reload();
});

ws.addEventListener("message", ({ data }) => {
  const { uploaded , resize , result } = JSON.parse(data);
  if (uploaded) {
    progressBarUpload.classList.add("bg-warning");
    progressBarUpload.innerText = 'กำลังประมวลผลวิดีโอและปรับขนาด กรุณารอสักครู่'
  }
  if(resize){
    alert(result)
    inputUpload.value = ''
    progressBarUpload.innerText = 'อัพโหลดเสร็จสิ้น'
    progressBarUpload.classList.remove("bg-warning");
    progressBarUpload.classList.add("bg-success");
    progressBarUpload.classList.remove("progress-bar-animated");
    progressBarUpload.classList.remove("progress-bar-striped");
    buttonUpload.classList.remove("disabled");
    inputUpload.disabled = false
    setTimeout(() => {
      progressUpload.classList.add("d-none");
    }, 3000);
  }
});

formUpload.addEventListener("submit", () => {
  event.preventDefault();
  const file = inputUpload.files[0];
  console.log(file);
  ws.send(file);
  progressUpload.classList.remove("d-none");
  progressBarUpload.classList.remove("bg-success");
  progressBarUpload.classList.add("progress-bar-animated");
  progressBarUpload.classList.add("progress-bar-striped");
  buttonUpload.classList.add("disabled");
  inputUpload.disabled = true


  const uploadInterval = setInterval(() => {
    console.log(
      Math.round(((file.size - ws.bufferedAmount) / file.size) * 100, 0)
    );
    const percen = Math.round(
      ((file.size - ws.bufferedAmount) / file.size) * 100,
      0
    );
    progressBarUpload.style.width = `${percen}%`;
    progressBarUpload.innerText = `${percen}%`;
    if (ws.bufferedAmount <= 0) {
      clearInterval(uploadInterval);
    }
  }, 1);
});
