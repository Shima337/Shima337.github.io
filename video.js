const imageIolearn = document.getElementById("photos");
const video = document.getElementById("video");
let happySec = 0;
const Photos = [];
let isPlay = false;

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

function append() {
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(function success(stream) {
      video.srcObject = stream;
    });
  document.body.appendChild(video);
}

Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri("./models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("./models"),
  faceapi.nets.ssdMobilenetv1.loadFromUri("./models"),
  faceapi.nets.tinyFaceDetector.loadFromUri("./models"),
  faceapi.nets.faceExpressionNet.loadFromUri("./models"),
]).then(upload);

async function upload() {
  imageIolearn.addEventListener("change", async () => {
    console.log(imageIolearn.files);
    for (let index = 0; index < imageIolearn.files.length; index++) {
      const nowPhoto = await faceapi.bufferToImage(imageIolearn.files[index]);
      Photos.push(nowPhoto);
    }
    // start();
  });
}

function loadLabeledImages() {
  const labels = ["shima"];
  return Promise.all(
    labels.map(async (label) => {
      const descriptions = [];
      for (let i = 0; i < Photos.length; i++) {
        const img = Photos[i];
        console.log(i);
        const detections = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
        descriptions.push(detections.descriptor);
      }

      console.log("learned");

      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
  );
}

video.addEventListener("play", async () => {
  const labeledFaceDescriptors = await loadLabeledImages();
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
  const canvas = faceapi.createCanvasFromMedia(video);
  //document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);
  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()
      .withFaceDescriptors();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    const results = resizedDetections.map((d) =>
      faceMatcher.findBestMatch(d.descriptor)
    );
    console.log("distance: ", results);
    console.log("happy :", detections[0].expressions.happy);
    if (
      detections[0].expressions.happy > 0.5 &&
      results[0]._label === "shima" &&
      results[0]._distance > 0.2
    ) {
      happySec += 1;
      console.log("shimaaa is happy", happySec);
      document.getElementById(
        "message"
      ).innerHTML = `Shima is happy ${happySec}`;
    } else {
      happySec = 0;
    }

    if (happySec > 8 && !isPlay) {
      isPlay = true;
      document.getElementById(
        "song"
      ).innerHTML = `<iframe width="420" height="315"
      src="https://www.youtube.com/embed/tgbNymZ7vqY?autoplay=1&mute=1">
      </iframe>`;
    }
  }, 500);
});
