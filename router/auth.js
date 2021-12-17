const express = require("express")
const jwt = require("jsonwebtoken")
const router = express.Router();
const cookies = require("cookie-parser")
const bcrypt = require('bcryptjs')
require("../db/conn");
const User = require("../model/userSchema")
const authenticate = require("../middleware/authenticate")



router.get("/", (req, res) => {
    res.send(`hello world from router`)
});

router.post("/user/create", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(422).json({ error: "plz fill the field properly" })
    }
    try {
        const userExist = await User.findOne({ email: email });
        if (userExist) {
            return res.status(422).json({ error: "Email already exist" });

        } else {
            const user = new User({ email, password });

            await user.save();
            res.status(201).json({ message: "user registered successfully" });

        }

    } catch (err) {
        console.log(err);
    }
});

router.post("/user/login", async (req, res) => {
    try {
        let token;
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: "Plz fill the data" })
        }

        const userLogin = await User.findOne({ email: email })
        if (userLogin) {
            const isMatch = await bcrypt.compare(password, userLogin.password);
            token = await userLogin.generateAuthToken();
            console.log(token);

            res.cookie("jwtoken", token, {
                expires: new Date(Date.now() + 20000000000),
                httpOnly: true
            })

            if (isMatch) {
                res.status(201).json({ message: "user signin successfully", authToken: token })
            }
            else {
                res.status(400).json({ error: "Invalid credentials" })
            }
        }

        else {
            res.status(400).json({ error: "Invalid credentials" })
        }
    }
    catch (err) {
        console.log(err);
    }
});

// about page
router.post('/todo/create', authenticate, async (req, res) => {
    try {
        const title = req.body;
        if (!title) {
            console.log("error in todo");
            return res.json({ error })
        }

        const userTodo = await User.findOne({ _id: req.userId })
        if (userTodo) {
            const userTitle = await userTodo.addTodo(title);
            await userTodo.save();
            res.status(201).json({ message: "Added todos" })
            console.log(userTitle);
        }
    } catch (err) {
        res.status(400).json({ message: "Todos not added" }, err)
    }
});

router.patch('/todo/update', authenticate, async (req, res) => {
    try {
        const _id = req.userId;
        const updateTodo = await User.findByIdAndUpdate(_id, req.body, {
            new: true
        });
        res.status(201).send("Updated");
    } catch (err) {
        res.status(400).send(e);
    }
});


router.delete('/todo/delete/:id', authenticate, async (req, res) => {
    try {
        const _id = req.userId;
        const deleteTodo = await User.findByIdAndDelete(_id);
        res.status(201).send("Deleted");
    } catch (err) {
        res.status(400).send("You cannot delete others todos");
    }
});


router.get('/logout', (req, res) => {
    console.log("hello Logout page")
    res.clearCookie("jwtoken", { path: '/' });
    res.status(200).send("user LogOut")
});



module.exports = router;