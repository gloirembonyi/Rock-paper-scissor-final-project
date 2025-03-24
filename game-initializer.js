/**
 * Rock Paper Scissors - Game Initializer
 * This script handles global game initialization and resolves conflicts between script files
 */

// Define gameState globally on window if not already defined
if (typeof window.gameState === 'undefined') {
    window.gameState = {
        playerName: "PLAYER 1",
        opponentName: "COMPUTER",
        playerScore: 0,
        opponentScore: 0,
        currentMode: 'computer',
        difficulty: 'normal',
        soundEnabled: true,
        musicEnabled: true,
        animationsEnabled: true,
        effectsEnabled: true,
        theme: 'default',
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        gameHistory: [],
        maxHistoryItems: 10,
        powerups: {
            double: 3,
            shield: 2,
            peek: 1
        },
        activePowerup: null,
        powerupsUsed: 0
    };
}

// Initialize audio elements
function initAudio() {
    const audioIds = [
        'move-sound', 'win-sound', 'lose-sound', 'tie-sound', 
        'powerup-sound', 'achievement-sound', 'button-click', 
        'level-up', 'drag-sound', 'drop-sound', 'bg-music'
    ];
    
    audioIds.forEach(id => {
        if (!document.getElementById(id)) {
            const audio = document.createElement('audio');
            audio.id = id;
            audio.preload = 'auto';
            
            // Set different sources based on the sound type
            let src = '';
            if (id === 'bg-music') {
                src = './sounds/background-music.mp3';
            } else if (id === 'win-sound') {
                src = './sounds/win.mp3';
            } else if (id === 'lose-sound') {
                src = './sounds/lose.mp3';
            } else if (id === 'tie-sound') {
                src = './sounds/tie.mp3';
            } else if (id === 'powerup-sound') {
                src = './sounds/powerup.mp3';
            } else if (id === 'achievement-sound') {
                src = './sounds/achievement.mp3';
            } else if (id === 'level-up') {
                src = './sounds/level-up.mp3';
            } else {
                src = `./sounds/${id}.mp3`;
            }
            
            const source = document.createElement('source');
            source.src = src;
            source.type = 'audio/mpeg';
            
            audio.appendChild(source);
            document.body.appendChild(audio);
        }
    });
    
    // Set up audio with proper volume levels
    const bgMusic = document.getElementById('bg-music');
    if (bgMusic) {
        bgMusic.volume = 0.2;
        bgMusic.loop = true;
    }
}

// Main initialization function
document.addEventListener('DOMContentLoaded', function() {
    console.log('Game initializer running...');
    
    // Load game data first
    if (typeof loadGameData === 'function') {
        loadGameData();
    }
    
    // Initialize audio elements
    initAudio();
    
    // Initialize stats system if available
    if (typeof initializeStats === 'function') {
        console.log('Initializing statistics system...');
        initializeStats();
    }
    
    // Initialize audio system if available
    if (typeof window.AudioManager !== 'undefined' && typeof window.AudioManager.init === 'function') {
        console.log('Initializing audio system...');
        window.AudioManager.init();
        
        // Apply sound settings immediately
        if (window.gameState.musicEnabled === false && window.AudioManager.currentMusic) {
            window.AudioManager.currentMusic.pause();
        }
    }
    
    // Load saved theme
    const savedTheme = localStorage.getItem('rpsTheme');
    if (savedTheme && typeof applyTheme === 'function') {
        applyTheme(savedTheme);
    }
    
    // Remove loading screen after a delay
    setTimeout(function() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(function() {
                loadingScreen.style.display = 'none';
            }, 500);
        }
        
        // Play background music if enabled
        if (window.gameState.musicEnabled !== false) {
            const bgMusic = document.getElementById('bg-music');
            if (bgMusic) {
                bgMusic.volume = 0.3;
                bgMusic.play().catch(e => {
                    console.warn('Error playing background music:', e);
                    
                    // Some browsers require user interaction before playing audio
                    // We'll try to play the music when the user interacts with the page
                    const playMusicOnInteraction = function() {
                        bgMusic.play().catch(e => console.warn('Still could not play music:', e));
                        document.removeEventListener('click', playMusicOnInteraction);
                    };
                    document.addEventListener('click', playMusicOnInteraction);
                });
            }
        }
    }, 1500);
}); 