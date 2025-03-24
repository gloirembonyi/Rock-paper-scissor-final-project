/**
 * Rock Paper Scissors Ultimate - Game Statistics
 * This file handles tracking and displaying game statistics
 */

// Initialize statistics in gameState if needed
function initializeStats() {
    if (!window.gameState) {
        window.gameState = {};
    }
    
    // Initialize statistics
    if (!window.gameState.stats) {
        window.gameState.stats = {
            wins: 0,
            losses: 0,
            ties: 0,
            currentStreak: 0,
            longestStreak: 0,
            highestCombo: 0,
            powerupsUsed: 0,
            movesUsed: {
                rock: 0,
                paper: 0, 
                scissors: 0,
                lizard: 0,
                spock: 0
            }
        };
    }
    
    // Initialize achievements
    if (!window.gameState.achievements) {
        window.gameState.achievements = {
            firstWin: false,
            streak: false,
            master: false,
            adaptive: false
        };
    }
    
    // Initialize game history
    if (!window.gameState.gameHistory) {
        window.gameState.gameHistory = [];
    }
}

// Record game result
function recordGameResult(playerMove, opponentMove, result) {
    // Initialize if needed
    initializeStats();
    
    // Create timestamp
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Check for active powerup
    const powerupUsed = window.gameState.activePowerup || null;
    
    // Create game record
    const gameRecord = {
        playerMove,
        opponentMove,
        result,
        timestamp,
        powerupUsed
    };
    
    // Add to history
    window.gameState.gameHistory.unshift(gameRecord);
    
    // Limit history size
    const maxHistoryItems = window.gameState.maxHistoryItems || 10;
    if (window.gameState.gameHistory.length > maxHistoryItems) {
        window.gameState.gameHistory.pop();
    }
    
    // Update stats
    updateStatistics(playerMove, result);
    
    // Reset active powerup
    window.gameState.activePowerup = null;
    
    // Update UI
    updateStatsUI();
    renderGameHistory();
    
    // Check achievements
    checkAchievements(result);
    
    // Save game data
    saveGameData();
    
    return gameRecord;
}

// Update statistics based on game result
function updateStatistics(playerMove, result) {
    const stats = window.gameState.stats;
    
    // Update move counts
    if (stats.movesUsed[playerMove] !== undefined) {
        stats.movesUsed[playerMove]++;
    }
    
    // Update result counts
    if (result === 'win') {
        stats.wins++;
        // Update streak
        stats.currentStreak++;
        if (stats.currentStreak > stats.longestStreak) {
            stats.longestStreak = stats.currentStreak;
        }
    } else if (result === 'loss') {
        stats.losses++;
        // Reset streak
        stats.currentStreak = 0;
    } else {
        stats.ties++;
        // Ties don't affect streak
    }
}

// Update all statistics displays in UI
function updateStatsUI() {
    const stats = window.gameState.stats;
    
    // Basic stats
    if (document.getElementById('wins-count')) {
        document.getElementById('wins-count').textContent = stats.wins;
    }
    
    if (document.getElementById('losses-count')) {
        document.getElementById('losses-count').textContent = stats.losses;
    }
    
    if (document.getElementById('ties-count')) {
        document.getElementById('ties-count').textContent = stats.ties;
    }
    
    // Win rate
    const total = stats.wins + stats.losses + stats.ties;
    const winRate = total > 0 ? Math.round((stats.wins / total) * 100) : 0;
    if (document.getElementById('win-rate')) {
        document.getElementById('win-rate').textContent = winRate + '%';
    }
    
    // Advanced stats
    if (document.getElementById('longest-streak')) {
        document.getElementById('longest-streak').textContent = stats.longestStreak;
    }
    
    if (document.getElementById('current-streak')) {
        document.getElementById('current-streak').textContent = stats.currentStreak;
    }
    
    if (document.getElementById('highest-combo')) {
        document.getElementById('highest-combo').textContent = stats.highestCombo;
    }
    
    if (document.getElementById('powerups-used')) {
        document.getElementById('powerups-used').textContent = stats.powerupsUsed;
    }
    
    // Update chart
    updateMovesChart();
}

// Update the moves chart
function updateMovesChart() {
    // Check if Chart.js is available
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js not loaded');
        return;
    }
    
    // Get the canvas
    const canvas = document.getElementById('moves-chart');
    if (!canvas) {
        console.warn('Chart canvas not found');
        return;
    }
    
    // Get move data
    const movesData = window.gameState.stats.movesUsed;
    
    // Destroy existing chart
    if (window.movesChart) {
        window.movesChart.destroy();
    }
    
    // Create chart
    window.movesChart = new Chart(canvas, {
        type: 'pie',
        data: {
            labels: ['Rock', 'Paper', 'Scissors'],
            datasets: [{
                data: [movesData.rock, movesData.paper, movesData.scissors],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
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

// Render game history
function renderGameHistory() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    
    // Clear current history
    historyList.innerHTML = '';
    
    // Get game history
    const history = window.gameState.gameHistory || [];
    
    if (history.length === 0) {
        // Show empty state
        const emptyItem = document.createElement('div');
        emptyItem.className = 'history-item empty';
        emptyItem.textContent = 'No games played yet';
        historyList.appendChild(emptyItem);
        return;
    }
    
    // Add history items
    history.forEach(game => {
        const historyItem = document.createElement('div');
        historyItem.className = `history-item ${game.result}`;
        
        // Create move comparison
        const moveInfo = document.createElement('div');
        moveInfo.className = 'move-info';
        moveInfo.innerHTML = `
            <div class="player-move">
                <img src="./images/${game.playerMove}-emoji.png" alt="${game.playerMove}" width="20" height="20">
            </div>
            <div class="vs">VS</div>
            <div class="opponent-move">
                <img src="./images/${game.opponentMove}-emoji.png" alt="${game.opponentMove}" width="20" height="20">
            </div>
        `;
        
        // Create result display
        const resultInfo = document.createElement('div');
        resultInfo.className = 'result-info';
        resultInfo.innerHTML = `
            <div class="result ${game.result}">${game.result.toUpperCase()}</div>
            <div class="timestamp">${game.timestamp}</div>
        `;
        
        // Add powerup indicator if used
        if (game.powerupUsed) {
            const powerupIndicator = document.createElement('div');
            powerupIndicator.className = 'powerup-used';
            powerupIndicator.innerHTML = `<i class="fas fa-${getPowerupIcon(game.powerupUsed)}"></i>`;
            resultInfo.appendChild(powerupIndicator);
        }
        
        // Assemble history item
        historyItem.appendChild(moveInfo);
        historyItem.appendChild(resultInfo);
        
        // Add to history list
        historyList.appendChild(historyItem);
    });
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

// Check for achievements
function checkAchievements(result) {
    const achievements = window.gameState.achievements;
    const stats = window.gameState.stats;
    
    // First win
    if (result === 'win' && !achievements.firstWin) {
        unlockAchievement('first-win', 'First Victory', 25);
        achievements.firstWin = true;
    }
    
    // Win streak
    if (stats.currentStreak >= 5 && !achievements.streak) {
        unlockAchievement('streak', 'On Fire!', 50);
        achievements.streak = true;
    }
    
    // Master strategist
    if (stats.wins >= 50 && !achievements.master) {
        unlockAchievement('master', 'Master Strategist', 100);
        achievements.master = true;
    }
}

// Unlock achievement
function unlockAchievement(id, name, xpReward) {
    // Update DOM
    const achievementElement = document.getElementById(`ach-${id}`);
    if (achievementElement) {
        const statusElement = achievementElement.querySelector('.achievement-status');
        if (statusElement) {
            statusElement.classList.remove('locked');
            statusElement.classList.add('unlocked');
            statusElement.innerHTML = '<i class="fas fa-check"></i>';
        }
    }
    
    // Show notification
    showAchievementNotification(name, xpReward);
    
    // Add XP
    if (typeof addExperience === 'function') {
        addExperience(xpReward);
    }
    
    // Play sound
    playSound('achievement-sound');
}

// Show achievement notification
function showAchievementNotification(name, xpReward) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-icon">
            <i class="fas fa-trophy"></i>
        </div>
        <div class="achievement-content">
            <div class="achievement-title">Achievement Unlocked!</div>
            <div class="achievement-name">${name}</div>
            <div class="achievement-reward">+${xpReward} XP</div>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 5000);
}

// Reset statistics
function resetStats() {
    if (confirm('Are you sure you want to reset all game statistics? This cannot be undone.')) {
        // Reset stats
        window.gameState.stats = {
            wins: 0,
            losses: 0,
            ties: 0,
            currentStreak: 0,
            longestStreak: 0,
            highestCombo: 0,
            powerupsUsed: 0,
            movesUsed: {
                rock: 0,
                paper: 0,
                scissors: 0,
                lizard: 0,
                spock: 0
            }
        };
        
        // Clear history
        window.gameState.gameHistory = [];
        
        // Update UI
        updateStatsUI();
        renderGameHistory();
        
        // Save game data
        saveGameData();
        
        // Show message
        updateResultText('STATISTICS RESET');
        
        // Play sound
        playSound('button-click');
        
        return true;
    }
    
    return false;
}

// Track powerup usage
function trackPowerupUsage(powerupType) {
    // Increment counter
    window.gameState.stats.powerupsUsed++;
    
    // Save data
    saveGameData();
}

// Initialize stats when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize statistics
    initializeStats();
    
    // Set up button
    const resetStatsBtn = document.getElementById('reset-stats-btn');
    if (resetStatsBtn) {
        resetStatsBtn.addEventListener('click', resetStats);
    }
    
    // Set up tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            if (tabId === 'stats') {
                // Update chart when stats tab is selected
                setTimeout(updateMovesChart, 100);
            }
        });
    });
    
    // Initial UI update
    updateStatsUI();
    renderGameHistory();
});

// Helper function to call playSound if available
function playSound(soundId) {
    if (typeof window.playSound === 'function') {
        window.playSound(soundId);
    } else if (window.gameState && window.gameState.soundEnabled) {
        const sound = document.getElementById(soundId);
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.warn('Error playing sound:', e));
        }
    }
}

// Helper function to update result text
function updateResultText(text) {
    if (typeof window.updateResultText === 'function') {
        window.updateResultText(text);
    } else {
        const resultText = document.getElementById('result-text');
        if (resultText) {
            resultText.textContent = text;
        }
    }
}

// Helper function to save game data
function saveGameData() {
    if (typeof window.saveGameData === 'function') {
        window.saveGameData();
    } else if (window.gameState) {
        localStorage.setItem('rpsGameData', JSON.stringify(window.gameState));
    }
} 