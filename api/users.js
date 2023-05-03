const express = require("express");
const usersRouter = express.Router();
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;

usersRouter.get('/health', async (req, res, next) => {
  res.send({message: "All is well."});
  next();
});

usersRouter.post("/register", async (req, res, next) => {
  try {
    const { username, password, firstName, lastName, email, isAdmin } = req.body;

    const queriedUser = await getUserByUsername(username);
    
    if (queriedUser) {
      res.status(401);
      next({
        success: false,
        token: null,
        user: {},
        message: `User Exists: Username ${queriedUser.username} is already taken.`

      }
      )
    } else if (password.length < 8) {
        res.status(401);
        next({
          success: false,
          token: null,
          user: {},
          message: `This password is too short. A longer password is required.` 

        }
      )
    } else {
      const user = await createUser({
        username, password, firstName, lastName, email, isAdmin
      });
      if (!user) {
        res.status(401);
        next({
          success: false,
          token: null,
          user: {},
          message: `We encountered a problem registering your account. Please try again`

        }
        );
      } else {
        const token = jwt.sign(
          { id: user.id, username: user.username, admin: user.isAdmin },
          JWT_SECRET,
          {expiresIn: "1w" }
        ); 
        res.json({data: {
          success: true,
          token: token,
          user: {
            id: user.id,
            username: username,
            admin: isAdmin
          },
          message: `Congratulations, ${username}, you have successfully registered!`

        }});
      }
    }
  } catch (e) {
    next(e);
  }
})

// // usersRouter.get("/:username", async (req, res, next) => {
// //   const { username } = req.params;

// //   try {
// //       const checkUser = await getUserByUsername(username)

// //       console.log(checkUser)
// //   } catch(error) {

// //   }
// // })

// usersRouter.post("/login", async (req, res, next) => {
//   const { username, password } = req.body;
//   if (!username || !password) {
//     next({
//       success: false,
//       token: null,
//       user: {},
//       message: `Missing credentials. Please supply both a username and a password.` 

//     });
//   }
//   try {
//     const user = await getUser({ username, password });
//     if (!user) {
//       next({
//         success: false,
//         token: null,
//         user: {},
//         message: `Username or password is incorrect. Please try again` 
//       });
//     } else {
//       const token = jwt.sign(
//         { id: user.id, username: user.username },
//         JWT_SECRET,
//         { expiresIn: "1w" }
//       );
//       res.json({data: {
//         success: true,
//         token: token,
//         user: {
//           id: user.id,
//           username: user.username
//         },
//         message: `You're logged in!` 
//       }})
//     }
//   } catch (e) {
//     next(e);
//   }
// });

// usersRouter.get('/me', async (req, res) => {
//   try {
//     if (req.headers.authorization) {
//       const userToken = req.headers.authorization
//       const token = userToken.split(' ');
//       const data = jwt.verify(token[1], JWT_SECRET);
//       const { id, username, isAdmin } = data;
//       res.send({ id, username, isAdmin });
//     } else {
//       res.status(401).send({
//         error: "failed to getme",
//         message: "You must be logged in to perform this action",
//         name: "Please log in."
//       });
//     }
//   } catch (error) {
//     res.status(401).send({
//       error: "failed to getme",
//       message: "You must be logged in to perform this action",
//       name: "Please log in."
//     });
//   }
// });


module.exports = usersRouter