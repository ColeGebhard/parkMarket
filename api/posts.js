const express = require('express');
const postsRouter = express.Router();

const {
    getAllPosts,
    getPostById,
    getPostsByCategoryId,
    deletePost,
    updatePost,
    createPost
} = require('../db/posts');

postsRouter.use((req, res, next) => {
    console.log('Post req being made')
    next();
})

postsRouter.get('/health', async (req, res, next) => {
    res.send({ message: "All is well." });
    next();
});

postsRouter.get('/', async (req, res, next) => {
    try {
        const posts = await getAllPosts();

        if (posts.length === 0) {
            res.status(404).json({
                error: 'No posts found',
                data: {},
            });
        } else {
            res.status(200).json(posts);
        }
    } catch (error) {
        res.status(500).json({
            error: 'Failed to retrieve posts',
            data: {},
        });
    }
});

postsRouter.get('/:id', async (req, res, next) => {
    try {
        const id = req.params.id
        const post = await getPostById(id)

        if (!post) {
            res.status(404).json({
                error: `No post found with ID:${id}`,
                data: {}
            })
        } else {
            res.status(200).json(post);
        }
    } catch (error) {
        res.status(500).json({
            error: 'Failed to retrieve posts',
            data: {},
        });
    }
});

postsRouter.get('/category/:categoryId', async (req, res, next) => {
    try {
        const id = req.params.id
        const posts = await getPostsByCategoryId(id)

        if (!posts) {
            res.status(404).json({
                error: `No posts found with ID:${id}`,
                data: {}
            })
        } else {
            res.status(200).json(posts);
        }
    } catch (error) {
        res.status(500).json({
            error: 'Failed to retrieve posts',
            data: {},
        });
    }
});

postsRouter.post("/", async (req, res, next) => {
    const { 
      name,
      description,
      price,
      image,
      contactType,
      contact,
      contactTypeBackup,
      contact_backup,
      report_count,
      created_at,
      location,
      categoryId,
      isActive
    } = req.body;
  
    if (!name || !description || !price || !image || !contactType || !contact){
      return res.status(400).json({ error: 'Missing or invalid required fields' });
    }
  
    try{
      const createdPost = await createPost({
        name,
        description,
        price,
        image,
        contactType,
        contact,
        contactTypeBackup,
        contact_backup,
        report_count,
        created_at,
        location,
        categoryId,
        isActive
      })
  
      res.json({
        data: {
          success: true,
          createdPost
        }
      })
    } catch (e) {
      next(e)
    }
  })
  



postsRouter.put("/:id", async (req, res, next) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const updatedPost = await updatePost(id, updates, req.user.id, req.user.isAdmin);
        res.json({ message: "Post updated successfully", post: updatedPost });
    } catch (e) {
        next(e);
    }
});


postsRouter.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const post = await getPostById(id);

        if (!post) {
            res.status(404).json({
                error: `No post found with ID:${id}`,
                data: {}
            });
            return;
        }

        if (!req.user) {
            res.status(401).json({
                error: 'Unauthorized',
                data: {}
            });
            return;
        }

        if (req.user.id !== post.userId && !req.user.isAdmin) {
            res.status(403).json({
                error: 'Forbidden',
                data: {}
            });
            return;
        }

        const deletedPost = await deletePost(id, req.user.id, req.user.isAdmin);
        res.json({
            data: {
                message: `Post with id ${id} has been deleted`,
                user: deletedPost
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = postsRouter