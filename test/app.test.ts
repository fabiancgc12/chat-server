const request = require("supertest")
import app from "../src/app";


describe('app', function () {

    it("Should login the user", () => {
        const username = "john doe";
        return request(app)
            .post("/login")
            .send({
                username
            })
            .expect(200)
            .expect({
                username
            })
    });

    it('should throw error if username is unset', async () => {
        await request(app)
            .post("/login")
            .expect(400)
            .expect(res => {
                expect(res.body.error).toBeInstanceOf(Array)
                expect(res.body.error).toContain('username should not be empty')
                expect(res.body.error).toContain('username must be a string')
            })
    });

    it('should throw error if username is not string', async () => {
        await request(app)
            .post("/login")
            .expect(400)
            .send({
                username:5
            })
            .expect(res => {
                expect(res.body.error).toBeInstanceOf(Array)
                expect(res.body.error).toContain('username must be a string')
            })
    });

});