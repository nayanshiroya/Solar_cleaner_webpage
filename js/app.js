// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadSavedConfigurations();
    
    // Initialize WebSocket connection
    initializeSocket();
    
    // Attach event listeners to all test buttons
    const testButtons = document.querySelectorAll('.test-btn');
    testButtons.forEach((btn, index) => {
        btn.addEventListener('click', () => handleTest(index));
    });
    
    // Attach event listener to save button
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.addEventListener('click', handleSave);
    
    // Attach event listener to saved names selector
    const savedNames = document.getElementById('savedNames');
    savedNames.addEventListener('change', displaySavedData);
    
    // Attach event listener to run cycle button
    const runCycleBtn = document.getElementById('runCycleBtn');
    runCycleBtn.addEventListener('click', handleRunCycle);
    
    // Attach event listener to emergency button
    const emergencyBtn = document.querySelector('.danger_button');
    emergencyBtn.addEventListener('click', handleEmergency);
    
    // Load saved configurations on page load
    updateSavedNamesSelector();
});

// Initialize WebSocket connection
function initializeSocket() {
    // You can configure the WebSocket URL here
    // socketManager.url = 'ws://your-server-url:port';
    
    // Connect to WebSocket
    socketManager.connect();
}

// Handle emergency button click
function handleEmergency() {
    const data = {
        type: 'emergency',
        action: 'STOP_ALL',
        timestamp: new Date().toISOString()
    };
    
    if (socketManager.send(data)) {
        showMessage('Emergency stop signal sent!', 'success');
        console.log('Emergency stop sent:', data);
    }
}

// Handle run cycle button click
function handleRunCycle() {
    const savedNamesSelector = document.getElementById('savedNames');
    const selectedName = savedNamesSelector.value;
    
    if (!selectedName) {
        showMessage('Please select a configuration first', 'error');
        return;
    }
    
    const savedConfigs = JSON.parse(localStorage.getItem('savedConfigurations') || '{}');
    const configData = savedConfigs[selectedName];
    
    if (!configData) {
        showMessage('No configuration data found', 'error');
        return;
    }
    
    const data = {
        type: 'run_cycle',
        configName: selectedName,
        configData: configData,
        timestamp: new Date().toISOString()
    };
    
    if (socketManager.send(data)) {
        showMessage(`Running cycle for "${selectedName}"`, 'success');
        console.log('Run cycle sent:', data);
    }
}

// Handle test button click
function handleTest(rowIndex) {
    const row = document.querySelectorAll('.control-row')[rowIndex];
    const brushSelector = row.querySelector('.brush-selector');
    const cycleInput = row.querySelector('.cycle-input');
    
    const brush = brushSelector.value;
    const cycles = parseInt(cycleInput.value);
    
    if (brush === 'none') {
        showMessage('Please select a brush', 'error');
        return;
    }
    
    if (!cycles || cycles <= 0) {
        showMessage('Please enter a valid number of cycles', 'error');
        return;
    }
    
    // Send JSON data to socket
    const jsonData = {
        type: 'test',
        rowIndex: rowIndex + 1,
        brushName: brush,
        cycleCount: cycles,
        timestamp: new Date().toISOString()
    };
    
    if (socketManager.send(jsonData)) {
        console.log('Test Data (Row ' + (rowIndex + 1) + '):', JSON.stringify(jsonData));
        showMessage(`Row ${rowIndex + 1} - Testing Brush ${brush} with ${cycles} cycles`, 'success');
    }
}

// Handle save button click
function handleSave() {
    const configName = document.getElementById('configName').value.trim();
    
    if (!configName) {
        showMessage('Please enter a configuration name', 'error');
        return;
    }
    
    const rows = document.querySelectorAll('.control-row');
    const configData = [];
    
    rows.forEach((row, index) => {
        const brushSelector = row.querySelector('.brush-selector');
        const cycleInput = row.querySelector('.cycle-input');
        
        const brush = brushSelector.value;
        const cycles = parseInt(cycleInput.value) || 0;
        
        // Only save if BOTH brush is not 'none' AND cycles > 0
        if (brush !== 'none' && cycles > 0) {
            configData.push({
                brushName: brush,
                cycleCount: cycles
            });
        }
    });
    
    // Check if there's at least one row with valid data
    if (configData.length === 0) {
        showMessage('Please configure at least one row with both brush and cycles before saving', 'error');
        return;
    }
    
    // Send to socket
    const socketData = {
        type: 'save_configuration',
        configName: configName,
        configData: configData,
        timestamp: new Date().toISOString()
    };
    
    // Only show success if message was actually sent
    if (socketManager.send(socketData)) {
        showMessage(`Configuration "${configName}" saved and sent to server!`, 'success');
        // Clear the name input only on success
        document.getElementById('configName').value = '';
    } else {
        showMessage('Failed to send configuration to server. Please check connection.', 'error');
    }
}

// Update saved names selector
function updateSavedNamesSelector() {
    const savedConfigs = JSON.parse(localStorage.getItem('savedConfigurations') || '{}');
    const savedNamesSelector = document.getElementById('savedNames');
    
    // Clear existing options except the default
    savedNamesSelector.innerHTML = '<option value="">-- Select a saved configuration --</option>';
    
    // Add all saved configuration names
    Object.keys(savedConfigs).forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        savedNamesSelector.appendChild(option);
    });
}

// Display saved data when a name is selected
function displaySavedData() {
    const savedNamesSelector = document.getElementById('savedNames');
    const selectedName = savedNamesSelector.value;
    
    const displayDiv = document.getElementById('savedDataDisplay');
    const contentDiv = document.getElementById('savedDataContent');
    const runCycleBtn = document.getElementById('runCycleBtn');
    
    if (!selectedName) {
        displayDiv.style.display = 'none';
        runCycleBtn.style.display = 'none';
        return;
    }
    
    const savedConfigs = JSON.parse(localStorage.getItem('savedConfigurations') || '{}');
    const configData = savedConfigs[selectedName];
    
    if (!configData) {
        contentDiv.innerHTML = '<p>No data found for this configuration.</p>';
        displayDiv.style.display = 'block';
        runCycleBtn.style.display = 'none';
        return;
    }
    
    // Display the saved data as card boxes
    let html = '<div class="config-cards-container">';
    configData.forEach((row, index) => {
        if (row.brushName !== 'none' && row.cycleCount > 0) {
            html += `
                <div class="config-card">
                    <!-- <div class="config-card-label">Row ${index + 1}</div> -->
                    <div class="config-card-brush">${row.brushName}</div>
                    <div class="config-card-cycles">${row.cycleCount} cycles</div>
                </div>
            `;
        }
    });
    html += '</div>';
    
    contentDiv.innerHTML = html;
    displayDiv.style.display = 'block';
    runCycleBtn.style.display = 'block';
}

// Load saved configurations
function loadSavedConfigurations() {
    updateSavedNamesSelector();
}

// Show toast notification to user
function showMessage(message, type) {
    // Remove any existing messages
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.classList.add('toast-exit');
        setTimeout(() => {
            existingMessage.remove();
        }, 300);
    }
    
    // Create new toast element
    const toastDiv = document.createElement('div');
    toastDiv.className = `message ${type}`;
    toastDiv.textContent = message;
    
    // Append to body (for fixed positioning)
    document.body.appendChild(toastDiv);
    
    // Auto remove after 3 seconds with exit animation
    setTimeout(() => {
        toastDiv.classList.add('toast-exit');
        setTimeout(() => {
            toastDiv.remove();
        }, 300);
    }, 3000);
}

