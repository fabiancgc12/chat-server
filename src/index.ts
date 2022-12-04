import express from "express";
import * as http from "node:http";
import {Server} from "socket.io"
import cors from "cors"

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const corsOption = {
    origin: "http://localhost:3000"
}

const app = express();
app.use(cors(corsOption))
const server = http.createServer(app)
const io = new Server(server,{
    cors:corsOption
})
const port = process.env.PORT || 3001

io.on('connection', (socket) => {
    console.log('a user connected');
});

server.listen(port, () => {
    console.log(`listening on *:${port}`);
});