import * as http from "http";
import app from "../src/app";
import {setIoServer} from "../src/socketServer";
// import ioClient from 'socket.io-client'
const request = require("supertest")
const ioClient = require('socket.io-client');
const ioBack = require('socket.io');

describe('Testing Socket Auth', () => {

    let firstUserSocket;
    let secondUserSocket;
    let httpServer;
    let httpServerAddr;
    let ioServer;

    /**
     * Setup WS & HTTP servers
     */
    beforeAll((done) => {
        httpServer = http.createServer(app).listen(3001);
        httpServerAddr = httpServer.address();
        ioServer = setIoServer(ioBack(httpServer));
        done();
    });

    /**
     *  Cleanup WS & HTTP servers
     */
    afterAll((done) => {

        ioServer.close();
        httpServer.close();
        done();
    });

    /**
     * Run before each test
     */
    beforeEach((done) => {
        // Setup
        // Do not hardcode server port and address, square brackets are used for IPv6
        console.log(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`)
        firstUserSocket = ioClient(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
            autoConnect:false,
            transports: ['websocket'],
        });
        secondUserSocket = ioClient(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
            autoConnect:false,
            transports: ['websocket'],
        });
        done();
    });

    /**
     * Run after each test
     */
    afterEach((done) => {
        // Cleanup
        if (firstUserSocket.connected) {
            firstUserSocket.disconnect();
        }
        if (secondUserSocket.connected) {
            secondUserSocket.disconnect();
        }
        done();
    });

    it('should throw error if not authenticated', (done) => {
        firstUserSocket.connect()
        firstUserSocket.on("connect_error",(err) => {
            expect(err).toBeInstanceOf(Object)
            expect(err.data.status).toBe(401)
            done()
        })
    });

    it('should throw error if trying to log with username already on use with http', function (done) {
        const username = "john"
        firstUserSocket.auth = {username}
        firstUserSocket.connect()
        firstUserSocket.on("connect",async () => {
            await request(app)
                .post("/login")
                .send({
                    username
                })
                .expect(401)
            done()
        })
    });

    it('should throw error if trying to connect with username already on use', function (done) {
        const username = "john"
        firstUserSocket.auth = {username}
        secondUserSocket.auth = {username}
        firstUserSocket.connect()
        firstUserSocket.on("connect",async () => {
            secondUserSocket.connect()
        })
        secondUserSocket.on("connect_error",(err) => {
            expect(err).toBeInstanceOf(Object)
            expect(err.data.status).toBe(401)
            done()
        })
    });

});
