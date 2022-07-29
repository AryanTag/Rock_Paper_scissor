//<script type="module">
// console.log(y);

var hooman_name = "";
word();

function word(){
    $.get("/getName", function(data)
    {
        if(data=="")
        {
          data="player";
        }
        document.getElementById('your-score').innerHTML=data+"'s score";
        hooman_name = data;
      });
}
const video = document.getElementById('webcam');
const liveView = document.getElementById('liveView');
const demosSection = document.getElementById('demos');
const enableWebcamButton = document.getElementById('webcamButton');

const canvasElement = document.getElementsByClassName('output_canvas')[0]; //
const canvasCtx = canvasElement.getContext('2d'); //
canvasCtx.strokeStyle = 'red';
canvasCtx.fillStyle = 'blue';
canvasCtx.lineWidth = 5;

let model;


// Get the modal
var modal = document.getElementById("myModal");

// Get the button that closes the modal
var span = document.getElementsByClassName("close")[0];
// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

async function loader()
{
  model = await handpose.load();
}
// alert("hello");
// Check if webcam access is supported.
function getUserMediaSupported()
{
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

// If webcam supported, add event listener to button for when user
// wants to activate it to call enableCam function which we will
// define in the next step.
if (getUserMediaSupported())
{
  console.log("i am here LOL");
  loader();
  enableWebcamButton.addEventListener('click', enableCam);

}
else
{
  console.warn('getUserMedia() is not supported by your browser');
}


// Enable the live webcam view and start classification.
function enableCam(event)
{
  // Only continue if the COCO-SSD has finished loading.
  if (!model)
  {
    console.log("mai idhar marr rha");
    return;
  }

  // Hide the button once clicked.
  event.target.classList.add('removed');

  // getUsermedia parameters to force video but not audio.
  const constraints = {
    video: true
  };

  // Activate the webcam stream.
  navigator.mediaDevices.getUserMedia(constraints).then(function(stream)
  {
    video.srcObject = stream;
    document.getElementById("webcam").style.transform="scaleX(-1)";
    hello();//han ye karlo pehle
  });
}

fingerLookupIndices = {
      thumb: [0, 1, 2, 3, 4],
      indexFinger: [0, 5, 6, 7, 8],
      middleFinger: [0, 9, 10, 11, 12],
      ringFinger: [0, 13, 14, 15, 16],
      pinky: [0, 17, 18, 19, 20]
    };

function drawPoint(y, x, r) {
  canvasCtx.beginPath();
  canvasCtx.arc(x, y, r, 0, 2 * Math.PI);
  canvasCtx.fill();
}

function drawKeypoints(keypoints) {
  const keypointsArray = keypoints;

  for (let i = 0; i < keypointsArray.length; i++) {
    const y = keypointsArray[i][0];
    const x = keypointsArray[i][1];
    drawPoint(x , y , 7);
  }

  const fingers = Object.keys(fingerLookupIndices);
  for (let i = 0; i < fingers.length; i++) {
    const finger = fingers[i];
    const points = fingerLookupIndices[finger].map(idx => keypoints[idx]);
    drawPath(points, false);
  }
}

function drawPath(points, closePath) {
  const region = new Path2D();
  region.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    region.lineTo(point[0], point[1]);
  }

  if (closePath) {
    region.closePath();
  }
  canvasCtx.stroke(region);
}

var counter_check = -1;
var model_output_final;
var machine_output; //which is random
var score = {'machine':0, 'hooman':0}
// {-1:'computer wins', 0:'draw', 1:'you win'}
//1 - rock, 2 - paper, 3 - scissor
const result_check = [[1,1,0], [2,2,0], [3,3,0], [1,2,1], [1,3,1], [2,1,-1], [2,3,1], [3,1,1], [3,2,-1]] //[hooman, computer, result]
var result;
var winner = ""; // string containing 'hooman' or 'machine' whoever is the winner
var stopped_after1result = true;

//creating seperate dictionary temp, to find the result given model_output_final & machine_output
var temp = {};
for(var i = 0 ; i < result_check.length; i += 1) {
  temp[[result_check[i][0], result_check[i][1]]] = result_check[i][2];
}

async function hello()
{
  if (counter_check == -1)
  {
    model = await handpose.load(scoreThreshold = 0.95);
    counter_check = 0
  }
  // Load the MediaPipe handpose model.
  //model = await handpose.load();
  //console.log("working 2");
  // Pass in a video stream (or an image, canvas, or 3D tensor) to obtain a
  // hand prediction from the MediaPipe graph.

  const predictions = await model.estimateHands(video);
  //console.log(predictions);
  if (predictions.length > 0)
  {
    for (let i = 0; i < predictions.length; i++)
    {
      const keypoints = predictions[i].landmarks;

      //gawd code begins
      const handList = [];
      for (let i = 0; i<21; i++)
      {
        handList.push([keypoints[i][0], keypoints[i][1]]);
      }
      //console.log(handList)

      var count = 0;
      var hand = [0,0,0];
      const finger_Coord = [[8, 6], [12, 10], [16, 14], [20, 18]];

      for (let i = 0; i<4; i++)
      {
        if (handList[finger_Coord[i][0]][1] < handList[finger_Coord[i][1]][1])
          count += 1;
      }

      if (count < 2)
        hand[0]++;
      else if (count <= 3)
        hand[1]++;
      else
        hand[2]++;

      canvasCtx.save();
      document.getElementById("canvass").style.transform="scaleX(-1)";
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      canvasCtx.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);

      drawKeypoints(keypoints, predictions[0].annotations);
      //console.log(canvasCtx)

      if(stopped_after1result == true)
      {
        if (counter_check ==5)
        {
          stopped_after1result = false;

          model_output_final = hand.indexOf(Math.max(...hand)) + 1; // 1 is rock, 2 is scissor & 3 is paper as in line 120
          machine_output = Math.floor(Math.random()*3) + 1; // + 1 to avoid getting 0 from random
          if(machine_output==1)
          {
            document.getElementById("comp-hand").src="rock.jpg";
          }
          else if(machine_output==2)
          {
            document.getElementById("comp-hand").src="scissor.jpg";
          }
          else
          {
            document.getElementById("comp-hand").src="paper.jpg";
          }

          result = temp[[model_output_final, machine_output]]; // -1 if machine wins, 0 if draw, 1 if hooman wins

          console.log(model_output_final);
          console.log(machine_output);
          console.log(temp);

          if(result == -1 && winner == "")
          {
            score['machine']++;
            document.getElementById("comp-score").innerHTML=score['machine'];
          }
          else if (result == 1 && winner == "")
          {
            score['hooman']++;
            document.getElementById("player-score").innerHTML=score['hooman'];
          }

          // console.log(score);

          if((score['machine'] < 3) && (score['hooman'] < 3))
          {
            counter_check = 0;
            hand = [0,0,0];
          }
          else if ((score['machine'] == 3))
          {
            winner = 'machine';

            modal.style.display = "block";
            document.getElementById("modal").innerHTML="Machine WINS !!";
            // console.log(winner);
            //return false;
          }
          else if (score['hooman'] == 3)
          {
            winner = 'aryan';

            modal.style.display = "block";
            document.getElementById("modal").innerHTML=hooman_name + " WINS !!";
            document.getElementById("confetti").classList.remove('hide');
            // console.log(winner);
            //return false;
          }

        }
        else
        {
          counter_check++;
        }
      }
    }
  }
  else if (winner == "")
  {
    document.getElementById("comp-hand").src="";
    stopped_after1result = true;
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  }

  window.requestAnimationFrame(hello);
}
