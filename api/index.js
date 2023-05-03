const express = require("express");
const apiRouter = express.Router();

const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const { getUserById } = require("../db/users");

apiRouter.get('/health', async (req, res, next) => {
  res.send({message: "All is well."});
  next();
});

apiRouter.use(async (req, res, next) => {
  const prefix = "Bearer ";
  const auth = req.header("Authorization");
  
  if (!auth) {
    next();
  } else if (auth.startsWith(prefix)) {
    const token = auth.slice(prefix.length);

    try {
      const { id } = jwt.verify(token, JWT_SECRET);

      if (id) {
        req.user = await getUserById(id);
        next();
      }
    } catch (e) {
      next(e);
    }
  } else {
    next(
      `Authorization Error: authorization token must begin with ${prefix}`
    );
  }
});

const usersRouter = require("./users");
apiRouter.use("/users", usersRouter);

const postsRouter = require("./posts");
apiRouter.use("/posts", postsRouter);


//Error handler
apiRouter.use((error, req, res, next) => {
  res.json({
    error: error.message,
    data: error
  })
})
module.exports = apiRouter
