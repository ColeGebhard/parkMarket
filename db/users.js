const client = require('./client')
const SALT_COUNT = 10;
const bcrypt = require('bcrypt')

async function createUser({ username, password, isAdmin }) {
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
        const hashedPassword = await bcrypt.hash(password, SALT_COUNT);
        const { rows: [user] } = await client.query(`
        INSERT INTO users(username,password, "isAdmin")
        VALUES($1,$2,$3)
        RETURNING *;
      `, [username, hashedPassword, isAdmin]);

        console.log(user)

        delete user.password;
        return user;
    } catch (error) {
        throw Error('Failed to create user')
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

        if (rows.length === 0) {
            throw new Error(`No user found with username: ${username}`);
        }

        const user = rows[0];
        delete user.password;
        return user;
    } catch (error) {
        throw new Error('Cannot get user by Username');
    }
}

async function updateUser(id, updates) {
    const { username, password, isAdmin } = updates;
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
        throw new Error(errorMessages.join(", "));
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
        throw new Error('Failed to update user');
    }
}


async function deleteUser(id) {
    try {
        const { rows } = await client.query(`
        DELETE FROM users
        WHERE id=$1
        RETURNING *;
      `, [id]);

        if (rows.length === 0) {
            throw new Error(`No user found with id ${id}`);
        }

        const user = rows[0];
        delete user.password;
        return user;
    } catch (error) {
        throw new Error('Failed to delete user');
    }
}


module.exports = {
    createUser,
    getUserById,
    getUserByUsername,
    updateUser,
    deleteUser
};
