const dotenv = require("dotenv")
const mongoose = require("mongoose")
const express = require("express")
const app = express();
const bodyParser = require("body-parser")

app.use(bodyParser.urlencoded({ extended: true }));

dotenv.config({path:'./config.env'});

require("./db/conn");
// const User = require("./model/userSchema")
var cookies = require("cookie-parser");

app.use(cookies());

app.use(express.json());
app.use(require("./Router/auth"));

const PORT = process.env.PORT;

app.get("/", (req, res) => {
    res.send("Hello from the home side");
})

app.listen(PORT, () => {
    console.log("running at port",PORT);
}
)