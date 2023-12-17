 
    // To save the score in localStorage
    let score = JSON.parse(localStorage.getItem('score'));
  
    // Set default score object if it doesn't exist
    if (score === null) {
      score = {
        wins: 0,
        losses: 0,
        ties: 0,
      };
    }

    updateScoreElement();

  
    function resetScore() {
      score.wins = 0;
      score.losses = 0;
      score.ties = 0;
  
      // Save the updated score in localStorage
      localStorage.setItem('score', JSON.stringify(score));
  
//       alert(`You Picked Reset button, all reseted. 
// Wins: ${score.wins}, Losses: ${score.losses}, Ties: ${score.ties}`);

        updateScoreElement();
    }
  
    function playGame(playerMove) {
      const computerMove = pickComputerMove();
  
      let result = '';
      if (playerMove === 'scissors') {
        if (computerMove === 'rock') {
          result = 'You win';
        } else if (computerMove === 'paper') {
          result = 'You lose';
        } else if (computerMove === 'scissors') {
          result = 'Tie';
        }
      } else if (playerMove === 'paper') {
        if (computerMove === 'rock') {
          result = 'You win';
        } else if (computerMove === 'paper') {
          result = 'Tie';
        } else if (computerMove === 'scissors') {
          result = 'You lose';
        }
      } else if (playerMove === 'rock') {
        if (computerMove === 'rock') {
          result = 'Tie';
        } else if (computerMove === 'paper') {
          result = 'You lose';
        } else if (computerMove === 'scissors') {
          result = 'You win';
        }
      }
  
      // Update the score
      if (result === 'You win') {
        score.wins++;
      } else if (result === 'You lose') {
        score.losses++;
      } else if (result === 'Tie') {
        score.ties++;
      }
  
      // Save the updated score in localStorage
      localStorage.setItem('score', JSON.stringify(score));

      document.querySelector('.js-result')
      .innerHTML = result;

      document.querySelector('.js-move')
      .innerHTML = `You picked
      <img src="./images/${playerMove}-emoji.png" class="move-icon">
      <img src="./images/${computerMove}-emoji.png" class="move-icon">
      computer`;
  
        updateScoreElement();
       
    }

    function updateScoreElement(){
        document.querySelector ('.js-score')
            .innerHTML= `Wins: ${score.wins}, Losses: ${score.losses}, Ties: ${score.ties}`;
    }
  
    function pickComputerMove() {
      const randomNumber = Math.random();
      let computerMove = '';
  
      if (randomNumber >= 0 && randomNumber <= 0.4) {
          computerMove = 'rock';
        } else if (randomNumber > 0.4 && randomNumber <= 0.7) {
          computerMove = 'paper';
        } else if (randomNumber > 0.7 && randomNumber <= 1) {
          computerMove = 'scissors';
        }
  
      return computerMove;
    }