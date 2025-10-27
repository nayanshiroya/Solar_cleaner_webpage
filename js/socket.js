// WebSocket Connection Manager
class SocketManager {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.url = 'ws://localhost:8080'; // Change this to your WebSocket server URL
    }

    // Initialize WebSocket connection
    connect() {
        try {
            this.socket = new WebSocket(this.url);
            
            this.socket.onopen = () => {
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.updateConnectionStatus('connected');
                console.log('WebSocket connected');
            };

            this.socket.onmessage = (event) => {
                this.handleMessage(event.data);
            };

            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.updateConnectionStatus('error');
            };

            this.socket.onclose = () => {
                this.isConnected = false;
                this.updateConnectionStatus('disconnected');
                this.attemptReconnect();
            };

        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
            this.updateConnectionStatus('error');
        }
    }

    // Handle incoming messages from socket
    handleMessage(data) {
        try {
            const message = JSON.parse(data);
            console.log('Received from socket:', message);
            
            // Display message in the socket data area
            this.displaySocketData(message);
            
            // Handle different message types if needed
            if (message.type) {
                switch(message.type) {
                    case 'response':
                    case 'data':
                    case 'status':
                        this.displaySocketData(message);
                        break;
                    default:
                        this.displaySocketData(message);
                }
            }
        } catch (error) {
            console.error('Error parsing socket message:', error);
            this.displaySocketData(data);
        }
    }

    // Display socket data in the tax_form_the_socket div
    displaySocketData(data) {
        const socketDiv = document.querySelector('.tax_form_the_socket');
        if (socketDiv) {
            // Display simple short message (4-5 words)
            try {
                const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
                
                // Show different messages based on message type
                let message = 'Data received from server';
                if (parsedData.type) {
                    switch(parsedData.type) {
                        case 'response':
                            message = 'Command executed successfully';
                            break;
                        case 'error':
                            message = 'Error from server';
                            break;
                        case 'status':
                            message = 'Status update received';
                            break;
                        case 'ack':
                            message = 'Data acknowledged by server';
                            break;
                        default:
                            message = 'Message received from server';
                    }
                }
                socketDiv.textContent = message;
            } catch (error) {
                socketDiv.textContent = 'Data received from server';
            }
        }
    }

    // Send data to socket
    send(data) {
        if (this.isConnected && this.socket) {
            try {
                const message = typeof data === 'string' ? data : JSON.stringify(data);
                this.socket.send(message);
                console.log('Sent to socket:', data);
                return true;
            } catch (error) {
                console.error('Error sending to socket:', error);
                alert('Error sending data to socket.');
                return false;
            }
        } else {
            console.error('Cannot send: WebSocket not connected');
            alert('WebSocket not connected. Please check connection.');
            return false;
        }
    }

    // Update connection status
    updateConnectionStatus(status) {
        const statusElement = document.getElementById('connectionStatus');
        if (statusElement) {
            switch(status) {
                case 'connected':
                    statusElement.textContent = 'Connected';
                    statusElement.className = 'status-value connected';
                    break;
                case 'disconnected':
                    statusElement.textContent = 'Disconnected';
                    statusElement.className = 'status-value disconnected';
                    break;
                case 'error':
                    statusElement.textContent = 'Error';
                    statusElement.className = 'status-value disconnected';
                    break;
                default:
                    statusElement.textContent = 'Disconnected';
                    statusElement.className = 'status-value disconnected';
            }
        }
    }

    // Attempt to reconnect
    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => {
                console.log(`Reconnection attempt ${this.reconnectAttempts}...`);
                this.connect();
            }, 3000);
        } else {
            console.error('Max reconnection attempts reached');
        }
    }

    // Disconnect WebSocket
    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
            this.isConnected = false;
        }
    }

    // Clear socket output
    clearOutput() {
        const socketDiv = document.querySelector('.tax_form_the_socket');
        if (socketDiv) {
            socketDiv.innerHTML = 'tax form the socket';
        }
    }

    // Not needed anymore since we're using the span
    showSocketOutput(show) {
        // This method is kept for compatibility but does nothing
    }
}

// Create global instance
let socketManager = new SocketManager();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SocketManager;
}

