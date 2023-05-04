const express = require('express');
const postsRouter = express.Router();

const {
    getAllPosts,
    getPostById
} = require('../db/posts');
const { post } = require('../app');
const id = require('faker/lib/locales/id_ID');

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

module.exports = postsRouter