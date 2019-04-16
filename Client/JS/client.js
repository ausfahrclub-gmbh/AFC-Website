const electron = require('electron');
const {ipcRenderer} = electron;

var socket;
var sound;

var ipadress = 'http://localhost:9000';
//var ipadress = 'http://25.66.153.178:9000';


ipcRenderer.on('trigger', (e, level) => {
   socket.emit('alarm', {
      type: 'trigger',
      level: level
   });
});

// Startup-sound (autoplay)
sound = new Howl({
   src: ['./Audio./startup.mp3'],
   preload: true,
   volume: 0.2,
   autoplay: true,
});

/* # # # # # # # # # # # # # # 
   Chat / Socket handling
# # # # # # # # # # # # # # # #*/
window.onload = function () { 

   // Query DOM
   var message = document.getElementById('message'),
      handle = document.getElementById('handle'),
      btn = document.getElementById('send'),
      output = document.getElementById('output'),
      feedback = document.getElementById('feedback'),
      status = document.getElementById('status');

   document.getElementById('adress').innerHTML = '(' + ipadress + ')';
   socket = io.connect(ipadress);

   // Changes the lable on mainWindow.html, to give feedback to the user
   socket.on('connect', () => {
      status.style.color = "green"
      status.innerHTML = "CONNECTED"
    });
    socket.on('disconnect', () => {
       status.style.color = "red"
       status.innerHTML = "DISCONNECTED"
    });

   // Emit events
   btn.addEventListener('click', function(){
      socket.emit('chat', {
         message: message.value,
         handle: handle.value
      });
      message.value = "";
   });

   message.addEventListener("keyup", function(event){
      if (event.keyCode === 13) {
         event.preventDefault();
         btn.click();
        }
   });

   message.addEventListener('keypress', function(){
      socket.emit('typing', handle.value);
   })

   // Listen for events
   socket.on('chat', function(data){
      feedback.innerHTML = '';
      output.innerHTML += '<p><strong>' + data.handle + ': </strong>' + data.message + '</p>';
   });

   socket.on('typing', function(data){
      feedback.innerHTML = '<p><em>' + data + ' is typing a message...</em></p>';
   });

   // Listen for incoming alarms
   socket.on('alarm', function(data){
      
      const {type, level} = data;

      console.log(`\nReceived alarm: ${type} ${level}`);

      //Checks if a sound is already playing,if true stops the audio, to prevent overlaying the audio tracks      
      sound.unload();

      // Alarm stop received 
      if(type == 'alarm_stop'){
         console.log('Stopped playing the alarm');
      }
      // Alarm received
      else{
         console.log('State: ', sound.state());
         sound = playSound(level);
      }
   });

   function playSound(level) {
      loadingSound = true;
      var howl = new Howl({
         src: [`./Audio./alarm${level}.mp3`],
         volume: 0.2,
         autoplay: true,
      });
      return howl;
   }
 }


