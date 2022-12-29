import * as http from "http";
import app from "../src/app";
import {setIoServer} from "../src/socketServer";
// import ioClient from 'socket.io-client'
const ioClient = require('socket.io-client');
const ioBack = require('socket.io');

describe('Testing Socket Auth', () => {

    let socketFirstUser;
    let socketSecondUser;
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
        socketFirstUser = ioClient(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
            autoConnect:false,
            transports: ['websocket'],
        });
        socketSecondUser = ioClient(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
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
        if (socketFirstUser.connected) {
            socketFirstUser.disconnect();
        }
        if (socketSecondUser.connected) {
            socketSecondUser.disconnect();
        }
        done();
    });

    it('should throw error if not authenticated', (done) => {
        socketFirstUser.connect()
        socketFirstUser.on("connect_error",(err) => {
            expect(err).toBeInstanceOf(Object)
            expect(err.data.status).toBe(401)
            done()
        })
    });

});
