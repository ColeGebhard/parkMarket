const client = require('./client')

async function createPost({
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
  isActive,
}) {
  try {
    const { rows: [listing] } = await client.query(`
      INSERT INTO posts(
        name, 
        description, 
        price,
        image,
        "contactType",
        contact, 
        "contactTypeBackup",
        contact_backup, 
        report_count,
        created_at,
        location,
        "categoryId",
        "isActive"
      )
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING *;
      `, [
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
    ]);
    return listing;
  } catch (error) {
    throw Error(error)
  }
}





async function getAllPosts() {
  try {
    const { rows } = await client.query(`
        SELECT posts.*, category.name AS category_name, contact_type.name AS contact_type_name
        FROM posts
        LEFT JOIN category ON posts."categoryId" = category.id
        LEFT JOIN contact_type ON posts."contactType" = contact_type.id
        ORDER BY posts.id
      `);

    return rows;
  } catch (error) {
    throw new Error('Failed to get all posts');
  }
}



async function getPostById(id) {
  try {
    const { rows } = await client.query(`
        SELECT * 
        FROM posts
        WHERE id=$1 AND "isActive" = true;
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

  if (userId !== post.userId && !isAdmin) {
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

  const { rows: [listing] } = await client.query(query, params);

  return listing;
}

async function deletePost(id, userId, isAdmin) {
  const { rows: [listing] } = await client.query(`
    SELECT "userId" FROM posts WHERE id=$1
  `, [id]);

  if (listing.user_id !== userId && !isAdmin) {
    throw new Error('Only the post owner or an administrator can delete this post.');
  }

  const { rows: [deletedPost] } = await client.query(`
    DELETE FROM posts
    WHERE id=$1
    RETURNING *;
  `, [id]);

  return deletedPost;
}

async function getPostsByCategoryId(categoryId) {
  try {
    const { rows } = await client.query(`
        SELECT * FROM posts WHERE "categoryId" = $1 AND "isActive" = true;
      `, [categoryId]);

    if (rows.length === 0) {
      throw new Error(`No posts found for category with ID ${categoryId}`);
    }

    return rows;
  } catch (error) {
    throw new Error(`Failed to get posts for category with ID ${categoryId}: ${error.message}`);
  }
}

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  getPostsByCategoryId
};
