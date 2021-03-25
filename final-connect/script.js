document.getElementById("video1").style.display = "none";
document.getElementById("video2").style.display = "none";
document.getElementById("video3").style.display = "none";

// Create an array to store all questions.
var allQuestions = [];
// Store each question in an object.
allQuestions[0] = {
    date:"dashcam-2033-May-4th.mp4",
    question: "My last name?",
    choices: ["Wang", "Lee", "Chen"],
    correctAnswer: 0
};
allQuestions[1] = {
    date:"dashcam-2033-May-4th.mp4",
    question: "What’s the color of my car?",
    choices: ["Blue", "Black", "Red"],
    correctAnswer: 0
};
allQuestions[2] = {
    date:"dashcam-2033-May-4th.mp4",
    question: "When did I died?",
    choices: ["Denver Broncos", "Seattle Seahawks", "Denver Broncos"],
    correctAnswer: 0
};

// Display first question
document.getElementById("date").textContent = allQuestions[0].date;

document.getElementById("question").textContent = allQuestions[0].question;

document.getElementById("choice0").textContent = allQuestions[0].choices[0];

document.getElementById("choice1").textContent = allQuestions[0].choices[1];

document.getElementById("choice2").textContent = allQuestions[0].choices[2];

// Create a variable to store the user's score
var userScore = 0;

// Create a variable to store the index of the current question
var questionNum = 0;

// When the NEXT button is clicked, the user's score is updated, the current question is hidden, and the next question is revealed.
  $("#next").click(function() {
      
  // Check if User answered question.
  // If so, update user's score. If not, do not continue quiz until answer is given.
  if($("form input[name=answer]:checked").val() == allQuestions[questionNum].correctAnswer) {
    userScore++;
    
  }
    console.log(userScore); 
    
    questionNum++;
  
    if(userScore==1){
      document.getElementById("video1").style.display = "inline";
      $("video1").click(function() {
        $('#video1').fadeOut('fast');
        console.log("click");
      });
      setTimeout(function() {
        $('#video1').fadeOut('fast');
    }, 54000); // <-- time in milliseconds     
    }

    if(userScore==2){
      document.getElementById("video2").style.display = "inline";
      setTimeout(function() {
        $('#video2').fadeOut('fast');
    }, 5000); // <-- time in milliseconds     
    }
  
    if(userScore==3){
      document.getElementById("video3").style.display = "inline";
      setTimeout(function() {
        $('#video3').fadeOut('fast');
        window.location.href = "rewelcome.html";
    }, 5000); // <-- time in milliseconds     
    }
  // Replace current question with next question
    document.getElementById("question").textContent = allQuestions[questionNum].question;

    document.getElementById("choice0").textContent = allQuestions[questionNum].choices[0];

    document.getElementById("choice1").textContent = allQuestions[questionNum].choices[1];

    document.getElementById("choice2").textContent = allQuestions[questionNum].choices[2];
	});

 