# WebSocket Implementation Guide

## Overview
WebSocket functionality has been implemented to provide real-time bidirectional communication between the web application and the server. All data operations send messages through WebSocket connections.

## Architecture

### Files Structure

```
Solar_cleaner_webpage/
├── js/
│   ├── socket.js       (NEW) - WebSocket connection manager
│   └── app.js          (MODIFIED) - Integrated with socket
├── index.html          (MODIFIED) - Added socket div
├── css/
│   └── style.css       (MODIFIED) - Socket output styling
└── WEBSOCKET_IMPLEMENTATION.md
```

---

## 1. WebSocket Manager (socket.js)

### Features
- **Connection Management**: Automatic connection on page load
- **Auto-Reconnect**: Attempts to reconnect up to 5 times with 3-second intervals
- **Status Display**: Updates connection status (Connected/Disconnected/Error)
- **Message Display**: Shows all incoming messages in `tax_form_the_socket` div
- **Error Handling**: Graceful handling of connection failures

### Configuration

Edit `js/socket.js` line 6 to change WebSocket server URL:
```javascript
this.url = 'ws://localhost:8080'; // Your WebSocket server URL
```

Or dynamically in `js/app.js`:
```javascript
function initializeSocket() {
    socketManager.url = 'ws://your-server-url:port';
    socketManager.connect();
}
```

---

## 2. Data Display

### Socket Output Location
- **Div**: `.tax_form_the_socket`
- **Location**: Status section (top of page)
- **Content**: Incoming messages from WebSocket server
- **Format**: JSON with timestamp

**Styling:**
- Monospace font (Courier New)
- Left-aligned text
- Max height: 300px with scroll
- Pre-wrap whitespace for JSON formatting

---

## 3. Toast Notifications

### Success Toast (Green)
- **When**: Only appears when message is successfully sent to socket
- **Examples**:
  - "Emergency stop signal sent!"
  - "Running cycle for 'config_name'"
  - "Configuration 'config_name' saved and sent to server!"
  - "Row 1 - Testing Brush brush1 with 5 cycles"

### Error Toast (Red)
- **When**: Appears when socket send fails or WebSocket is not connected
- **Examples**:
  - "Failed to send configuration to server. Please check connection."
  - "Please select a brush"
  - "Please enter a valid number of cycles"

### Features
- Top-right corner position
- Slide-in/slide-out animation
- Auto-dismiss after 3 seconds
- Fixed positioning with z-index: 10000

---

## 4. Button Actions & Data Flow

### Emergency Stop Button
**When Clicked:**
```javascript
{
    type: 'emergency',
    action: 'STOP_ALL',
    timestamp: '2024-01-15T10:30:00.000Z'
}
```
**Toast**: Shows success only if sent successfully

---

### Test Button (Manual Control)
**When Clicked:**
- Validates: Brush must be selected, cycles must be > 0
- Sends to socket:
```javascript
{
    type: 'test',
    rowIndex: 1,
    brushName: 'brush1',
    cycleCount: 5,
    timestamp: '2024-01-15T10:30:00.000Z'
}
```
**Toast**: Shows success only if sent successfully

---

### Save Configuration Button
**Important**: No longer saves to localStorage. Only sends to socket.

**When Clicked:**
- Validates: At least one row with brush and cycles
- Sends to socket:
```javascript
{
    type: 'save_configuration',
    configName: 'My Config',
    configData: [
        { brushName: 'brush1', cycleCount: 5 },
        { brushName: 'brush2', cycleCount: 3 }
    ],
    timestamp: '2024-01-15T10:30:00.000Z'
}
```

**Toast Behavior:**
- ✅ **Success**: "Configuration 'name' saved and sent to server!"
- ❌ **Error**: "Failed to send configuration to server. Please check connection."
- Input field clears only on successful send

---

### Run Present Cycle Button
**When Clicked:**
- Validates: Configuration must be selected
- Sends to socket:
```javascript
{
    type: 'run_cycle',
    configName: 'My Config',
    configData: [...],
    timestamp: '2024-01-15T10:30:00.000Z'
}
```
**Toast**: Shows success only if sent successfully

---

## 5. Connection Status

### Visual Indicators
- **Connected** (Green background): WebSocket connected and ready
- **Disconnected** (Dark red background): No connection
- **Error** (Dark red background): Connection error

### Behavior
- Automatically attempts to connect on page load
- Auto-reconnect on disconnection (max 5 attempts)
- Updates status in real-time
- Shows alerts if send fails when disconnected

---

## 6. Data Storage

### ⚠️ Important Changes
- **Before**: Saved configurations to localStorage AND socket
- **Now**: Only sends to socket (No localStorage saving)
- **Reading**: Still reads from localStorage to display saved configurations (read-only)

### Why This Change?
- Ensures data consistency with server
- Prevents local-only configurations
- Success only confirms when data reaches server

---

## 7. Testing Guide

### Step-by-Step Testing

#### Test 1: Connection
1. Start your WebSocket server
2. Open the application
3. Check status: Should show "Connected" (green)
4. Check div: `tax_form_the_socket` should be visible

#### Test 2: Test Button
1. Select a brush (e.g., "Brush 1")
2. Enter cycles (e.g., "5")
3. Click "Test" button
4. **Expected**: Green toast "Row 1 - Testing Brush brush1 with 5 cycles"
5. **Expected**: Message appears in `tax_form_the_socket` div

#### Test 3: Save Configuration
1. Configure multiple rows
2. Enter configuration name
3. Click "Save Configuration"
4. **If Connected**: Green toast with success message
5. **If Disconnected**: Red toast with error message
6. **Expected**: Input field clears only on success

#### Test 4: Emergency Stop
1. Click "Emergency Stop" button
2. **Expected**: Green toast "Emergency stop signal sent!"
3. **Expected**: Message in socket div

#### Test 5: Without Connection
1. Disconnect from WebSocket server
2. Status shows "Disconnected"
3. Try to save configuration
4. **Expected**: Red toast "Failed to send configuration to server..."
5. **Expected**: No localStorage save
6. **Expected**: Input field does NOT clear

---

## 8. Message Format

All messages sent to socket include:
- **type**: Action type ('test', 'emergency', 'save_configuration', 'run_cycle')
- **timestamp**: ISO 8601 format
- **Additional fields**: Vary by action type

### Example Complete Message
```json
{
    "type": "test",
    "rowIndex": 1,
    "brushName": "brush1",
    "cycleCount": 5,
    "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 9. Error Handling

### Connection Errors
- Reconnects automatically (up to 5 times)
- Shows status as "Disconnected"
- Alerts user when sending without connection

### Send Errors
- Shows error toast
- Logs to console
- Does not throw exception

### Validation Errors
- Shows error toast before attempting to send
- Validates: brush selection, cycle count, configuration name
- Validates: At least one row with data

---

## 10. Integration Checklist

- ✅ WebSocket connects on page load
- ✅ Status updates in real-time
- ✅ All buttons send data to socket
- ✅ Success toasts only on successful send
- ✅ Error toasts on failed send or validation
- ✅ Messages display in `tax_form_the_socket` div
- ✅ No localStorage saving (read-only for existing configs)
- ✅ Input clears only on successful send
- ✅ Auto-reconnect on disconnection
- ✅ Monospace font for JSON display

---

## 11. Troubleshooting

### Problem: "Cannot send: WebSocket not connected"
**Solution**: Check if WebSocket server is running, verify URL in socket.js

### Problem: Toast not showing success
**Solution**: Check browser console for errors, verify socket.send() returns true

### Problem: Messages not appearing in div
**Solution**: Check if `tax_form_the_socket` div exists in HTML

### Problem: Connection keeps disconnecting
**Solution**: Check WebSocket server logs, verify network connectivity

---

## 12. Server Requirements

Your WebSocket server should:
- Accept connections on configured port
- Parse JSON messages
- Handle message types: 'test', 'emergency', 'save_configuration', 'run_cycle'
- Send responses back to client
- Log all received messages

### Expected Server Behavior
```
Client → Server: { type: 'test', brushName: 'brush1', cycleCount: 5 }
Server → Client: { type: 'response', status: 'ok', message: 'Test received' }
```

---

## 13. Future Enhancements

- Add WebSocket reconnection button
- Add send queue for offline operations
- Add connection retry configuration
- Add message confirmation system
- Add server response handling
