const client = require('./client')

async function createPost({
    name,
    description,
    price,
    image,
    contact,
    contact_backup,
    report_count,
    created_at,
    location,
    category,
    isActive
}) {
    try {
        const { rows: [listing] } = await client.query(`
      INSERT INTO posts(
        name, 
        description, 
        price,
        image,
        contact, 
        contact_backup, 
        report_count,
        created_at,
        location,
        category,
        "isActive"
      )
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *;
      `, [
            name,
            description,
            price,
            image,
            contact,
            contact_backup,
            report_count,
            created_at,
            location,
            category,
            isActive,
        ])
        return listing;
    } catch (error) {
        throw Error(error)
    }
}

async function getAllPosts() {
    try {
        const { rows } = await client.query(`
        SELECT *
        FROM posts;
      `);

        return rows;
    } catch (error) {
        throw new Error('Failed to get all posts');
    }
}

async function updatePost(id, updates) {
    const { name, description, price, image, contact, contact_backup, report_count, location, category, isActive } = updates;
    const { rows: [listing] } = await client.query(`
      UPDATE posts
      SET name=$1, description=$2, price=$3, image=$4, contact=$5, contact_backup=$6, report_count=$7, location=$8, category=$9, "isActive"=$10
      WHERE id=$11
      RETURNING *;
    `, [name, description, price, image, contact, contact_backup, report_count, location, category, isActive, id]);
    return listing;
}

async function deletePost(id) {
    const { rows: [listing] } = await client.query(`
      DELETE FROM posts
      WHERE id=$1
      RETURNING *;
    `, [id]);
    return listing;
}

async function getPostsByCategory(category) {
    try {
        const { rows } = await client.query(`
        SELECT * FROM posts WHERE category = $1 AND "isActive" = true;
      `, [category]);
        return rows;
    } catch (error) {
        throw Error(error);
    }
}


module.exports = {
    createPost,
    getAllPosts,
    updatePost,
    deletePost,
    getPostsByCategory
};
