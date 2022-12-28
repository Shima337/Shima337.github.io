const imageIolearn = document.getElementById("photos");
const video = document.getElementById("video");
let happySec = 0;
const Photos = [];
let isPlay = false;

video.style.width = document.width + "px";
video.style.height = document.height + "px";
video.setAttribute("autoplay", "");
video.setAttribute("muted", "");
video.setAttribute("playsinline", "");

var facingMode = "user";
var constraints = {
  audio: false,
  video: {
    facingMode: facingMode,
  },
};

navigator.mediaDevices.getUserMedia(constraints).then(function success(stream) {
  video.srcObject = stream;
});

document.body.appendChild(video);
