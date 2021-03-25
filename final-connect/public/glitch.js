$(document).ready(function()
{
    $(".toggle").hover(
        function()
        {
          $(".gif").attr("src", "assets/glitch1.gif");
        },
        function()
        {
          $(".gif").attr("src", "assets/enter.png");
          alert("The website is now back online. Have a try!");
          //$(".gif").hide(1000);
        }

        );
});

setTimeout(function() {
  $('#decay').fadeOut('fast');
}, 3000); // <-- time in milliseconds  

var music = document.getElementById("music");
var isPlaying = false;
music.volume = 0.2;
function Play() {
  music.play()
};
function Pause() {
  music.pause()
};

music.onplaying = function() {
  isPlaying = true;
};
music.onpause = function() {
  isPlaying = false;
};
