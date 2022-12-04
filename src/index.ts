import express from "express";
import * as http from "node:http";
import {ServerResponse} from "http";

const app = express();
const server = http.createServer(app)

app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});