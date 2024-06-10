const express = require('express');
const axios = require('axios');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const LLM_API_URL = 'BASE_URL';
const API_KEY = 'API_KEY';

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('request-llm', async (data) => {
    try {
      const response = await axios.post(LLM_API_URL, {
        prompt: data.prompt,
        apiKey: API_KEY,
      });

      const result = response.data;

      const [primaryOutput, secondaryOutput] = result.split('---');
      const secondaryJSON = JSON.parse(secondaryOutput);

      socket.emit('primary-output', primaryOutput);
      socket.emit('secondary-output', secondaryJSON);
    } catch (error) {
      console.error(error);
      socket.emit('error', 'An error occurred while fetching data from LLM.');
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
