import express from "express";
import cors from "cors";
import morgan from "morgan"
import bodyParser from "body-parser";
import {authUser} from "./common/utils/authUser";
import {LoginModel} from "./common/models/loginModel";
import {validate} from "class-validator";
import {BaseError} from "./common/errors/BaseError";
import { CustomRequest } from "./common/Request/CustomRequest";
import {ClassValidatorError} from "./common/errors/ClassValidatorError";
import {AuthError} from "./common/errors/AuthError";

const app = express();
export const corsConfig = {
    origin: "http://localhost:3000"
}

app.use(morgan("dev"))
app.use(cors(corsConfig))
app.use(bodyParser.json())

app.post("/login",async (req:CustomRequest<LoginModel>,res,next) => {
    const login = new LoginModel()
    login.username = req.body.username
    const errors = await validate(login);
    if (errors.length) {
        next(new ClassValidatorError(errors[0].constraints))
    }
    const {username} = req.body
    if (authUser(req.body))
        res.send({
            username
        })
    else {
        next(new AuthError())
    }
})

//handling errors
app.use((err,req,res,next) => {
    console.error('Error found');
    if (err instanceof BaseError) {
        console.log(`Error known, is: ${err}`);
        res.status(err.data.status).json(err);
    } else {
        console.log("Unknown Error")
        // For unhandled errors.
        res.status(500).json(new BaseError(500,"Unknown Error"));
    }
});

export default app
