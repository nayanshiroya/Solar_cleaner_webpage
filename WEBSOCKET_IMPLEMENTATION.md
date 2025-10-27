# WebSocket Implementation Guide

## Quick Setup

### Configuration
Edit `js/socket.js` line 6:
```javascript
this.url = 'ws://localhost:8080'; // Your WebSocket server URL
```

---

## Features

### Connection Status
- **Connected** (Green): Ready to send/receive
- **Disconnected** (Red): No connection
- **Auto-reconnect**: Up to 5 attempts

### Display Area
- Location: `tax_form_the_socket` div in status section
- Shows short messages (4-5 words)
- Example: "Message received from server", "Data acknowledged by server"
- Messages change based on server response type

---

## Button Actions & Data Sent

### Emergency Stop
```javascript
{ type: 'emergency', action: 'STOP_ALL', timestamp }
```
Shows: "Emergency stop signal sent!"

### Test Button
```javascript
{ type: 'test', rowIndex: 1, brushName: 'brush1', cycleCount: 5, timestamp }
```
Shows: "Row 1 - Testing Brush brush1 with 5 cycles"

### Save Configuration
```javascript
{ type: 'save_configuration', configName: 'My Config', configData: [...], timestamp }
```
Shows: "Configuration 'name' saved and sent to server!"

### Run Cycle
```javascript
{ type: 'run_cycle', configName: 'My Config', configData: [...], timestamp }
```
Shows: "Running cycle for 'name'"

---

## Toast Notifications

### Success Toast (Green) - Only when sent successfully
- Shows only if `socket.send()` returns `true`
- Appears top-right corner
- Auto-dismiss after 3 seconds

### Error Toast (Red)
- WebSocket not connected
- Validation errors (missing brush/cycles)
- Send failures

---

## Important Notes

### No LocalStorage Saving
- Configurations are NOT saved to localStorage
- Only sent to WebSocket server
- Success toast only if server receives data
- Input field clears only on successful send

### Display Messages
The `tax_form_the_socket` div shows short status messages:
- "Data received from server" (default)
- "Command executed successfully" (response type)
- "Error from server" (error type)
- "Status update received" (status type)
- "Data acknowledged by server" (ack type)

---

## Testing

1. Start WebSocket server
2. Open application → Shows "Connected"
3. Test any button → Toast shows only if sent successfully
4. Check `tax_form_the_socket` div for server messages
5. If disconnected → Toast shows error, nothing is sent

---

## Data Flow

```
User Action → Validate → Send to Socket → Server Response → Display in tax_form_the_socket div
                                                              ↓
                                                           Show Toast (if sent)
```

### Success Path
User clicks → Validation passes → Socket connected → Send succeeds → Green toast → Message in div

### Error Path
User clicks → Socket disconnected → Send fails → Red toast → No message in div

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Toast shows error | Check if WebSocket is connected |
| No success toast | Server not receiving data |
| Messages not in div | Check socket.js displaySocketData function |
| Connection fails | Verify WebSocket server URL and status |

---

## File Structure

```
js/
├── socket.js     - Connection manager, message display
└── app.js        - Button handlers, validation, toast logic

css/style.css     - Toast styles, tax_form_the_socket styling
index.html        - tax_form_the_socket div
```

---

## Key Methods

- `socketManager.connect()` - Establish connection
- `socketManager.send(data)` - Send data (returns true/false)
- `socketManager.displaySocketData(data)` - Show message in div
- `showMessage(text, type)` - Show toast notification
