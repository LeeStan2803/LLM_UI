const express = require('express');
const axios = require('axios');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');  

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const LLM_API_URL = 'https://active.cyberresult.com/respond';
const API_KEY = 'eyJ0eXAiOiJKV1QiLCJub25jZSI6Ik5qTTZncUwtYXExUVM4Q1RtWG4xUENSREVsYnJnWEQ2T3VHcllNdHVTRjgiLCJhbGciOiJSUzI1NiIsIng1dCI6IkwxS2ZLRklfam5YYndXYzIyeFp4dzFzVUhIMCIsImtpZCI6IkwxS2ZLRklfam5YYndXYzIyeFp4dzFzVUhIMCJ9.eyJhdWQiOiIwMDAwMDAwMy0wMDAwLTAwMDAtYzAwMC0wMDAwMDAwMDAwMDAiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC8wODcwMjg4ZS00YWY4LTQ4YzktODczZS0zYWQ5YjE3MGViMjYvIiwiaWF0IjoxNzE4MTczODAzLCJuYmYiOjE3MTgxNzM4MDMsImV4cCI6MTcxODE3NzgwMCwiYWNjdCI6MCwiYWNyIjoiMSIsImFpbyI6IkFWUUFxLzhXQUFBQWR5NE1QS0JqNXhhV3lvajlmMHluMFgyZkhNdnJWSUlnTTUxYnhmbXNMVzBKVjJlcmtPNjhFQXdLZGFYemdBV3B4Uk94S3pzdFVWQlF5WHNtN0R2dTMwQUZ4STFoeFYrOW9qVWNZdTA3TGtFPSIsImFtciI6WyJwd2QiLCJtZmEiXSwiYXBwX2Rpc3BsYXluYW1lIjoiQVpGRGV2VkFCb3QiLCJhcHBpZCI6IjFiODk2YjA5LWI0ZDAtNDJkNi05MDhiLTYwYjlhM2MzMjNjMiIsImFwcGlkYWNyIjoiMSIsImZhbWlseV9uYW1lIjoiU2hhbmthciIsImdpdmVuX25hbWUiOiJCaGFyYXRoIiwiaWR0eXAiOiJ1c2VyIiwiaXBhZGRyIjoiMTA2LjUxLjcwLjI0MSIsIm5hbWUiOiJCaGFyYXRoIFNoYW5rYXIiLCJvaWQiOiIyMGU2OTI3OS1lZTk2LTQ2YjctYWNhMC1mYjBmYTNlZTU5Y2QiLCJvbnByZW1fc2lkIjoiUy0xLTUtMjEtMjAzNjAwODMzNi0zMTM4MzQ3NTcyLTI3MjA3Njc1NzItMTMyMDg4IiwicGxhdGYiOiI1IiwicHVpZCI6IjEwMDMyMDAzNzFCQ0M1OUQiLCJyaCI6IjAuQVJBQWppaHdDUGhLeVVpSFBqclpzWERySmdNQUFBQUFBQUFBd0FBQUFBQUFBQUFRQUJnLiIsInNjcCI6IkNhbGVuZGFycy5SZWFkIENhbGVuZGFycy5SZWFkLlNoYXJlZCBDYWxlbmRhcnMuUmVhZEJhc2ljIENhbGVuZGFycy5SZWFkV3JpdGUgQ2FsZW5kYXJzLlJlYWRXcml0ZS5TaGFyZWQgZW1haWwgTWFpbC5SZWFkIE1haWwuUmVhZEJhc2ljIE1haWwuUmVhZFdyaXRlIE1haWwuU2VuZCBvcGVuaWQgUGVvcGxlLlJlYWQgUGxhY2UuUmVhZC5BbGwgcHJvZmlsZSBVc2VyLlJlYWQgVXNlci5SZWFkQmFzaWMuQWxsIiwic3ViIjoiSzJJalU1X01tdGhtZ2VCaF9PV3l0TFMwcHBySU1Qd29feXY2SXhFQ29DWSIsInRlbmFudF9yZWdpb25fc2NvcGUiOiJFVSIsInRpZCI6IjA4NzAyODhlLTRhZjgtNDhjOS04NzNlLTNhZDliMTcwZWIyNiIsInVuaXF1ZV9uYW1lIjoiYmhhcmF0aC5zaGFua2FyQEFTUElSRVpPTkUuUUEiLCJ1cG4iOiJiaGFyYXRoLnNoYW5rYXJAQVNQSVJFWk9ORS5RQSIsInV0aSI6IlVFb0h6Ukk3aUUyVGRQUDZmWkdrQUEiLCJ2ZXIiOiIxLjAiLCJ3aWRzIjpbImI3OWZiZjRkLTNlZjktNDY4OS04MTQzLTc2YjE5NGU4NTUwOSJdLCJ4bXNfc3QiOnsic3ViIjoiREJzR0ZTSkcwS0hCMFJtOGwyNnhDRURMMmdpQ3p5QUJ2R0JEbjVwSldsUSJ9LCJ4bXNfdGNkdCI6MTQ0MDQwOTc4OX0.Sc-RaMHFdhnbaPZyp3fc-KzgDwcOfJkV4_Gpt1wNOoKJ7bKsuRzv62Qd0SkMQqNqhQqSTuixHsKiFlE5bZT6PpKUf2VCSQ8r4R2PzidrE6gh91dI4nRnC6msc87frCqIPZCU0MPzfc9BpB49NlqLChsRXyfiGDFosFXvmOBiyh7GCa3oBFNPp62kDYs12fNjMKo1XN4m29Qx0vJe-xo-tLZ9z52GqVml5Ys2YUCm6fSQIJgCY3w77iHYf3XriwxJTtw-S0SXYzaF6VcQwmZHvQN2p_Diy5cdcwXZMCfOonPEec-f9JiMXmDOq8limUdVNlyUz2NLhtDBBhwgY1Tw2g';

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('request-llm', async (data) => {
    try {
      const response = await axios.post(LLM_API_URL, {
        "query": data.prompt,
        "user_id": "Teoh.Tzun@aspirezone.qa",
        "task_id": "1",
        "ms_graph_key": API_KEY
      });

      const result = response.data;

      const parts = result.split('---|-|-|---');
      const primaryOutput = parts[0];
      let secondaryJSON = {};

      if (parts[1]) {
        try {
          secondaryJSON = JSON.parse(parts[1]);
        } catch (jsonError) {
          console.error('Error parsing secondary output as JSON:', jsonError);
          socket.emit('error', 'Error parsing secondary output as JSON.');
        }
      }

      socket.emit('primary-output', primaryOutput);
      socket.emit('secondary-output', secondaryJSON);
    } catch (error) {
      console.error('Error fetching data from LLM:', error);
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