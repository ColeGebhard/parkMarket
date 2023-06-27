const express = require("express");
const client = require('../db/client')
const usersRouter = express.Router();
const { compare } = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const {
  createUser,
  getAllUsers,
  getUserById,
  getUserByUsername,
  getUserByEmail,
  updateUser,
  deleteUser
} = require('../db/users');


usersRouter.get('/me', async (req, res) => {
  try {
    if (req.headers.authorization) {
      const userToken = req.headers.authorization
      const token = userToken.split(' ');
      const data = jwt.verify(token[1], JWT_SECRET);
      const { id, username, isAdmin } = data;
      console.log(id, username, isAdmin)
      res.send({ id, username, isAdmin });
    } else {
      res.status(401).send({
        error: "failed to getme",
        message: "You must be logged in to perform this action",
        name: "Please log in."
      });
    }
  } catch (error) {
    res.status(401).send({
      error: "failed to getme",
      message: "You must be logged in to perform this action",
      name: "Please log in."
    });
  }
});

//Create a user
usersRouter.post('/register', async (req, res, next) => {
  try {
    const { email, username, password, email_verified, date_created, last_login, isAdmin } = req.body;
    
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
    } 

    const user = await createUser({
      email,
      username,
      password,
      email_verified,
      date_created,
      last_login,
      isAdmin
    });

    const token = jwt.sign(
      { id: user.id, username: user.username, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isAdmin: user.isAdmin
      },
      token
    });
  } catch (error) {
    next(error);
  }
});

//log in user
usersRouter.post("/login", async (req, res, next) => {
    const { email, password } = req.body;

    console.log(email, password)

    try {
        const user = await getUserByEmail(email);

        console.log(user)

        if (!user) {
            throw Error("Invalid email or password");
        }

        const passwordMatch = await compare(password, user.password);

        if (!passwordMatch) {
            throw Error("Invalid email or password");
        }

        const token = jwt.sign({ id: user.id, username: user.username, isAdmin: user.isAdmin }, JWT_SECRET);

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
  

// Get all users
usersRouter.get('/', async (req, res, next) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// Get user by ID
usersRouter.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await getUserById(id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Get user by username
usersRouter.get('/username/:username', async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await getUserByUsername(username);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Get user by email
usersRouter.get('/email/:email', async (req, res, next) => {
  try {
    const { email } = req.params;
    const user = await getUserByEmail(email);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Update user
usersRouter.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedUser = await updateUser(id, updates);
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
});

// Delete user
usersRouter.delete('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
  
      // Delete user's comments
      await deleteCommentsByUserId(id);
  
      // Delete user's posts
      await deletePostsByUserId(id);
  
      // Delete user
      const deletedUser = await deleteUser(id);
  
      res.json(deletedUser);
    } catch (error) {
      next(error);
    }
  });
  
// Delete comments by user ID
async function deleteCommentsByUserId(userId) {
    try {
      const query = `
        DELETE FROM comments
        WHERE user_id = $1;
      `;
      await client.query(query, [userId]);
    } catch (error) {
      console.error(error);
      throw new Error('Failed to delete comments');
    }
  }

//delete post by user id
async function deletePostsByUserId(userId) {
  try {
    // Delete comments associated with the user's posts
    await deleteCommentsByUserId(userId);

    // Delete the user's posts
    const query = `
      DELETE FROM posts
      WHERE user_id = $1;
    `;
    await client.query(query, [userId]);
  } catch (error) {
    console.error(error);
    throw new Error('Failed to delete posts');
  }
}


  

module.exports = usersRouter;
