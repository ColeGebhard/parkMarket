const client = require('./client')

async function createPost({ title, body, user_id, date_created, image }) 
  {
  try {
    // Check if image data is in the correct format
    if (!image.startsWith('data:image/')) {
      throw new Error('Invalid image data format')
    }
    
    // Extract image format and base64 data
    const imageParts = image.split(';base64,')
    const imageType = imageParts[0].split('data:image/')[1]
    const imageData = Buffer.from(imageParts[1], 'base64')
    
    const { rows: [post] } = await client.query(`
      INSERT INTO posts (title, body, user_id, date_created, image)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `, [title, body, user_id, date_created, imageData]);

    console.log(post)

    return post;
  } catch (error) {
    throw new Error(error)
  }
}


async function getAllPosts() {
  try {
    const query = `
      SELECT *
      FROM posts
      ORDER BY date_created DESC;
    `;
    const { rows } = await client.query(query);
    return rows;
  } catch (error) {
    throw new Error('Failed to retrieve posts');
  }
}



async function getPostById(id) {
  try {
    const { rows } = await client.query(`
        SELECT * 
        FROM posts
        WHERE id=$1;
        `, [id])

    if (!rows) {
      throw new Error(`Post with id:${id} not found`)
    }

    return rows
  } catch (error) {
    throw new Error('Failed to get post by id')
  }
}

async function updatePost(id, updates, userId, isAdmin) {
  const post = await getPostById(id);

  if (!post) {
    throw new Error(`No post found with ID:${id}`);
  }

  if (!userId) {
    throw new Error('Unauthorized');
  }

  if (userId !== post.user_id && !isAdmin) {
    throw new Error('Forbidden');
  }

  let query = 'UPDATE posts SET ';

  const params = [];
  let index = 1;

  for (const [key, value] of Object.entries(updates)) {
    query += `${key}=$${index}, `;
    params.push(value);
    index++;
  }

  query = query.slice(0, -2); // remove trailing comma and space
  query += ` WHERE id=$${index} RETURNING *;`;
  params.push(id);

  const { rows: [updatedPost] } = await client.query(query, params);

  return updatedPost;
}

async function deletePost(id, userId, isAdmin) {
  const { rows: [post] } = await client.query(`
    SELECT user_id FROM posts WHERE id=$1
  `, [id]);

  if (post.user_id !== userId && !isAdmin) {
    throw new Error('Only the post owner or an administrator can delete this post.');
  }

  const { rows: [deletedPost] } = await client.query(`
    DELETE FROM posts
    WHERE id=$1
    RETURNING *;
  `, [id]);

  return deletedPost;
}



module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost
};
