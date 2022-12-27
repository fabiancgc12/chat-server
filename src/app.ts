import express, {Request} from "express";
import cors from "cors";
import morgan from "morgan"
import bodyParser from "body-parser";
import {authUser} from "./common/utils/authUser";
import {LoginModel} from "./common/models/loginModel";
import {validate} from "class-validator";

const app = express();

app.use(morgan("dev"))
app.use(cors())
app.use(bodyParser.json())

interface CustomRequest<T> extends Request {
    body: T
}

app.post("/login",async (req:CustomRequest<LoginModel>,res) => {
    const login = new LoginModel()
    login.username = req.body.username
    const errors = await validate(login);
    if (errors.length) {
        res.status(400).json({
            message:errors[0].constraints
        })
        return
        // next(new Error(400, errors));
    }
    const {username} = req.body
    if (authUser(req.body))
        res.send({
            username
        })
    else {
        res.status(400).json({
            message:"User already exist"
        })

    }
})

export default app
