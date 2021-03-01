$(document).ready(function()
{
    $(".toggle").hover(
        function()
        {
          var src = $(".gif").attr("src");
          $(".gif").attr("src", src.replace(/\.png$/i, ".gif"));
        },
        function()
        {
          var src = $(".gif").attr("src");
          $(".gif").attr("src", src.replace(/\.gif$/i, ".png"));
        });
});



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
