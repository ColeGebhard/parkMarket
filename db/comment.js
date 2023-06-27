const client = require('./client')

async function createComment({ comment, user_id, post_id, date_created }) {
    try {
      const { rows: [createdComment] } = await client.query(`
        INSERT INTO comments (comment, user_id, post_id, date_created)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `, [comment, user_id, post_id, date_created]);
  
      console.log(createdComment);
  
      return createdComment;
    } catch (error) {
      throw new Error('Failed to create comment');
    }
  }
  

module.exports = {
    createComment
}