const io = require('socket.io-client');

const socket = io('http://localhost:3001');

socket.on('connect', () => {
    console.log('Connected to socket server');
});

socket.on('new_loan_request', (data) => {
    console.log('RECEIVED EVENT:', data);
    process.exit(0);
});

console.log('Waiting for events...');

// Keep alive
setInterval(() => { }, 1000);
