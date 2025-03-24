// Game state object - check if it doesn't exist yet before declaring
if (typeof window.gameState === 'undefined') {
    window.gameState = {
        currentMode: 'computer', // 'computer' or 'player'
        playerName: 'YOU',
        opponentName: 'COMPUTER',
        playerScore: 0,
        opponentScore: 0,
        currentDifficulty: 'medium',
        soundEnabled: true,
        musicEnabled: true,
        animationsEnabled: true,
        effectsEnabled: true,
        currentTheme: 'default',
        level: 1,
        xp: 0,
        gameHistory: [],
        powerups: {
            double: 2,
            shield: 1,
            peek: 1
        },
        moveInProgress: false
    };
} else {
    // Enhance existing gameState with any missing properties
    window.gameState.currentMode = window.gameState.currentMode || 'computer';
    window.gameState.playerName = window.gameState.playerName || 'YOU';
    // Add any other properties that might be missing
}

// Load saved game data or initialize with defaults
function loadGameData() {
    const savedData = localStorage.getItem('rpsGameData');
    
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        
        // Update game state with saved data, keeping default for any missing properties
        Object.assign(window.gameState, parsedData);
        
        // Update UI to reflect loaded data
        document.getElementById('player-name').textContent = window.gameState.playerName;
        document.getElementById('player-name-input').value = window.gameState.playerName;
        document.getElementById('player-score').textContent = window.gameState.playerScore;
        document.getElementById('opponent-score').textContent = window.gameState.opponentScore;
        document.getElementById('sound-toggle').checked = window.gameState.soundEnabled;
        document.getElementById('animation-toggle').checked = window.gameState.animationsEnabled;
        document.getElementById('difficulty').value = window.gameState.currentDifficulty;
        
        if (window.gameState.currentMode === 'player') {
            document.getElementById('vs-player-btn').classList.add('active');
            document.getElementById('vs-computer-btn').classList.remove('active');
            document.getElementById('opponent-name').textContent = 'PLAYER 2';
            window.gameState.opponentName = 'PLAYER 2';
            document.querySelector('.difficulty-selector').style.display = 'none';
        }
        
        // Update stats
        updateStats();
        
        // Update history
        renderGameHistory();
    }
}

// Save game data to localStorage
function saveGameData() {
    localStorage.setItem('rpsGameData', JSON.stringify(window.gameState));
}

// Initialize DOM elements and event listeners
function initializeGame() {
    // Load game data
    loadGameData();
    
    // Initialize move buttons
    const moveButtons = document.querySelectorAll('.move-btn');
    moveButtons.forEach(button => {
        button.addEventListener('click', () => {
            const move = button.getAttribute('data-move');
            playGame(move);
        });
    });
    
    // Initialize game mode buttons
    document.getElementById('vs-computer-btn').addEventListener('click', () => {
        setGameMode('computer');
    });
    
    document.getElementById('vs-player-btn').addEventListener('click', () => {
        setGameMode('player');
    });
    
    // Initialize settings button
    document.getElementById('settings-btn').addEventListener('click', () => {
        // Get the settings content element
        const settingsContent = document.querySelector('.settings-content');
        if (!settingsContent) {
            console.error("Settings content element not found");
            return;
        }
        
        // Toggle the active class
        settingsContent.classList.toggle('active');
        
        // Toggle button appearance
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.classList.toggle('active');
        }
        
        // Log the state for debugging
        console.log("Settings panel toggled:", settingsContent.classList.contains('active') ? "ON" : "OFF");
    });
    
    // Initialize player name input
    document.getElementById('player-name-input').addEventListener('change', (e) => {
        window.gameState.playerName = e.target.value || 'YOU';
        document.getElementById('player-name').textContent = window.gameState.playerName;
        saveGameData();
    });
    
    // Initialize sound toggle
    document.getElementById('sound-toggle').addEventListener('change', (e) => {
        window.gameState.soundEnabled = e.target.checked;
        saveGameData();
    });
    
    // Initialize animation toggle
    document.getElementById('animation-toggle').addEventListener('change', (e) => {
        window.gameState.animationsEnabled = e.target.checked;
        saveGameData();
    });
    
    // Initialize difficulty selector
    document.getElementById('difficulty').addEventListener('change', (e) => {
        window.gameState.currentDifficulty = e.target.value;
        saveGameData();
    });
    
    // Initialize reset stats button
    document.getElementById('reset-stats-btn').addEventListener('click', resetStats);
    
    // Initialize clear all data button
    document.getElementById('clear-data-btn').addEventListener('click', clearAllData);
    
    // Set initial result text
    updateResultText('CHOOSE YOUR MOVE');
    
    // Initialize 3D elements and motion controls
    if (MotionController) {
        MotionController.initialize();
    }
    
    if (DragController) {
        DragController.initialize();
    }
    
    // Initialize particles if available
    if (typeof particlesJS !== 'undefined') {
        try {
            particlesJS('particles-js', {
                particles: {
                    number: { value: 80, density: { enable: true, value_area: 800 } },
                    color: { value: '#1bffff' },
                    shape: { type: 'circle' },
                    opacity: { value: 0.5, random: true },
                    size: { value: 3, random: true },
                    move: { 
                        enable: true, 
                        speed: 2,
                        direction: 'none',
                        random: true,
                        out_mode: 'out'
                    }
                }
            });
        } catch (e) {
            console.warn('Particles initialization failed:', e);
        }
    }
    
    // Apply current theme
    const savedTheme = window.gameState.currentTheme || 'default';
    applyTheme(savedTheme);
}

// Set game mode (vs computer or vs player)
function setGameMode(mode) {
    // Reset scores and stats for new game mode
    window.gameState.playerScore = 0;
    window.gameState.opponentScore = 0;
    document.getElementById('player-score').textContent = '0';
    document.getElementById('opponent-score').textContent = '0';
    
    // Reset move displays
    resetMoveDisplays();
    
    // Update current mode
    window.gameState.currentMode = mode;
    
    // Remove active class from all buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Update UI based on mode
    switch(mode) {
        case 'computer':
            document.getElementById('vs-computer-btn').classList.add('active');
            document.getElementById('opponent-name').textContent = 'COMPUTER';
            document.querySelector('.difficulty-selector').style.display = 'block';
            updateResultText('CHOOSE YOUR MOVE');
            break;
            
        case 'player':
            document.getElementById('vs-player-btn').classList.add('active');
            document.getElementById('opponent-name').textContent = 'PLAYER 2';
            document.querySelector('.difficulty-selector').style.display = 'none';
            updateResultText('PLAYER 1: CHOOSE YOUR MOVE');
            break;
            
        case 'tournament':
            document.getElementById('tournament-btn').classList.add('active');
            document.getElementById('opponent-name').textContent = 'OPPONENT';
            document.querySelector('.difficulty-selector').style.display = 'block';
            
            // Set up tournament settings
            window.gameState.currentRound = 1;
            window.gameState.totalRounds = 5;
            document.getElementById('current-round').textContent = window.gameState.currentRound;
            document.getElementById('total-rounds').textContent = window.gameState.totalRounds;
            
            // Show round info
            document.querySelector('.round-info').style.display = 'block';
            updateResultText('TOURNAMENT MODE: ROUND 1');
            
            // Initialize tournament state
            window.gameState.tournamentWins = 0;
            window.gameState.tournamentLosses = 0;
            break;
            
        case 'survival':
            document.getElementById('survival-btn').classList.add('active');
            document.getElementById('opponent-name').textContent = 'CHALLENGER';
            document.querySelector('.difficulty-selector').style.display = 'none';
            
            // Set up survival settings
            window.gameState.survivalStreak = 0;
            window.gameState.currentDifficulty = 'easy';
            window.gameState.survivalLevel = 1;
            
            // Update opponent level
            document.getElementById('opponent-level').textContent = window.gameState.survivalLevel;
            
            updateResultText('SURVIVAL MODE: LEVEL 1');
            break;
    }
    
    // Reset player2 turn if in vs player mode
    window.gameState.player2Turn = false;
    
    // Update drop zones for drag-and-drop
    if (DragController && DragController.resetDropZones) {
        DragController.resetDropZones();
    }
    
    // Save game state
    saveGameData();
}

// Reset stats
function resetStats() {
    if (confirm('Are you sure you want to reset all game statistics?')) {
        window.gameState.playerScore = 0;
        window.gameState.opponentScore = 0;
        window.gameState.gameHistory = [];
        
        // Update UI
        document.getElementById('player-score').textContent = '0';
        document.getElementById('opponent-score').textContent = '0';
        document.getElementById('wins-count').textContent = '0';
        document.getElementById('losses-count').textContent = '0';
        document.getElementById('ties-count').textContent = '0';
        document.getElementById('win-rate').textContent = '0%';
        document.getElementById('history-list').innerHTML = '';
        
        // Save the updated data
        saveGameData();
        
        // Play sound effect
        playSound('move-sound');
        
        // Show confirmation
        updateResultText('STATS RESET');
    }
}

// Clear all game data
function clearAllData() {
    if (confirm('Are you sure you want to clear ALL game data? This action cannot be undone.')) {
        localStorage.removeItem('rpsGameData');
        location.reload(); // Refresh the page to start fresh
    }
}

// Play a game round
    function playGame(playerMove) {
    // Reset previous results
    resetMoveDisplays();
    
    if (window.gameState.currentMode === 'computer') {
        playAgainstComputer(playerMove);
    } else {
        playAgainstPlayer(playerMove);
    }
}

// Play against the computer
function playAgainstComputer(playerMove) {
    const computerMove = generateComputerMove(playerMove);
    
    // Display the player's move
    displayMove('player', playerMove);
    
    // Add a small delay before showing computer's move and result
    setTimeout(() => {
        // Display the computer's move
        displayMove('opponent', computerMove);
        
        // Determine the result
        const result = determineWinner(playerMove, computerMove);
        
        // Update scores and stats
        updateScores(result);
        
        // Add to history
        addToGameHistory(playerMove, computerMove, result);
        
        // Save game data
        saveGameData();
        
    }, 500);
}

// Play against another player
function playAgainstPlayer(move) {
    if (!window.gameState.player2Turn) {
        // Player 1's turn
        displayMove('player', move);
        window.gameState.player1Move = move;
        window.gameState.player2Turn = true;
        updateResultText('PLAYER 2: CHOOSE YOUR MOVE');
    } else {
        // Player 2's turn
        displayMove('opponent', move);
        
        // Determine the winner
        const result = determineWinner(window.gameState.player1Move, move);
        
        // Update scores and stats
        updateScores(result);
        
        // Add to history
        addToGameHistory(window.gameState.player1Move, move, result);
        
        // Reset for next round
        window.gameState.player2Turn = false;
        
        // Save game data
        saveGameData();
        
        // Delay before allowing next move
        setTimeout(() => {
            updateResultText('PLAYER 1: CHOOSE YOUR MOVE');
        }, 2000);
    }
}

// Generate computer move based on difficulty
function generateComputerMove(playerMove) {
    const moves = ['rock', 'paper', 'scissors'];
    
    // Based on difficulty level, the computer will make different decisions
    switch (window.gameState.currentDifficulty) {
        case 'easy':
            // Easy: More likely to choose a move that the player can beat (70% chance)
            const beatingMove = getBeatingMove(playerMove, false);
            if (Math.random() < 0.7) {
                return beatingMove;
            }
            break;
            
        case 'hard':
            // Hard: More likely to choose a move that beats the player (70% chance)
            const winningMove = getBeatingMove(playerMove, true);
            if (Math.random() < 0.7) {
                return winningMove;
            }
            break;
            
        case 'impossible':
            // Impossible: Almost always chooses the move that beats the player (95% chance)
            const definiteWinningMove = getBeatingMove(playerMove, true);
            if (Math.random() < 0.95) {
                return definiteWinningMove;
            }
            break;
            
        case 'medium':
        default:
            // Medium: Random choice (equal chance for all moves)
            break;
    }
    
    // If not determined by difficulty logic, choose randomly
    return moves[Math.floor(Math.random() * 3)];
}

// Get a move that beats or loses to the provided move
function getBeatingMove(move, shouldBeatPlayer) {
    if (shouldBeatPlayer) {
        // Return a move that beats the player's move
        if (move === 'rock') return 'paper';
        if (move === 'paper') return 'scissors';
        if (move === 'scissors') return 'rock';
    } else {
        // Return a move that the player's move beats
        if (move === 'rock') return 'scissors';
        if (move === 'paper') return 'rock';
        if (move === 'scissors') return 'paper';
    }
}

// Determine the winner
function determineWinner(playerMove, opponentMove) {
    if (playerMove === opponentMove) {
        updateResultText('TIE GAME');
        playSound('tie-sound');
        return 'tie';
    } else if (
        (playerMove === 'rock' && opponentMove === 'scissors') ||
        (playerMove === 'paper' && opponentMove === 'rock') ||
        (playerMove === 'scissors' && opponentMove === 'paper')
    ) {
        updateResultText('YOU WIN');
        playSound('win-sound');
        return 'win';
    } else {
        updateResultText('YOU LOSE');
        playSound('lose-sound');
        return 'loss';
    }
}

// Update scores based on the result
function updateScores(result) {
    if (result === 'win') {
        window.gameState.playerScore++;
        document.getElementById('player-score').textContent = window.gameState.playerScore;
        applyWinEffect('player');
    } else if (result === 'loss') {
        window.gameState.opponentScore++;
        document.getElementById('opponent-score').textContent = window.gameState.opponentScore;
        applyWinEffect('opponent');
    } else {
        applyTieEffect();
    }
    
    // Update stats
    updateStats();
}

// Update the stats display
function updateStats() {
    // If the new updateStatsUI function is available, use it
    if (typeof updateStatsUI === 'function') {
        updateStatsUI();
        return;
    }
    
    // Legacy code if updateStatsUI is not available
    const stats = calculateStats();
    
    document.getElementById('wins-count').textContent = stats.wins;
    document.getElementById('losses-count').textContent = stats.losses;
    document.getElementById('ties-count').textContent = stats.ties;
    document.getElementById('win-rate').textContent = stats.winRate + '%';
}

// Calculate game statistics
function calculateStats() {
    let wins = 0, losses = 0, ties = 0;
    let currentStreak = 0, longestStreak = 0;
    let lastResult = null;
    let highestCombo = 0;
    let powerupsUsed = window.gameState.powerupsUsed || 0;
    
    // Initialize move counts for the chart
    const moveCounts = {
        rock: 0,
        paper: 0,
        scissors: 0
    };
    
    // Process game history
    window.gameState.gameHistory.forEach(game => {
        // Count wins, losses, ties
        if (game.result === 'win') {
            wins++;
            if (lastResult === 'win') {
                currentStreak++;
                if (currentStreak > longestStreak) {
                    longestStreak = currentStreak;
                }
            } else {
                currentStreak = 1;
            }
        } else if (game.result === 'loss') {
            losses++;
            currentStreak = 0;
        } else {
            ties++;
            // Ties don't affect streaks
        }
        
        lastResult = game.result;
        
        // Count moves for the chart
        if (game.playerMove in moveCounts) {
            moveCounts[game.playerMove]++;
        }
    });
    
    // Save current streak and longest streak to game state
    window.gameState.currentStreak = currentStreak;
    window.gameState.longestStreak = Math.max(longestStreak, window.gameState.longestStreak || 0);
    window.gameState.highestCombo = Math.max(highestCombo, window.gameState.highestCombo || 0);
    window.gameState.powerupsUsed = powerupsUsed;
    
    // Calculate win rate
    const total = wins + losses + ties;
    const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
    
    // Update advanced stats
    document.getElementById('longest-streak').textContent = window.gameState.longestStreak || 0;
    document.getElementById('current-streak').textContent = currentStreak;
    document.getElementById('highest-combo').textContent = window.gameState.highestCombo || 0;
    document.getElementById('powerups-used').textContent = powerupsUsed;
    
    // Update the chart if it exists
    updateMovesChart(moveCounts);
    
    return { wins, losses, ties, winRate };
}

// Function to update the moves chart
function updateMovesChart(moveCounts) {
    // Check if Chart.js is available
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js not available');
        return;
    }
    
    // Get the canvas element
    const chartCanvas = document.getElementById('moves-chart');
    if (!chartCanvas) {
        console.warn('Chart canvas not found');
        return;
    }
    
    // Destroy existing chart if it exists
    if (window.gameState.movesChart) {
        window.gameState.movesChart.destroy();
    }
    
    // Create the chart
    window.gameState.movesChart = new Chart(chartCanvas, {
        type: 'pie',
        data: {
            labels: ['Rock', 'Paper', 'Scissors'],
            datasets: [{
                data: [moveCounts.rock, moveCounts.paper, moveCounts.scissors],
                backgroundColor: ['#ff6b6b', '#48dbfb', '#1dd1a1'],
                borderColor: ['#ff5252', '#0abde3', '#10ac84'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#ffffff',
                        font: {
                            family: 'Poppins, sans-serif'
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Moves Distribution',
                    color: '#ffffff',
                    font: {
                        family: 'Orbitron, sans-serif',
                        size: 16
                    }
                }
            }
        }
    });
}

// Update powerup usage tracking
function activatePowerup(powerupType) {
    // Check if powerup is available
    if (!window.gameState.powerups[powerupType] || window.gameState.powerups[powerupType] <= 0) {
        console.log(`No ${powerupType} powerups available`);
        updateResultText(`NO ${powerupType.toUpperCase()} POWERUPS LEFT`);
        return false;
    }
    
    // Use the powerup
    window.gameState.powerups[powerupType]--;
    window.gameState.powerupsUsed = (window.gameState.powerupsUsed || 0) + 1;
    
    // Track powerup usage in new stats system if available
    if (typeof trackPowerupUsage === 'function') {
        trackPowerupUsage(powerupType);
    }
    
    // Update the powerup display
    const powerupButton = document.querySelector(`.powerup-btn[data-powerup="${powerupType}"]`);
    if (powerupButton) {
        updatePowerupCountDisplay(powerupButton, powerupType);
    }
    
    // Play powerup sound
    playSound('powerup-sound');
    
    // Apply powerup effect
    window.gameState.activePowerup = powerupType;
    updateResultText(`${powerupType.toUpperCase()} POWERUP ACTIVATED!`);
    
    // Add visual effect
    const effectsContainer = document.getElementById('effects-container');
    const effectElement = document.createElement('div');
    effectElement.className = `powerup-effect ${powerupType}-effect`;
    effectElement.innerHTML = `<i class="fas fa-${getPowerupIcon(powerupType)}"></i>`;
    effectsContainer.appendChild(effectElement);
    
    // Remove effect after animation
    setTimeout(() => {
        effectElement.remove();
    }, 2000);
    
    // Save game data
    saveGameData();
    
    return true;
}

// Helper function to get powerup icon
function getPowerupIcon(powerupType) {
    switch(powerupType) {
        case 'double': return '2x';
        case 'shield': return 'shield-alt';
        case 'peek': return 'eye';
        default: return 'bolt';
    }
}

// Enhanced addToGameHistory to update stats immediately
function addToGameHistory(playerMove, opponentMove, result) {
    // If the new recordGameResult function is available, use it
    if (typeof recordGameResult === 'function') {
        recordGameResult(playerMove, opponentMove, result);
        return;
    }
    
    // Legacy code if recordGameResult is not available
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Create history item
    const historyItem = {
        playerMove,
        opponentMove,
        result,
        timestamp,
        powerupUsed: window.gameState.activePowerup || null
    };
    
    // Add to beginning of history array
    window.gameState.gameHistory.unshift(historyItem);
    
    // Limit history size
    if (window.gameState.gameHistory.length > window.gameState.maxHistoryItems) {
        window.gameState.gameHistory.pop();
    }
    
    // Reset active powerup
    window.gameState.activePowerup = null;
    
    // Update history display
    renderGameHistory();
    
    // Update stats
    updateStats();
    
    // Check for achievements
    checkAchievements(result);
}

// Check for unlocked achievements
function checkAchievements(result) {
    // First win achievement
    if (result === 'win' && !window.gameState.achievements?.firstWin) {
        unlockAchievement('first-win', 'First Victory', 25);
    }
    
    // Win streak achievement
    if (window.gameState.currentStreak >= 5 && !window.gameState.achievements?.streak) {
        unlockAchievement('streak', 'On Fire!', 50);
    }
    
    // Master strategist (50 wins)
    const stats = calculateStats();
    if (stats.wins >= 50 && !window.gameState.achievements?.master) {
        unlockAchievement('master', 'Master Strategist', 100);
    }
    
    // Adaptive AI achievement is handled separately when beating adaptive AI
}

// Unlock achievement function
function unlockAchievement(id, name, xpReward) {
    // Initialize achievements object if it doesn't exist
    if (!window.gameState.achievements) {
        window.gameState.achievements = {};
    }
    
    // Mark achievement as unlocked
    window.gameState.achievements[id] = true;
    
    // Update achievement UI
    const achievementElement = document.getElementById(`ach-${id}`);
    if (achievementElement) {
        const statusElement = achievementElement.querySelector('.achievement-status');
        if (statusElement) {
            statusElement.classList.remove('locked');
            statusElement.classList.add('unlocked');
            statusElement.innerHTML = '<i class="fas fa-check"></i>';
        }
    }
    
    // Add XP
    addExperience(xpReward);
    
    // Show notification
    showAchievementNotification(name, xpReward);
    
    // Play achievement sound
    playSound('achievement-sound');
    
    // Save game data
    saveGameData();
}

// Show achievement notification
function showAchievementNotification(name, xpReward) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-icon"><i class="fas fa-trophy"></i></div>
        <div class="achievement-info">
            <h4>Achievement Unlocked!</h4>
            <p>${name}</p>
            <p class="xp-reward">+${xpReward} XP</p>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Add show class after a small delay (for animation)
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove after animation
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 5000);
}

// Add experience points
function addExperience(amount) {
    // Initialize XP if it doesn't exist
    if (!window.gameState.xp) {
        window.gameState.xp = 0;
    }
    
    // Add XP
    window.gameState.xp += amount;
    
    // Check for level up
    checkLevelUp();
    
    // Update XP display
    updateXpDisplay();
}

// Check if player has leveled up
function checkLevelUp() {
    // Initialize level if it doesn't exist
    if (!window.gameState.level) {
        window.gameState.level = 1;
    }
    
    // Calculate XP needed for next level (increases with each level)
    const xpNeeded = 100 * window.gameState.level;
    
    // Check if player has enough XP to level up
    if (window.gameState.xp >= xpNeeded) {
        // Level up
        window.gameState.level++;
        window.gameState.xp -= xpNeeded;
        
        // Show level up notification
        showLevelUpModal();
        
        // Play level up sound
        playSound('level-up');
        
        // Check for level up again (in case of multiple level ups)
        checkLevelUp();
    }
}

// Show level up modal
function showLevelUpModal() {
    // Get modal
    const modal = document.getElementById('level-up-modal');
    if (!modal) return;
    
    // Set level up reward content
    const rewardElement = document.getElementById('level-up-reward');
    if (rewardElement) {
        let rewardContent = '';
        
        // Different rewards based on level
        if (window.gameState.level === 2) {
            rewardContent = `
                <div class="reward-item">
                    <i class="fas fa-gift"></i>
                    <span>New Powerup: Double Points</span>
                </div>
            `;
            // Add powerup
            window.gameState.powerups.double += 2;
        } else if (window.gameState.level === 3) {
            rewardContent = `
                <div class="reward-item">
                    <i class="fas fa-gift"></i>
                    <span>New Powerup: Shield</span>
                </div>
            `;
            // Add powerup
            window.gameState.powerups.shield += 2;
        } else if (window.gameState.level === 5) {
            rewardContent = `
                <div class="reward-item">
                    <i class="fas fa-dragon"></i>
                    <span>New Move: Lizard</span>
                </div>
            `;
            // Unlock lizard move
            unlockMove('lizard');
        } else if (window.gameState.level === 10) {
            rewardContent = `
                <div class="reward-item">
                    <i class="fas fa-hand-spock"></i>
                    <span>New Move: Spock</span>
                </div>
            `;
            // Unlock spock move
            unlockMove('spock');
        } else {
            // Generic reward
            rewardContent = `
                <div class="reward-item">
                    <i class="fas fa-gift"></i>
                    <span>Powerup Pack: +1 of each powerup</span>
                </div>
            `;
            // Add powerups
            window.gameState.powerups.double += 1;
            window.gameState.powerups.shield += 1;
            window.gameState.powerups.peek += 1;
        }
        
        rewardElement.innerHTML = rewardContent;
    }
    
    // Show modal
    modal.classList.add('active');
    
    // Setup claim button
    const claimButton = document.getElementById('claim-reward-btn');
    if (claimButton) {
        claimButton.onclick = function() {
            // Hide modal
            modal.classList.remove('active');
            
            // Update powerup displays
            updateAllPowerupDisplays();
            
            // Update XP display
            updateXpDisplay();
            
            // Save game data
            saveGameData();
        };
    }
}

// Unlock a move
function unlockMove(move) {
    // Initialize unlockedMoves if it doesn't exist
    if (!window.gameState.unlockedMoves) {
        window.gameState.unlockedMoves = ['rock', 'paper', 'scissors'];
    }
    
    // Add move to unlocked moves if not already there
    if (!window.gameState.unlockedMoves.includes(move)) {
        window.gameState.unlockedMoves.push(move);
    }
    
    // Update move button
    const moveButton = document.getElementById(`${move}-btn`);
    if (moveButton) {
        moveButton.classList.remove('locked');
        const lockedBadge = moveButton.querySelector('.locked-badge');
        if (lockedBadge) {
            lockedBadge.remove();
        }
    }
}

// Update XP display
function updateXpDisplay() {
    // Level display
    const levelDisplay = document.getElementById('level-display');
    if (levelDisplay) {
        levelDisplay.textContent = window.gameState.level || 1;
    }
    
    // Player level
    const playerLevel = document.getElementById('player-level');
    if (playerLevel) {
        playerLevel.textContent = window.gameState.level || 1;
    }
    
    // Current XP
    const currentXp = document.getElementById('current-xp');
    if (currentXp) {
        currentXp.textContent = window.gameState.xp || 0;
    }
    
    // XP to level
    const xpToLevel = document.getElementById('xp-to-level');
    if (xpToLevel) {
        xpToLevel.textContent = 100 * (window.gameState.level || 1);
    }
    
    // XP progress bar
    const xpProgress = document.querySelector('.progression-panel .xp-progress');
    if (xpProgress) {
        const progressPercent = (window.gameState.xp || 0) / (100 * (window.gameState.level || 1)) * 100;
        xpProgress.style.width = `${progressPercent}%`;
    }
    
    // Player avatar XP bar
    const playerXpProgress = document.querySelector('.player-avatar .xp-progress');
    if (playerXpProgress) {
        const progressPercent = (window.gameState.xp || 0) / (100 * (window.gameState.level || 1)) * 100;
        playerXpProgress.style.width = `${progressPercent}%`;
    }
    
    // Player avatar XP text
    const playerXpText = document.querySelector('.player-avatar .xp-text');
    if (playerXpText) {
        playerXpText.textContent = `${window.gameState.xp || 0}/${100 * (window.gameState.level || 1)} XP`;
    }
    
    // Next reward display
    const nextRewardDisplay = document.getElementById('next-reward-display');
    if (nextRewardDisplay) {
        let rewardText = '';
        
        // Different rewards based on level
        if (window.gameState.level === 1) {
            rewardText = 'New Powerup: Double Points';
        } else if (window.gameState.level === 2) {
            rewardText = 'New Powerup: Shield';
        } else if (window.gameState.level === 4) {
            rewardText = 'New Move: Lizard';
        } else if (window.gameState.level === 9) {
            rewardText = 'New Move: Spock';
        } else {
            rewardText = 'Powerup Pack';
        }
        
        nextRewardDisplay.innerHTML = `
            <i class="fas fa-gift"></i>
            <span>${rewardText}</span>
        `;
    }
}

// Update all powerup displays
function updateAllPowerupDisplays() {
    const powerupButtons = document.querySelectorAll('.powerup-btn');
    powerupButtons.forEach(button => {
        const powerupType = button.getAttribute('data-powerup');
        if (powerupType) {
            updatePowerupCountDisplay(button, powerupType);
        }
    });
}

// Enhanced update stats function
function updateStats() {
    const stats = calculateStats();
    
    // Basic stats
    document.getElementById('wins-count').textContent = stats.wins;
    document.getElementById('losses-count').textContent = stats.losses;
    document.getElementById('ties-count').textContent = stats.ties;
    document.getElementById('win-rate').textContent = stats.winRate + '%';
    
    // Save game data
    saveGameData();
}

// Render game history with enhanced styling
function renderGameHistory() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    
    historyList.innerHTML = '';
    
    if (!window.gameState.gameHistory || window.gameState.gameHistory.length === 0) {
        const emptyHistory = document.createElement('div');
        emptyHistory.className = 'history-item empty';
        emptyHistory.innerHTML = '<p>No games played yet</p>';
        historyList.appendChild(emptyHistory);
        return;
    }
    
    window.gameState.gameHistory.forEach(game => {
        const historyItem = document.createElement('div');
        historyItem.className = `history-item result-${game.result}`;
        
        // Create move info with emoji images
        const moveInfo = document.createElement('div');
        moveInfo.className = 'move-info';
        moveInfo.innerHTML = `
            <div class="move-img">
                <img src="./images/${game.playerMove}-emoji.png" alt="${game.playerMove}" width="30" height="30">
            </div>
            <span class="vs-text">vs</span>
            <div class="move-img">
                <img src="./images/${game.opponentMove}-emoji.png" alt="${game.opponentMove}" width="30" height="30">
            </div>
        `;
        
        // Create result info
        const resultInfo = document.createElement('div');
        resultInfo.className = 'result-info';
        
        // Add powerup indicator if one was used
        let powerupHtml = '';
        if (game.powerupUsed) {
            powerupHtml = `<span class="powerup-used"><i class="fas fa-${getPowerupIcon(game.powerupUsed)}"></i></span>`;
        }
        
        resultInfo.innerHTML = `
            <span class="result-text">${game.result.toUpperCase()}</span>
            ${powerupHtml}
            <span class="timestamp">${game.timestamp}</span>
        `;
        
        // Add to history item
        historyItem.appendChild(moveInfo);
        historyItem.appendChild(resultInfo);
        
        // Add to history list
        historyList.appendChild(historyItem);
    });
}

// Display a move in the UI
function displayMove(player, move) {
    const displayElement = document.getElementById(`${player}-move-display`);
    displayElement.innerHTML = `<img src="./images/${move}-emoji.png" alt="${move}" class="move-icon">`;
    
    // Apply animation if enabled
    if (window.gameState.animationsEnabled) {
        displayElement.classList.add('bounce-animation');
        setTimeout(() => {
            displayElement.classList.remove('bounce-animation');
        }, 1000);
    }
}

// Reset move displays
function resetMoveDisplays() {
    const playerDisplay = document.getElementById('player-move-display');
    const opponentDisplay = document.getElementById('opponent-move-display');
    
    playerDisplay.innerHTML = '<i class="fa-solid fa-question"></i>';
    opponentDisplay.innerHTML = '<i class="fa-solid fa-question"></i>';
    
    // Remove any previous effects
    playerDisplay.classList.remove('winner-glow', 'loser-glow', 'tie-glow');
    opponentDisplay.classList.remove('winner-glow', 'loser-glow', 'tie-glow');
}

// Apply win effect
function applyWinEffect(winner) {
    if (!window.gameState.animationsEnabled) return;
    
    const playerDisplay = document.getElementById('player-move-display');
    const opponentDisplay = document.getElementById('opponent-move-display');
    
    if (winner === 'player') {
        playerDisplay.classList.add('winner-glow', 'pulse-animation');
        opponentDisplay.classList.add('loser-glow', 'shake-animation');
    } else {
        opponentDisplay.classList.add('winner-glow', 'pulse-animation');
        playerDisplay.classList.add('loser-glow', 'shake-animation');
    }
}

// Apply tie effect
function applyTieEffect() {
    if (!window.gameState.animationsEnabled) return;
    
    const playerDisplay = document.getElementById('player-move-display');
    const opponentDisplay = document.getElementById('opponent-move-display');
    
    playerDisplay.classList.add('tie-glow');
    opponentDisplay.classList.add('tie-glow');
}

// Update result text
function updateResultText(text) {
    const resultTextElement = document.getElementById('result-text');
    
    if (window.gameState.animationsEnabled) {
        resultTextElement.classList.add('hide-result');
        
        setTimeout(() => {
            resultTextElement.textContent = text;
            resultTextElement.classList.remove('hide-result');
            resultTextElement.classList.add('show-result');
            
            setTimeout(() => {
                resultTextElement.classList.remove('show-result');
            }, 500);
        }, 200);
    } else {
        resultTextElement.textContent = text;
    }
}

// Play sound effect
function playSound(soundId) {
    // First check if the sound is enabled in the game state
    if (!window.gameState || window.gameState.soundEnabled === false) {
        return;
    }
    
    // Try to find the sound element
    const sound = document.getElementById(soundId);
    if (!sound) {
        console.warn(`Sound element with ID "${soundId}" not found`);
        return;
    }
    
    // Reset the sound to the beginning and play it
    try {
        sound.currentTime = 0;
        sound.volume = 0.5; // Set a reasonable default volume
        sound.play().catch(e => console.warn(`Error playing sound ${soundId}:`, e));
    } catch (e) {
        console.warn(`Error playing sound ${soundId}:`, e);
    }
}

// Add missing audio elements
function addAudioElements() {
    // Create audio elements for all sounds
    const sounds = [
        { id: 'move-sound', src: 'sounds/move.mp3' },
        { id: 'win-sound', src: 'sounds/win.mp3' },
        { id: 'lose-sound', src: 'sounds/lose.mp3' },
        { id: 'tie-sound', src: 'sounds/tie.mp3' },
        { id: 'powerup-sound', src: 'sounds/powerup.mp3' },
        { id: 'achievement-sound', src: 'sounds/achievement.mp3' },
        { id: 'button-click', src: 'sounds/click.mp3' },
        { id: 'bg-music', src: 'sounds/background.mp3' },
        { id: 'level-up', src: 'sounds/levelup.mp3' },
        { id: 'drag-sound', src: 'sounds/drag.mp3' },
        { id: 'drop-sound', src: 'sounds/drop.mp3' }
    ];
    
    // Create audio elements
    sounds.forEach(sound => {
        // Check if element already exists
        if (!document.getElementById(sound.id)) {
            const audio = document.createElement('audio');
            audio.id = sound.id;
            audio.src = sound.src;
            audio.preload = 'auto';
            document.body.appendChild(audio);
        }
    });
}

// Update the enhanced initialization to include audio elements
const originalEnhancedInitializeGame = enhancedInitializeGame;
enhancedInitializeGame = function() {
    // Add audio elements first
    addAudioElements();
    
    // Call previous initialization
    originalEnhancedInitializeGame();
    
    // Initialize audio manager
    AudioManager.init();
    
    // Add ripple effect
    addRippleEffect();
    
    // Add effects game state
    addEffectsGameState();
    
    // Add parallax tracking
    addParallaxTracking();
    
    // Setup tabs
    setupTabs();
    
    // Fix styles
    validateAndFixStyles();
    
    // Initialize particles
    initializeParticles();
    
    // Play background music
    if (window.gameState.musicEnabled) {
        setTimeout(() => {
            AudioManager.playMusic('background-music');
        }, 1000);
    }
};

// Add ripple effect to buttons
function addRippleEffect() {
    const buttons = document.querySelectorAll('.move-btn, .primary-btn, .mode-btn, .powerup-btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            
            // Get button dimensions
            const rect = this.getBoundingClientRect();
            
            // Calculate ripple size (use the larger dimension)
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = `${size}px`;
            
            // Position ripple from click point
            ripple.style.left = `${e.clientX - rect.left - (size / 2)}px`;
            ripple.style.top = `${e.clientY - rect.top - (size / 2)}px`;
            
            // Add to button
            this.appendChild(ripple);
            
            // Remove after animation completes
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

// Fix game state for effects
function addEffectsGameState() {
    // Add missing props to gameState if they don't exist
    if (window.gameState.effectsEnabled === undefined) {
        window.gameState.effectsEnabled = true;
    }
    
    if (window.gameState.musicEnabled === undefined) {
        window.gameState.musicEnabled = true;
    }
    
    // Set up effect toggle
    const effectsToggle = document.getElementById('effects-toggle');
    if (effectsToggle) {
        effectsToggle.checked = window.gameState.effectsEnabled;
        effectsToggle.addEventListener('change', (e) => {
            window.gameState.effectsEnabled = e.target.checked;
            saveGameData();
        });
    }
    
    // Set up music toggle
    const musicToggle = document.getElementById('music-toggle');
    if (musicToggle) {
        musicToggle.checked = window.gameState.musicEnabled;
        musicToggle.addEventListener('change', (e) => {
            window.gameState.musicEnabled = e.target.checked;
            saveGameData();
            AudioManager.toggleMusic();
        });
    }
}

// Mark active elements with class for animation targeting
function addParallaxTracking() {
    const parallaxElements = document.querySelectorAll('.battle-arena, .move-display, .player-choice, .opponent-choice, .result-display');
    parallaxElements.forEach(el => el.classList.add('parallax-element'));
}

// Add tab switching for stats/history/achievements
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons and panes
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Show corresponding tab pane
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
            
            // Play sound
            if (window.gameState.soundEnabled) {
                AudioManager.play('button-click', { volume: 0.2 });
            }
        });
    });
}

// Initialize the animation controllers after the page is fully loaded
function validateAndFixStyles() {
    // Fix styles for 3D elements
    document.documentElement.style.setProperty('--battle-bg-color', 'rgba(15, 12, 41, 0.4)');
    document.documentElement.style.setProperty('--border-radius-lg', '15px');
    
    // Fix any missing animations
    const style = document.createElement('style');
    style.innerHTML = `
        .move-3d-container {
            transform-style: preserve-3d;
            transition: transform 0.3s ease;
        }
        
        .move-btn:hover .move-3d-container {
            transform: translateZ(10px) rotateY(5deg);
        }
        
        .drop-zone.player-drop-zone {
            position: absolute;
            bottom: 50%;
            left: 50%;
            transform: translate(-50%, 50%);
        }
        
        @keyframes glow {
            0%, 100% { box-shadow: 0 0 10px var(--secondary-color); }
            50% { box-shadow: 0 0 20px var(--accent-color); }
        }
        
        .move-display {
            animation: glow 4s infinite;
        }
    `;
    document.head.appendChild(style);
    
    // Fix positioning
    const battleArena = document.querySelector('.battle-arena');
    if (battleArena) {
        battleArena.style.minHeight = '200px';
    }
}

// Check and initialize particles.js if it exists
function initializeParticles() {
    if (window.particlesJS) {
        particlesJS("particles-js", {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: "#ffffff" },
                shape: { type: "circle" },
                opacity: { value: 0.5, random: true },
                size: { value: 3, random: true },
                line_linked: { enable: true, distance: 150, color: "#ffffff", opacity: 0.4, width: 1 },
                move: { enable: true, speed: 2, random: false, straight: false, out_mode: "out" }
            },
            interactivity: {
                detect_on: "canvas",
                events: { onhover: { enable: true, mode: "repulse" }, resize: true },
                modes: { repulse: { distance: 100, duration: 0.4 } }
            },
            retina_detect: true
        });
    }
}

// Override theme changes
function setupThemeSwitcher() {
    const themeButtons = document.querySelectorAll('.theme-btn');
    if (themeButtons.length === 0) return;
    
    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            themeButtons.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Apply theme
            const theme = btn.getAttribute('data-theme');
            applyTheme(theme);
            
            // Play sound
            if (window.gameState.soundEnabled) {
                AudioManager.play('button-click', { volume: 0.2 });
            }
            
            // Save theme preference
            window.gameState.currentTheme = theme;
            saveGameData();
        });
    });
    
    // Apply saved theme on load
    if (window.gameState.currentTheme) {
        const savedThemeBtn = document.querySelector(`.theme-btn[data-theme="${window.gameState.currentTheme}"]`);
        if (savedThemeBtn) {
            savedThemeBtn.click();
        }
    }
}

// Apply theme colors
function applyTheme(theme) {
    const root = document.documentElement;
    
    // Remove all previous theme classes
    document.body.classList.remove('theme-default', 'theme-dark', 'theme-neon');
    
    // Add the new theme class
    document.body.classList.add('theme-' + theme);
    
    // Update theme-specific variables
    switch(theme) {
        case 'dark':
            root.style.setProperty('--primary-color', '#3d5afe');
            root.style.setProperty('--secondary-color', '#651fff');
            root.style.setProperty('--accent-color', '#00e5ff');
            root.style.setProperty('--bg-color', '#121212');
            root.style.setProperty('--card-bg-color', 'rgba(30, 30, 30, 0.8)');
            root.style.setProperty('--text-color', '#ffffff');
            break;
        case 'neon':
            root.style.setProperty('--primary-color', '#ff00ff');
            root.style.setProperty('--secondary-color', '#00ffff');
            root.style.setProperty('--accent-color', '#ffff00');
            root.style.setProperty('--bg-color', '#000000');
            root.style.setProperty('--card-bg-color', 'rgba(20, 20, 30, 0.85)');
            root.style.setProperty('--text-color', '#ffffff');
            break;
        default: // default theme
            root.style.setProperty('--primary-color', '#1bffff');
            root.style.setProperty('--secondary-color', '#2196f3');
            root.style.setProperty('--accent-color', '#ff006c');
            root.style.setProperty('--bg-color', '#1a237e');
            root.style.setProperty('--card-bg-color', 'rgba(25, 25, 50, 0.8)');
            root.style.setProperty('--text-color', '#ffffff');
    }
    
    // Update particles color if particles.js is loaded
    if (typeof pJSDom !== 'undefined' && pJSDom.length > 0) {
        try {
            const particleColor = getComputedStyle(root).getPropertyValue('--primary-color').trim();
            pJSDom[0].pJS.particles.color.value = particleColor;
            pJSDom[0].pJS.particles.color.rgb = hexToRgb(particleColor);
            pJSDom[0].pJS.fn.particlesRefresh();
        } catch (e) {
            console.warn('Could not update particles color:', e);
        }
    }
}

// Helper function to convert hex to rgb for particles
function hexToRgb(hex) {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse the values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return { r, g, b };
}

// Enhanced Audio System
const AudioManager = {
    sounds: {},
    currentMusic: null,
    audioContext: null,
    masterGain: null,
    spatialSounds: {},
    
    init() {
        console.log("Initializing audio manager");
        
        // Initialize Web Audio API
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            // Create master gain control
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 1.0;
            this.masterGain.connect(this.audioContext.destination);
        } catch (e) {
            console.warn('Web Audio API not supported - falling back to basic audio', e);
        }
        
        // Register all sound elements
        const audioElements = document.querySelectorAll('audio');
        audioElements.forEach(audio => {
            // Store reference to audio element
            this.sounds[audio.id] = audio;
            
            // Add error handler to gracefully handle missing or corrupt audio files
            audio.addEventListener('error', (e) => {
                console.warn(`Error loading audio file for ${audio.id}:`, e);
                // Mark this sound as problematic so we don't keep trying to play it
                this.sounds[audio.id].hasError = true;
            });
        });
        
        // Set volume levels
        if (this.sounds['bg-music']) {
            this.sounds['bg-music'].volume = 0.3;
            this.currentMusic = this.sounds['bg-music'];
        }
        
        // Check if sound is enabled in game state
        if (window.gameState && window.gameState.soundEnabled === false) {
            console.log("Sound is disabled in game settings");
        }
        
        // Add button hover sounds
        this.addButtonHoverSounds();
        
        console.log("Audio manager initialized with", Object.keys(this.sounds).length, "sounds");
    },
    
    createAmbientSound(id, src) {
        if (document.getElementById(id)) return;
        
        const audio = document.createElement('audio');
        audio.id = id;
        audio.src = src;
        audio.preload = 'auto';
        document.body.appendChild(audio);
        this.sounds[id] = audio;
    },
    
    addButtonHoverSounds() {
        const buttons = document.querySelectorAll('.move-btn, .mode-btn, .powerup-btn, .primary-btn');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                if (window.gameState.soundEnabled) {
                    const hoverSound = this.sounds['button-hover'];
                    if (hoverSound) {
                        hoverSound.currentTime = 0;
                        hoverSound.volume = 0.1;
                        hoverSound.play().catch(e => console.warn('Error playing sound:', e));
                    }
                }
            });
        });
    },
    
    play(soundId, options = {}) {
        // Don't play if sound is disabled
        if (!window.gameState || window.gameState.soundEnabled === false) {
            return;
        }
        
        // Find the sound
        const sound = this.sounds[soundId];
        if (!sound) {
            console.warn(`Sound not found: ${soundId}`);
            return;
        }
        
        // Skip if this sound has had errors
        if (sound.hasError) {
            return;
        }
        
        // Reset and configure
        try {
            sound.currentTime = options.time || 0;
            sound.volume = options.volume || 0.5;
            
            // Play with optional effects
            if (options.pitch && this.audioContext) {
                try {
                    // Create a copy to avoid affecting the original
                    const source = this.audioContext.createBufferSource();
                    
                    // If we have a cached decoded buffer
                    if (this.spatialSounds[soundId]) {
                        source.buffer = this.spatialSounds[soundId];
                        this.playSpatialSource(source, options);
                    } else {
                        // Fetch and decode the audio file
                        fetch(sound.src)
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error(`Network error: ${response.status}`);
                                }
                                return response.arrayBuffer();
                            })
                            .then(arrayBuffer => {
                                if (arrayBuffer.byteLength === 0) {
                                    throw new Error('Empty audio file');
                                }
                                return this.audioContext.decodeAudioData(arrayBuffer);
                            })
                            .then(audioBuffer => {
                                // Cache the decoded buffer
                                this.spatialSounds[soundId] = audioBuffer;
                                source.buffer = audioBuffer;
                                this.playSpatialSource(source, options);
                            })
                            .catch(e => {
                                console.warn(`Error with spatial audio for ${soundId}, falling back`, e);
                                sound.hasError = true; // Mark as problematic
                            });
                    }
                } catch (e) {
                    console.warn('Web Audio error, falling back to standard audio', e);
                    sound.play().catch(e => {
                        console.warn(`Error playing sound ${soundId}:`, e);
                        sound.hasError = true; // Mark as problematic
                    });
                }
            } else {
                sound.play().catch(e => {
                    console.warn(`Error playing sound ${soundId}:`, e);
                    sound.hasError = true; // Mark as problematic
                });
            }
        } catch (e) {
            console.warn(`Error setting up sound ${soundId}:`, e);
            sound.hasError = true; // Mark as problematic
        }
    },
    
    playSpatialSource(source, options) {
        if (!this.audioContext) return;
        
        // Create gain node for volume control
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = options.volume || 0.5;
        
        // Create spatial parameters if position is provided
        if (options.position) {
            // Create spatial panner
            const panner = this.audioContext.createPanner();
            panner.panningModel = 'HRTF';
            panner.distanceModel = 'inverse';
            panner.refDistance = 1;
            panner.maxDistance = 10000;
            panner.rolloffFactor = 1;
            
            // Position the sound
            const { x, y, z = 0 } = options.position;
            panner.positionX.value = x;
            panner.positionY.value = y;
            panner.positionZ.value = z;
            
            // Connect the nodes
            source.connect(gainNode);
            gainNode.connect(panner);
            panner.connect(this.masterGain || this.audioContext.destination);
        } else {
            // Standard connection without spatial positioning
            source.connect(gainNode);
            gainNode.connect(this.masterGain || this.audioContext.destination);
        }
        
        // Set pitch if specified
        if (options.pitch) {
            source.playbackRate.value = options.pitch;
        }
        
        // Play the sound
        source.start(0);
    },
    
    // Play sound at a specific position in the game
    playAt(soundId, x, y, options = {}) {
        if (!window.gameState.effectsEnabled || !window.gameState.soundEnabled) return;
        
        // Convert screen coordinates to audio space (-1 to 1)
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        // Normalize to -1 to 1 where 0,0 is the center
        const normalizedX = (x / screenWidth) * 2 - 1;
        const normalizedY = (y / screenHeight) * 2 - 1;
        
        // Call play with position data
        this.play(soundId, {
            ...options,
            position: {
                x: normalizedX,
                y: -normalizedY, // Flip Y for audio space
                z: options.z || -0.5
            }
        });
    },
    
    // Play drag sound with spatial position
    playDragSound(x, y, intensity = 1) {
        if (!window.gameState.effectsEnabled || !window.gameState.soundEnabled) return;
        
        this.playAt('drag-sound', x, y, {
            volume: 0.05 * intensity,
            pitch: 0.8 + (Math.random() * 0.4) // Slight random pitch variation
        });
    },
    
    // Play drop sound with spatial position
    playDropSound(x, y, success = true) {
        if (!window.gameState.effectsEnabled || !window.gameState.soundEnabled) return;
        
        const soundId = success ? 'drop-sound' : 'drag-sound';
        this.playAt(soundId, x, y, {
            volume: success ? 0.4 : 0.1,
            pitch: success ? 1.2 : 0.7
        });
    },
    
    fadeOut(sound, duration = 1000) {
        if (!sound) return;
        
        const startVolume = sound.volume;
        const volumeStep = startVolume / (duration / 50);
        const fadeInterval = setInterval(() => {
            if (sound.volume > volumeStep) {
                sound.volume -= volumeStep;
            } else {
                sound.volume = 0;
                sound.pause();
                clearInterval(fadeInterval);
            }
        }, 50);
    },
    
    fadeIn(sound, duration = 1000, maxVolume = 0.3) {
        if (!sound) return;
        
        sound.volume = 0;
        sound.play().catch(e => console.warn('Error playing sound during fade in:', e));
        
        const volumeStep = maxVolume / (duration / 50);
        const fadeInterval = setInterval(() => {
            if (sound.volume < maxVolume - volumeStep) {
                sound.volume += volumeStep;
            } else {
                sound.volume = maxVolume;
                clearInterval(fadeInterval);
            }
        }, 50);
    },
    
    playMusic(musicId) {
        if (!window.gameState.musicEnabled) return;
        
        const music = this.sounds[musicId];
        if (!music) return;
        
        // If there's already music playing, fade it out
        if (this.currentMusic && !this.currentMusic.paused) {
            this.fadeOut(this.currentMusic);
        }
        
        // Start new music
        this.startNewMusic(musicId);
    },
    
    startNewMusic(musicId) {
        const music = this.sounds[musicId];
        if (!music) return;
        
        music.volume = 0;
        music.play().catch(e => console.warn('Error starting new music:', e));
        this.fadeIn(music);
        this.currentMusic = music;
    },
    
    toggleMusic() {
        // Update the current musicEnabled state in gameState
        window.gameState.musicEnabled = !window.gameState.musicEnabled;
        console.log("Music toggled:", window.gameState.musicEnabled ? "ON" : "OFF");
        
        // Get background music element
        const bgMusic = document.getElementById('bg-music');
        
        if (window.gameState.musicEnabled) {
            // Music should be turned on
            if (this.currentMusic) {
                // Try to resume existing current music
                this.currentMusic.play()
                    .then(() => console.log("Music resumed successfully"))
                    .catch(e => {
                        console.warn("Error resuming music, trying to restart:", e);
                        // If there was an error, try to restart from the beginning
                        if (this.currentMusic) {
                            this.currentMusic.currentTime = 0;
                            this.currentMusic.play()
                                .catch(e => console.warn("Failed to restart music:", e));
                        }
                    });
            } else if (bgMusic) {
                // No current music, but we have the bg-music element
                bgMusic.volume = 0.3;
                bgMusic.currentTime = 0;
                bgMusic.play()
                    .then(() => {
                        this.currentMusic = bgMusic;
                        console.log("Background music started");
                    })
                    .catch(e => console.warn("Error playing background music:", e));
            }
        } else {
            // Music should be turned off
            if (this.currentMusic) {
                this.fadeOut(this.currentMusic, 500);
            }
            
            // Also ensure bg-music is paused
            if (bgMusic && !bgMusic.paused) {
                this.fadeOut(bgMusic, 500);
            }
        }
        
        // Save the setting
        if (typeof saveGameData === 'function') {
            saveGameData();
        }
    },
    
    toggleSound() {
        // Update the soundEnabled state in gameState
        window.gameState.soundEnabled = !window.gameState.soundEnabled;
        console.log("Sound effects toggled:", window.gameState.soundEnabled ? "ON" : "OFF");
        
        // Play a test sound if enabled
        if (window.gameState.soundEnabled) {
            // Find a short sound to play as confirmation
            const testSound = document.getElementById('button-click');
            if (testSound) {
                testSound.volume = 0.2;
                testSound.currentTime = 0;
                testSound.play().catch(e => console.warn("Error playing test sound:", e));
            }
        }
        
        // Save the setting
        if (typeof saveGameData === 'function') {
            saveGameData();
        }
    },
    
    stopAll() {
        Object.values(this.sounds).forEach(sound => {
            sound.pause();
            sound.currentTime = 0;
        });
    }
};

// Update the DragController to use the spatial audio
const originalStartDrag = DragController.startDrag;
DragController.startDrag = function(clone, originalButton, clientX, clientY) {
    // Call the original method
    originalStartDrag.call(this, clone, originalButton, clientX, clientY);
    
    // Play spatial sound
    AudioManager.playAt('button-click', clientX, clientY, { volume: 0.2 });
};

const originalMoveDraggable = DragController.moveDraggable;
DragController.moveDraggable = function(clientX, clientY) {
    // Call the original method
    originalMoveDraggable.call(this, clientX, clientY);
    
    // Play drag sound occasionally when moving
    if (Math.random() < 0.1) { // Only play 10% of the time to avoid too many sounds
        AudioManager.playDragSound(clientX, clientY, 0.5);
    }
};

const originalEndDragWithPosition = DragController.endDragWithPosition;
DragController.endDragWithPosition = function(clientX, clientY) {
    // Check if dropped over a drop zone
    const dropZone = this.getDropZoneAt(clientX, clientY);
    
    // Play drop sound
    AudioManager.playDropSound(clientX, clientY, dropZone !== null);
    
    // Call the original method
    originalEndDragWithPosition.call(this, clientX, clientY);
};

// -------- Loading Screen Functions --------
function initializeLoadingScreen() {
    // Create loading screen if it doesn't exist
    if (!document.getElementById('loading-screen')) {
        const loadingScreen = document.createElement('div');
        loadingScreen.id = 'loading-screen';
        loadingScreen.className = 'loading-screen';
        loadingScreen.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <h2>Loading Rock Paper Scissors Ultimate</h2>
                <p id="loading-message">Initializing game...</p>
            </div>
        `;
        document.body.appendChild(loadingScreen);
    }
    
    // Set up loading messages
    const loadingMessages = [
        'Initializing game...',
        'Loading assets...',
        'Setting up 3D elements...',
        'Preparing audio system...',
        'Almost ready...'
    ];
    
    let messageIndex = 0;
    const loadingMessage = document.getElementById('loading-message');
    
    // Update loading message every second
    const messageInterval = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        if (loadingMessage) {
            loadingMessage.textContent = loadingMessages[messageIndex];
        }
    }, 1000);
    
    // Remove loading screen after assets are loaded
    window.addEventListener('load', () => {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                clearInterval(messageInterval);
                
                // Remove after fade out
                setTimeout(() => {
                    loadingScreen.remove();
                }, 500);
            }
        }, 3000); // Show loading screen for at least 3 seconds
    });
}

// Main initialization when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log("Initializing game...");
    
    // Initialize loading screen
    if (typeof initializeLoadingScreen === 'function') {
        initializeLoadingScreen();
    }
    
    // Add a small delay to ensure all elements are loaded
    setTimeout(function() {
        // Initialize core game functionality
        initializeCore();
    }, 1000);
});

// Core initialization function
function initializeCore() {
    console.log("Setting up core game elements...");
    
    // Load any saved data
    if (typeof loadGameData === 'function') {
        loadGameData();
    }
    
    // Setup move buttons (rock, paper, scissors)
    setupMoveButtons();
    
    // Setup game mode buttons
    setupGameModeButtons();
    
    // Setup stats tabs
    setupTabs();
    
    // Setup settings panel
    setupSettingsPanel();
    
    // Setup powerup buttons
    setupPowerupButtons();
    
    // Prepare the modal buttons
    setupModalButtons();
    
    // Set initial game mode
    setGameMode('computer');
    
    // Apply current theme
    if (typeof applyTheme === 'function') {
        applyTheme(window.gameState.currentTheme || 'default');
    }
    
    // Add ripple effects if supported
    if (typeof addRippleEffect === 'function') {
        addRippleEffect();
    }
    
    // Initialize particles if supported
    if (typeof initializeParticles === 'function') {
        initializeParticles();
    }
    
    // Play background music if enabled
    setTimeout(function() {
        if (window.gameState.musicEnabled && typeof AudioManager !== 'undefined' && AudioManager.playMusic) {
            AudioManager.playMusic('bg-music');
        }
    }, 1500);
    
    console.log("Game initialization complete!");
}

// Setup move buttons (rock, paper, scissors)
function setupMoveButtons() {
    console.log("Setting up move buttons...");
    
    const moveButtons = document.querySelectorAll('.move-btn:not(.locked)');
    moveButtons.forEach(button => {
        button.addEventListener('click', function() {
            const move = this.getAttribute('data-move');
            if (move) {
                console.log("Move selected:", move);
                playGame(move);
            }
        });
    });
}

// Setup game mode buttons
function setupGameModeButtons() {
    console.log("Setting up game mode buttons...");
    
    // VS Computer mode
    const vsComputerBtn = document.getElementById('vs-computer-btn');
    if (vsComputerBtn) {
        vsComputerBtn.addEventListener('click', function() {
            console.log("Switching to Computer mode");
            setGameMode('computer');
        });
    }
    
    // VS Player mode
    const vsPlayerBtn = document.getElementById('vs-player-btn');
    if (vsPlayerBtn) {
        vsPlayerBtn.addEventListener('click', function() {
            console.log("Switching to Player mode");
            setGameMode('player');
        });
    }
    
    // Tournament mode
    const tournamentBtn = document.getElementById('tournament-btn');
    if (tournamentBtn) {
        tournamentBtn.addEventListener('click', function() {
            console.log("Switching to Tournament mode");
            setGameMode('tournament');
        });
    }
    
    // Survival mode
    const survivalBtn = document.getElementById('survival-btn');
    if (survivalBtn) {
        survivalBtn.addEventListener('click', function() {
            console.log("Switching to Survival mode");
            setGameMode('survival');
        });
    }
    
    // Next round button
    const nextRoundBtn = document.getElementById('next-round-btn');
    if (nextRoundBtn) {
        nextRoundBtn.addEventListener('click', function() {
            console.log("Starting next round");
            if (typeof startNextRound === 'function') {
                startNextRound();
            } else {
                console.error("startNextRound function is not defined");
            }
        });
    }
    
    // Difficulty selector
    const difficultySelector = document.getElementById('difficulty');
    if (difficultySelector) {
        difficultySelector.addEventListener('change', function() {
            console.log("Difficulty changed to:", this.value);
            window.gameState.currentDifficulty = this.value;
            if (typeof saveGameData === 'function') {
                saveGameData();
            }
        });
    }
}

// Setup tabs (Stats, History, Achievements)
function setupTabs() {
    console.log("Setting up tabs...");
    
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            console.log("Switching to tab:", tabId);
            
            // Deactivate all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Activate selected tab
            this.classList.add('active');
            const targetPane = document.getElementById(`${tabId}-tab`);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });
    
    // Reset stats button
    const resetStatsBtn = document.getElementById('reset-stats-btn');
    if (resetStatsBtn) {
        resetStatsBtn.addEventListener('click', function() {
            console.log("Resetting stats");
            if (typeof resetStats === 'function') {
                resetStats();
            } else {
                console.error("resetStats function is not defined");
            }
        });
    }
}

// Setup settings panel
function setupSettingsPanel() {
    console.log("Setting up settings panel...");
    
    // Settings button
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function() {
            console.log("Toggling settings panel");
            const settingsContent = document.querySelector('.settings-content');
            if (settingsContent) {
                settingsContent.classList.toggle('active');
            }
        });
    }
    
    // Player name input
    const playerNameInput = document.getElementById('player-name-input');
    if (playerNameInput) {
        playerNameInput.value = window.gameState.playerName || 'YOU';
        playerNameInput.addEventListener('change', function() {
            console.log("Player name changed to:", this.value);
            window.gameState.playerName = this.value || 'YOU';
            const playerNameDisplay = document.getElementById('player-name');
            if (playerNameDisplay) {
                playerNameDisplay.textContent = window.gameState.playerName;
            }
            if (typeof saveGameData === 'function') {
                saveGameData();
            }
        });
    }
    
    // Sound toggle
    const soundToggle = document.getElementById('sound-toggle');
    if (soundToggle) {
        soundToggle.checked = window.gameState.soundEnabled !== false;
        soundToggle.addEventListener('change', function() {
            console.log("Sound effects toggled:", this.checked);
            window.gameState.soundEnabled = this.checked;
            
            // Use AudioManager if available, otherwise just update the gameState
            if (typeof AudioManager !== 'undefined' && AudioManager.toggleSound) {
                // Set the state directly first to avoid double-toggling
                window.gameState.soundEnabled = this.checked;
                AudioManager.toggleSound();
            } else {
                if (typeof saveGameData === 'function') {
                    saveGameData();
                }
            }
        });
    }
    
    // Music toggle
    const musicToggle = document.getElementById('music-toggle');
    if (musicToggle) {
        musicToggle.checked = window.gameState.musicEnabled !== false;
        musicToggle.addEventListener('change', function() {
            console.log("Background music toggled:", this.checked);
            
            // Use AudioManager if available, otherwise just update the gameState
            if (typeof AudioManager !== 'undefined' && AudioManager.toggleMusic) {
                // Set the state directly first to avoid double-toggling
                window.gameState.musicEnabled = this.checked;
                AudioManager.toggleMusic();
            } else {
                window.gameState.musicEnabled = this.checked;
                // Handle simple toggle without AudioManager
                const bgMusic = document.getElementById('bg-music');
                if (bgMusic) {
                    if (this.checked) {
                        bgMusic.play().catch(e => console.warn("Error playing background music:", e));
                    } else {
                        bgMusic.pause();
                    }
                }
                if (typeof saveGameData === 'function') {
                    saveGameData();
                }
            }
        });
    }
    
    // Animation toggle
    const animationToggle = document.getElementById('animation-toggle');
    if (animationToggle) {
        animationToggle.checked = window.gameState.animationsEnabled !== false;
        animationToggle.addEventListener('change', function() {
            console.log("Animations toggled:", this.checked);
            window.gameState.animationsEnabled = this.checked;
            if (typeof saveGameData === 'function') {
                saveGameData();
            }
        });
    }
    
    // Effects toggle
    const effectsToggle = document.getElementById('effects-toggle');
    if (effectsToggle) {
        effectsToggle.checked = window.gameState.effectsEnabled !== false;
        effectsToggle.addEventListener('change', function() {
            console.log("3D effects toggled:", this.checked);
            window.gameState.effectsEnabled = this.checked;
            if (typeof saveGameData === 'function') {
                saveGameData();
            }
        });
    }
    
    // Theme buttons
    const themeButtons = document.querySelectorAll('.theme-btn');
    themeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            console.log("Theme changed to:", theme);
            if (theme) {
                themeButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                window.gameState.currentTheme = theme;
                if (typeof applyTheme === 'function') {
                    applyTheme(theme);
                }
                if (typeof saveGameData === 'function') {
                    saveGameData();
                }
            }
        });
    });
    
    // Clear data button
    const clearDataBtn = document.getElementById('clear-data-btn');
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', function() {
            console.log("Clearing all game data");
            if (typeof clearAllData === 'function') {
                clearAllData();
            } else {
                console.error("clearAllData function is not defined");
            }
        });
    }
}

// Setup powerup buttons
function setupPowerupButtons() {
    console.log("Setting up powerup buttons...");
    
    // Ensure powerups are initialized in game state
    if (!window.gameState.powerups) {
        window.gameState.powerups = {
            double: 2,
            shield: 1,
            peek: 1
        };
    }
    
    const powerupButtons = document.querySelectorAll('.powerup-btn');
    powerupButtons.forEach(button => {
        const powerupType = button.getAttribute('data-powerup');
        if (powerupType) {
            button.addEventListener('click', function() {
                console.log("Activating powerup:", powerupType);
                if (typeof activatePowerup === 'function') {
                    activatePowerup(powerupType);
                } else {
                    console.error("activatePowerup function is not defined");
                }
            });
            
            // Update powerup count display
            updatePowerupCountDisplay(button, powerupType);
        }
    });
}

// Update powerup count display
function updatePowerupCountDisplay(button, powerupType) {
    const count = window.gameState.powerups[powerupType] || 0;
    
    // Create or update counter element
    let counter = button.querySelector('.powerup-counter');
    if (!counter) {
        counter = document.createElement('span');
        counter.className = 'powerup-counter';
        button.appendChild(counter);
    }
    counter.textContent = count;
    
    // Disable button if count is 0
    if (count <= 0) {
        button.classList.add('disabled');
    } else {
        button.classList.remove('disabled');
    }
}

// Setup modal buttons
function setupModalButtons() {
    console.log("Setting up modal buttons...");
    
    // Close buttons for all modals
    const closeButtons = document.querySelectorAll('.close-modal-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // Daily challenge button
    const dailyChallengeBtn = document.getElementById('daily-challenge-btn');
    if (dailyChallengeBtn) {
        dailyChallengeBtn.addEventListener('click', function() {
            console.log("Opening daily challenge");
            const dailyChallengeModal = document.getElementById('daily-challenge-modal');
            if (dailyChallengeModal) {
                dailyChallengeModal.classList.add('active');
            }
        });
    }
    
    // Start challenge button
    const startChallengeBtn = document.getElementById('start-challenge-btn');
    if (startChallengeBtn) {
        startChallengeBtn.addEventListener('click', function() {
            console.log("Starting daily challenge");
            if (typeof startDailyChallenge === 'function') {
                startDailyChallenge();
            } else {
                console.log("startDailyChallenge function is not defined");
                // Close modal as fallback
                const modal = this.closest('.modal');
                if (modal) {
                    modal.classList.remove('active');
                }
            }
        });
    }
    
    // Claim reward button
    const claimRewardBtn = document.getElementById('claim-reward-btn');
    if (claimRewardBtn) {
        claimRewardBtn.addEventListener('click', function() {
            console.log("Claiming level reward");
            if (typeof claimLevelReward === 'function') {
                claimLevelReward();
            } else {
                console.log("claimLevelReward function is not defined");
                // Close modal as fallback
                const modal = this.closest('.modal');
                if (modal) {
                    modal.classList.remove('active');
                }
            }
        });
    }
    }