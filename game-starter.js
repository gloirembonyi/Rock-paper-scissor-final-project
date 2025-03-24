document.addEventListener('DOMContentLoaded', function() { 
    console.log("Game starter initialized");
    setupMoveButtons(); 
    setupGameModeButtons(); 
    setupSettingsPanel();
    setupPowerupButtons();
    setupTabs();
    addRippleEffect();
    initializeParticles();
    
    // Remove loading screen
    setTimeout(function() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(function() {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }, 1000);
}); 

// Create global gameState only if not already defined
if (typeof window.gameState === 'undefined') {
    window.gameState = {
        playerScore: 0,
        opponentScore: 0,
        currentMode: 'computer'
    };
}

// Setup move buttons (rock, paper, scissors)
function setupMoveButtons() { 
    const moveButtons = document.querySelectorAll('.move-btn:not(.locked)'); 
    moveButtons.forEach(button => { 
        button.addEventListener('click', function() { 
            const move = this.getAttribute('data-move'); 
            if (move) { 
                console.log('Move clicked:', move); 
                playGame(move);
            } 
        }); 
    }); 
} 

// Setup game mode buttons 
function setupGameModeButtons() { 
    const modeButtons = document.querySelectorAll('.mode-btn'); 
    modeButtons.forEach(button => { 
        button.addEventListener('click', function() { 
            // Remove active class from all mode buttons
            modeButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Set game mode
            const mode = this.id.replace('-btn', '').replace('vs-', '');
            window.gameState.currentMode = mode;
            console.log('Game mode set to:', mode);
            
            // Update UI
            document.getElementById('result-text').textContent = 'CHOOSE YOUR MOVE';
            
            // Update opponent name based on mode
            const opponentName = document.getElementById('opponent-name');
            if (mode === 'computer') {
                opponentName.textContent = 'COMPUTER';
            } else if (mode === 'player') {
                opponentName.textContent = 'PLAYER 2';
            } else if (mode === 'tournament') {
                opponentName.textContent = 'TOURNAMENT';
            } else if (mode === 'survival') {
                opponentName.textContent = 'CHALLENGER';
            }
            
            // Reset scores
            window.gameState.playerScore = 0;
            window.gameState.opponentScore = 0;
            document.getElementById('player-score').textContent = '0';
            document.getElementById('opponent-score').textContent = '0';
            
            // Reset move displays
            resetMoveDisplays();
        }); 
    }); 
} 

// Setup settings panel
function setupSettingsPanel() {
    // Settings button
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function() {
            const settingsContent = document.querySelector('.settings-content');
            if (settingsContent) {
                settingsContent.classList.toggle('active');
            }
        });
    }
    
    // Theme buttons
    const themeButtons = document.querySelectorAll('.theme-btn');
    themeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all theme buttons
            themeButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Apply theme
            const theme = this.getAttribute('data-theme');
            applyTheme(theme);
        });
    });
    
    // Toggles
    const toggles = document.querySelectorAll('input[type="checkbox"]');
    toggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            console.log(this.id, 'set to', this.checked);
        });
    });
}

// Setup powerup buttons
function setupPowerupButtons() {
    const powerupButtons = document.querySelectorAll('.powerup-btn');
    powerupButtons.forEach(button => {
        button.addEventListener('click', function() {
            const powerup = this.getAttribute('data-powerup');
            console.log('Powerup activated:', powerup);
            document.getElementById('result-text').textContent = powerup.toUpperCase() + ' POWERUP ACTIVATED!';
            
            // Reset message after delay
            setTimeout(() => {
                document.getElementById('result-text').textContent = 'CHOOSE YOUR MOVE';
            }, 2000);
        });
    });
}

// Setup tabs
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to this button
            this.classList.add('active');
            
            // Show the corresponding tab
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId + '-tab').classList.add('active');
        });
    });
    
    // Reset stats button
    const resetStatsBtn = document.getElementById('reset-stats-btn');
    if (resetStatsBtn) {
        resetStatsBtn.addEventListener('click', function() {
            console.log('Stats reset');
            document.getElementById('result-text').textContent = 'STATS RESET COMPLETE!';
            
            // Reset message after delay
            setTimeout(() => {
                document.getElementById('result-text').textContent = 'CHOOSE YOUR MOVE';
            }, 2000);
        });
    }
}

// Add ripple effect to buttons
function addRippleEffect() {
    const buttons = document.querySelectorAll('.move-btn, .mode-btn, .tab-btn, .primary-btn, button:not(.theme-btn)');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${e.clientX - rect.left - (size / 2)}px`;
            ripple.style.top = `${e.clientY - rect.top - (size / 2)}px`;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Play game function
function playGame(playerMove) {
    // Display player's move with attack animation
    displayMove('player', playerMove);
    
    // Add attacking animation
    const playerMoveDisplay = document.getElementById('player-move-display');
    playerMoveDisplay.classList.add('attacking');
    
    // Reset animation after a delay
    setTimeout(() => {
        playerMoveDisplay.classList.remove('attacking');
    }, 500);
    
    // Generate computer's move
    const moves = ['rock', 'paper', 'scissors'];
    const computerMove = moves[Math.floor(Math.random() * moves.length)];
    
    // Show computer's move after a delay with attack animation
    setTimeout(() => {
        displayMove('opponent', computerMove);
        const opponentMoveDisplay = document.getElementById('opponent-move-display');
        opponentMoveDisplay.classList.add('attacking');
        
        // Reset animation after a delay
        setTimeout(() => {
            opponentMoveDisplay.classList.remove('attacking');
        }, 500);
        
        // Determine winner
        const result = determineWinner(playerMove, computerMove);
        
        // Update UI with visual effects
        if (result === 'win') {
            window.gameState.playerScore++;
            document.getElementById('player-score').textContent = window.gameState.playerScore;
            document.getElementById('result-text').textContent = 'YOU WIN!';
            
            // Apply winner and loser effects
            playerMoveDisplay.classList.add('winner');
            opponentMoveDisplay.classList.add('loser');
        } else if (result === 'loss') {
            window.gameState.opponentScore++;
            document.getElementById('opponent-score').textContent = window.gameState.opponentScore;
            document.getElementById('result-text').textContent = 'YOU LOSE!';
            
            // Apply winner and loser effects
            playerMoveDisplay.classList.add('loser');
            opponentMoveDisplay.classList.add('winner');
        } else {
            document.getElementById('result-text').textContent = 'TIE GAME!';
            
            // Apply tie effect
            playerMoveDisplay.classList.add('tie');
            opponentMoveDisplay.classList.add('tie');
        }
        
        // Reset message and effects after delay
        setTimeout(() => {
            document.getElementById('result-text').textContent = 'CHOOSE YOUR MOVE';
            resetMoveDisplays();
            
            // Remove effects
            playerMoveDisplay.classList.remove('winner', 'loser', 'tie');
            opponentMoveDisplay.classList.remove('winner', 'loser', 'tie');
        }, 2000);
    }, 1000);
}

// Determine winner
function determineWinner(playerMove, opponentMove) {
    if (playerMove === opponentMove) return 'tie';
    
    if ((playerMove === 'rock' && opponentMove === 'scissors') ||
        (playerMove === 'paper' && opponentMove === 'rock') ||
        (playerMove === 'scissors' && opponentMove === 'paper')) {
        return 'win';
    } else {
        return 'loss';
    }
}

// Display move
function displayMove(player, move) {
    const displayElement = document.getElementById(`${player}-move-display`);
    if (!displayElement) return;
    
    // Clear existing content
    displayElement.innerHTML = '';
    
    // Display the move
    if (move === 'rock' || move === 'paper' || move === 'scissors') {
        const img = document.createElement('img');
        img.src = `./images/${move}-emoji.png`;
        img.alt = move;
        img.className = 'move-icon';
        displayElement.appendChild(img);
    } else {
        const icon = document.createElement('i');
        icon.className = 'fas fa-question';
        displayElement.appendChild(icon);
    }
}

// Reset move displays
function resetMoveDisplays() {
    const playerDisplay = document.getElementById('player-move-display');
    const opponentDisplay = document.getElementById('opponent-move-display');
    
    if (playerDisplay) {
        playerDisplay.innerHTML = '<i class="fas fa-question"></i>';
    }
    
    if (opponentDisplay) {
        opponentDisplay.innerHTML = '<i class="fas fa-question"></i>';
    }
}

// Apply theme
function applyTheme(theme) {
    const root = document.documentElement;
    
    switch(theme) {
        case 'dark':
            root.style.setProperty('--primary-color', '#131313');
            root.style.setProperty('--secondary-color', '#6b6b6b');
            root.style.setProperty('--background-color', '#000000');
            root.style.setProperty('--card-bg-color', 'rgba(10, 10, 10, 0.7)');
            root.style.setProperty('--text-color', '#cccccc');
            root.style.setProperty('--accent-color', '#505050');
            break;
            
        case 'neon':
            root.style.setProperty('--primary-color', '#ff00ff');
            root.style.setProperty('--secondary-color', '#00ffff');
            root.style.setProperty('--background-color', '#000033');
            root.style.setProperty('--card-bg-color', 'rgba(10, 10, 30, 0.7)');
            root.style.setProperty('--text-color', '#ffffff');
            root.style.setProperty('--accent-color', '#ffff00');
            break;
            
        default: // default theme
            root.style.setProperty('--primary-color', '#2e3192');
            root.style.setProperty('--secondary-color', '#1bffff');
            root.style.setProperty('--background-color', '#0f0c29');
            root.style.setProperty('--card-bg-color', 'rgba(30, 30, 60, 0.7)');
            root.style.setProperty('--text-color', '#ffffff');
            root.style.setProperty('--accent-color', '#ff006c');
            break;
    }
}

// Initialize particles.js
function initializeParticles() {
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            "particles": {
                "number": {
                    "value": 80,
                    "density": {
                        "enable": true,
                        "value_area": 800
                    }
                },
                "color": {
                    "value": "#1bffff"
                },
                "shape": {
                    "type": "circle",
                    "stroke": {
                        "width": 0,
                        "color": "#000000"
                    },
                    "polygon": {
                        "nb_sides": 5
                    }
                },
                "opacity": {
                    "value": 0.5,
                    "random": true,
                    "anim": {
                        "enable": true,
                        "speed": 1,
                        "opacity_min": 0.1,
                        "sync": false
                    }
                },
                "size": {
                    "value": 3,
                    "random": true,
                    "anim": {
                        "enable": true,
                        "speed": 2,
                        "size_min": 0.1,
                        "sync": false
                    }
                },
                "line_linked": {
                    "enable": true,
                    "distance": 150,
                    "color": "#1bffff",
                    "opacity": 0.4,
                    "width": 1
                },
                "move": {
                    "enable": true,
                    "speed": 1,
                    "direction": "none",
                    "random": true,
                    "straight": false,
                    "out_mode": "out",
                    "bounce": false,
                    "attract": {
                        "enable": false,
                        "rotateX": 600,
                        "rotateY": 1200
                    }
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": {
                        "enable": true,
                        "mode": "grab"
                    },
                    "onclick": {
                        "enable": true,
                        "mode": "push"
                    },
                    "resize": true
                },
                "modes": {
                    "grab": {
                        "distance": 140,
                        "line_linked": {
                            "opacity": 1
                        }
                    },
                    "bubble": {
                        "distance": 400,
                        "size": 40,
                        "duration": 2,
                        "opacity": 8,
                        "speed": 3
                    },
                    "repulse": {
                        "distance": 200,
                        "duration": 0.4
                    },
                    "push": {
                        "particles_nb": 4
                    },
                    "remove": {
                        "particles_nb": 2
                    }
                }
            },
            "retina_detect": true
        });
    }
}
