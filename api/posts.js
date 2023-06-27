const express = require('express');
const postsRouter = express.Router();

const {
    getAllPosts,
    getPostById,
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

        // Convert image data to base64 string
        posts.forEach(post => {
            if (post.image && post.image.data) {
                const base64Image = Buffer.from(post.image.data).toString('base64');
                post.image = `data:${post.image.contentType};base64,${base64Image}`;
            }
        });

        if (posts.length === 0) {
            res.status(404).json({
                error: 'No posts found',
                data: {},
            });
        } else {
            res.status(200).json(posts);
        }
    } catch (error) {
        console.log(error);
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

// postsRouter.get('/category/:categoryId', async (req, res, next) => {
//     try {
//         const id = req.params.id
//         const posts = await getPostsByCategoryId(id)

//         if (!posts) {
//             res.status(404).json({
//                 error: `No posts found with ID:${id}`,
//                 data: {}
//             })
//         } else {
//             res.status(200).json(posts);
//         }
//     } catch (error) {
//         res.status(500).json({
//             error: 'Failed to retrieve posts',
//             data: {},
//         });
//     }
// });

postsRouter.post("/", async (req, res, next) => {
    const {
        title,
        body,
        date_created,
        image
    } = req.body;

    let userId = null;
    if (req.user && req.user.id) {
        userId = req.user.id;
    }

    if (!title) {
        return res.status(400).json({ error: 'Title field is required' });
    }

    if (!body) {
        return res.status(400).json({ error: 'Body field is required' });
    }

    if (!date_created) {
        return res.status(400).json({ error: 'Date Created field is required' });
    }

    // if (!image) {
    //   return res.status(400).json({ error: 'Image field is required' });
    // }

    try {
        const createdPost = await createPost({
            title,
            body,
            userId,
            dateCreated: date_created,
            image
        });

        res.json({
            data: {
                success: true,
                createdPost
            }
        });
    } catch (error) {
        next(error);
    }
});





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