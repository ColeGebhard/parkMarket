const client = require('./client')

async function createContactType({name}) {
    try {
        const { rows: [contactType] } = await client.query(`
      INSERT INTO contact_type(name)
      VALUES($1)
      RETURNING *;
      `, [name])
        return contactType;
    } catch (error) {
        throw Error(error)
    }
}

module.exports = {
    createContactType
}