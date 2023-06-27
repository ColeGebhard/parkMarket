const client = require('./client')
const SALT_COUNT = 10;
const bcrypt = require('bcrypt')

async function createUser({ email, username, password, email_verified, date_created, last_login, isAdmin }) {
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

    // Validate password requirements
    if (!passwordRegex.test(password)) {
        let errorMessages = [];
        if (password.length < 8) {
            errorMessages.push("Password must be at least 8 characters long");
        }
        if (!/\d/.test(password)) {
            errorMessages.push("Password must contain at least one digit");
        }
        if (!/[a-z]/.test(password)) {
            errorMessages.push("Password must contain at least one lowercase letter");
        }
        if (!/[A-Z]/.test(password)) {
            errorMessages.push("Password must contain at least one uppercase letter");
        }
        throw new Error(errorMessages.join(", "));
    }
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const { rows: [user] } = await client.query(`
            INSERT INTO users(email, username, password, email_verified, date_created, last_login, "isAdmin")
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `, [email, username, hashedPassword, email_verified, date_created, last_login, isAdmin]);

        console.log(user);

        return user;
    } catch (error) {
        throw new Error('Failed to create user');
    }
}


async function getAllUsers() {
    try{
        const { rows } = await client.query(`
        SELECT *
        FROM users`);

        if (rows.length === 0) {
            throw new Error('No users found')
        }

        return rows
    } catch (error) {
        throw new Error('Cannot get all users')
    }
}

async function getUserById(id) {
    try {
        const { rows } = await client.query(`
        SELECT * 
        FROM users
        WHERE id=$1
      `, [id]);

        if (rows.length === 0) {
            throw new Error(`No user found with id ${id}`);
        }

        const user = rows[0];
        delete user.password;
        return user;
    } catch (error) {
        throw new Error('Cannot get user by ID');
    }
}

async function getUserByUsername(username) {
    try {
      const { rows } = await client.query(`
        SELECT * 
        FROM users
        WHERE username=$1
      `, [username]);
  
      const user = rows.length ? rows[0] : null;

      return user;
    } catch (error) {
      throw new Error('Cannot get user by Username');
    }
  }
  

async function getUserByEmail(email) {
    try {
        const { rows } = await client.query(`
        SELECT * 
        FROM users
        WHERE email=$1
      `, [email]);

        if (rows.length === 0) {
            throw new Error(`No user found with email: ${email}`);
        }

        const user = rows[0];
        return user;
    } catch (error) {
        throw new Error('Cannot get user by email');
    }
}

async function updateUser(id, updates) {
    const { username, email, email_verified, date_created, last_login, password, isAdmin } = updates;
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  
    // Validate password requirements
    if (password && !passwordRegex.test(password)) {
      let errorMessages = [];
      if (password.length < 8) {
        errorMessages.push("Password must be at least 8 characters long");
      }
      if (!/\d/.test(password)) {
        errorMessages.push("Password must contain at least one digit");
      }
      if (!/[a-z]/.test(password)) {
        errorMessages.push("Password must contain at least one lowercase letter");
      }
      if (!/[A-Z]/.test(password)) {
        errorMessages.push("Password must contain at least one uppercase letter");
      }
      throw new ValidationError(errorMessages.join(", "));
    }
  
    try {
      let updateFields = [];
      let values = [];
      let counter = 1;
  
      if (username) {
        updateFields.push(`username=$${counter}`);
        values.push(username);
        counter++;
      }
      if (email !== undefined) {
        updateFields.push(`email=$${counter}`);
        values.push(email);
        counter++;
      }
      if (email_verified !== undefined) {
        updateFields.push(`email_verified=$${counter}`);
        values.push(email_verified);
        counter++;
      }
      if (date_created !== undefined) {
        updateFields.push(`date_created=$${counter}`);
        values.push(date_created);
        counter++;
      }
      if (last_login !== undefined) {
        updateFields.push(`last_login=$${counter}`);
        values.push(last_login);
        counter++;
      }
      if (password) {
        const hashedPassword = await bcrypt.hash(password, SALT_COUNT);
        updateFields.push(`password=$${counter}`);
        values.push(hashedPassword);
        counter++;
      }
      if (isAdmin !== undefined) {
        updateFields.push(`"isAdmin"=$${counter}`);
        values.push(isAdmin);
        counter++;
      }
  
      if (updateFields.length === 0) {
        throw new Error("No valid updates provided");
      }
  
      const query = `
        UPDATE users
        SET ${updateFields.join(", ")}
        WHERE id=$${counter}
        RETURNING *;
      `;
  
      const { rows } = await client.query(query, [...values, id]);
  
      const user = rows[0];
      delete user.password;
      return user;
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }
  
  


  async function deleteUser(id) {
    try {
      await client.query('BEGIN');
  
      // Delete user's comments
      await client.query(
        `
        DELETE FROM comments
        WHERE user_id = $1;
        `,
        [id]
      );
  
      // Delete user's posts
      await client.query(
        `
        DELETE FROM posts
        WHERE user_id = $1;
        `,
        [id]
      );
  
      // Delete user
      const { rows } = await client.query(
        `
        DELETE FROM users
        WHERE id = $1
        RETURNING *;
        `,
        [id]
      );
  
      if (rows.length === 0) {
        throw new Error(`No user found with id ${id}`);
      }
  
      const user = rows[0];
      delete user.password;
  
      await client.query('COMMIT');
      return user;
    } catch (error) {
      await client.query('ROLLBACK');
      throw new Error('Failed to delete user');
    }
  }
  



module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    getUserByUsername,
    getUserByEmail,
    updateUser,
    deleteUser
};
