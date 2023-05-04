const client = require('./client')

async function createCategory({name}) {
    try {
        const { rows: [category] } = await client.query(`
      INSERT INTO category(name)
      VALUES($1)
      RETURNING *;
      `, [name])
        return category;
    } catch (error) {
        throw Error(error)
    }
}

module.exports = {
    createCategory
}