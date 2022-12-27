const request = require("supertest")
import app from "../src/app";
describe('app', function () {
    it("Should login the user", () => {
        const username = "john dow";
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
});