const express = require("express");
const usersRouter = express.Router();
const { compare } = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;

const {
    createUser,
    getUserByUsername,
    getAllUsers,
    getUserById,
    getUserByEmail,
    updateUser,
    deleteUser
} = require('../db/users');

usersRouter.get('/health', async (req, res, next) => {
    res.send({ message: "All is well." });
    next();
});

usersRouter.get('/', async (req, res, next) => {
    try {
        const { skip = 0, limit = 10 } = req.query; // Set default values for skip and limit if they're not provided
        const users = await getAllUsers(parseInt(skip), parseInt(limit));
        if (!users || users.length === 0) {
            res.status(404).json({
                error: 'Users not found',
                data: {},
            });
        } else {
            res.json(users);
        }
    } catch (error) {
        next(error);
    }
});


usersRouter.get('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const user = await getUserById(id)

        if (!user) {
            res.status(404).json({
                error: `User with id:${id} not found`,
                data: {}
            });
        } else {
            res.json({
                data: {
                    // id: user.id,
                    // email: user.email,
                    // username: user.username,
                    // isAdmin: user.isAdmin
                    user
                }
            });
        }
    } catch (error) {
        next(error)
    }

});

usersRouter.get('/username/:username', async (req, res, next) => {
    try {
        const username = req.params.username;
        const user = await getUserByUsername(username)

        if (!user) {
            res.status(404).json({
                error: `User with username:${username} not found`,
                data: {}
            });
        } else {
            res.json({
                data: {
                    // id: user.id,
                    // email: user.email,
                    // username: user.username,
                    // password: user.password,
                    // isAdmin: user.isAdmin
                    user
                }
            });
        }
    } catch (error) {
        next(error)
    }

});

usersRouter.get('/email/:email', async (req, res, next) => {
    try {
        const email = req.params.email;
        const user = await getUserByEmail(email)

        if (!user) {
            res.status(404).json({
                error: `User with email:${email} not found`,
                data: {}
            });
        } else {
            res.json({
                data: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    isAdmin: user.isAdmin
                }
            });
        }
    } catch (error) {
        next(error)
    }

});

usersRouter.post("/register", async (req, res, next) => {
    try {
        const { email, username, password, isAdmin } = req.body;

        const queriedUser = await getUserByUsername(username);

        if (queriedUser) {
            res.status(401);
            next({
                success: false,
                token: null,
                user: {},
                message: `User Exists: Username ${queriedUser.username} is already taken.`
            });
        } else if (password.length < 8) {
            res.status(401);
            next({
                success: false,
                token: null,
                user: {},
                message: `This password is too short. A longer password is required.`
            });
        } else {
            const user = await createUser({
                email,
                username,
                password,
                isAdmin: isAdmin || false // Set isAdmin to false if not provided in the request body
            });
            if (!user) {
                res.status(401);
                next({
                    success: false,
                    token: null,
                    user: {},
                    message: `We encountered a problem registering your account. Please try again`
                });
            } else {
                const token = jwt.sign(
                    { id: user.id, username: user.username, admin: user.isAdmin },
                    JWT_SECRET,
                    { expiresIn: "1w" }
                );
                res.json({
                    data: {
                        success: true,
                        token: token,
                        user: {
                            id: user.id,
                            email: user.email,
                            username: user.username,
                            isAdmin: user.isAdmin
                        },
                        message: `Congratulations, ${user.username}, you have successfully registered!`
                    }
                });
            }
        }
    } catch (e) {
        next(e);
    }
});

usersRouter.post("/login", async (req, res, next) => {
    const { username, password } = req.body;

    try {
        const user = await getUserByUsername(username);

        console.log(user)

        if (!user) {
            throw Error("Invalid username or password");
        }

        const passwordMatch = await compare(password, user.password);

        if (!passwordMatch) {
            throw Error("Invalid username or password");
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET);

        res.json({
            message: "Logged in successfully",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                // Add any other user data you want to send back to the client here
            },
        });
    } catch (e) {
        next(e);
    }
});

usersRouter.put("/:id", async (req, res, next) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const updatedUser = await updateUser(id, updates);
        res.json({ message: "User updated successfully", user: updatedUser });
    } catch (e) {
        next(e);
    }
});

usersRouter.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedUser = await deleteUser(id);
        res.json({
            data: {
                message: `User with id ${id} has been deleted`,
                user: deletedUser
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = usersRouter