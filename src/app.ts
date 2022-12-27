import express from "express";
import cors from "cors";
import morgan from "morgan"
import bodyParser from "body-parser";
import {authUser} from "./common/utils/authUser";

const app = express();

app.use(morgan("dev"))
app.use(cors())
app.use(bodyParser.json())

app.post("/login",(req,res) => {
    const {username} = req.body
    if (authUser(req.body))
        res.send({
            username
        })
    else {
        res.status(400).send({
            message:"User already exist"
        })
    }
})

export default app
