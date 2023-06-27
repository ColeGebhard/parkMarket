const { createUser } = require('./users');
const { createPost } = require('./posts');
const { createComment } = require('./comment')

const client = require("./client")

async function dropTables() {
  try {
    console.log("Starting to drop tables...");

    await client.query(`
      DROP TABLE IF EXISTS comments;
      DROP TABLE IF EXISTS posts;
      DROP TABLE IF EXISTS users;
    `);

    console.log("Finished dropping tables!");
  } catch (error) {
    console.error("Error dropping tables!");
    throw error;
  }
}

async function createTables() {
  try {
    console.log("Starting to build tables...");

    await client.query(`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE,
      password VARCHAR(255),
      email VARCHAR(255),
      email_verified BOOLEAN,
      date_created DATE,
      last_login DATE,
      "isAdmin" BOOLEAN DEFAULT false
    );
    
    CREATE TABLE posts (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255),
      body VARCHAR,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      date_created TIMESTAMP,
      like_user_id INT[] DEFAULT ARRAY[]::INT[],
      likes INT DEFAULT 0,
      image BYTEA
    );
    
    CREATE TABLE comments (
      id SERIAL PRIMARY KEY,
      comment VARCHAR(255),
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      post_id INT REFERENCES posts(id) ON DELETE CASCADE,
      date_created TIMESTAMP
    );
    
    
    
      `);
    console.log("Finished building tables!");
  } catch (error) {
    console.error("Error building tables!");
    throw error;
  }
}

async function createInitialUsers() {
  console.log("Starting to create users...");
  try {
    const usersToCreate = [
      { email: "john@example.com", username: "john_doe", password: "Password123!", isAdmin: true },
      { email: "jane@example.com", username: "jane_smith", password: "Secret123!", isAdmin: false },
      { email: "admin@example.com", username: "admin_user", password: "AdminPass123!", isAdmin: true }
    ];

    const createdUsers = [];
    for (const user of usersToCreate) {
      const createdUser = await createUser(user);
      createdUsers.push(createdUser);
    }

    console.log("Users created:");
    console.log(createdUsers);
    console.log("Finished creating users!");

  } catch (error) {
    console.error("Error creating users!");
    throw error;
  }
}

// async function createInitialCategories() {
//   console.log("Starting to create categories...");
//   try {
//     const categoriesToCreate = [
//       { name: "Electronics" },
//       { name: "Books" },
//       { name: "Clothing" },
//     ];

//     const createdCategories = [];
//     for (const category of categoriesToCreate) {
//       const createdCategory = await createCategory(category);
//       createdCategories.push(createdCategory);
//     }

//     console.log("Categories created:");
//     console.log(createdCategories);
//     console.log("Finished creating categories!");

//   } catch (error) {
//     console.error("Error creating categories!");
//     throw error;
//   }
// }


// async function createInitialPosts() {
//   console.log("Starting to create posts...");
//   try {
//     const postsToCreate = [
//       { 
//         title: "First Post",
//         body: "This is the first post.",
//         user_id: 1,
//         date_created: new Date(),
//         image: "data:image/png;base64,iVBORw0KGg..." // Replace with your base64 image data
//       },
//       { 
//         title: "Second Post",
//         body: "This is the second post.",
//         user_id: 1,
//         date_created: new Date(),
//         image: "data:image/jpeg;base64,/9j/4AAQSkZ..." // Replace with your base64 image data
//       },
//       // Add more posts as needed
//     ];

//     const createdPosts = [];
//     for (const post of postsToCreate) {
//       const createdPost = await createPost(post);
//       createdPosts.push(createdPost);
//     }

//     console.log("Posts created:");
//     console.log(createdPosts);
//     console.log("Finished creating posts!");

//   } catch (error) {
//     console.error("Error creating posts!");
//     throw error;
//   }
// }

// async function createInitialComments() {
//   console.log("Starting to create comments...");
//   try {
//     const commentsToCreate = [
//       { 
//         comment: "Great post!",
//         user_id: 1,
//         post_id: 1,
//         date_created: new Date()
//       },
//       { 
//         comment: "Interesting insights.",
//         user_id: 2,
//         post_id: 1,
//         date_created: new Date()
//       },
//       { 
//         comment: "Thanks for sharing!",
//         user_id: 3,
//         post_id: 2,
//         date_created: new Date()
//       },
//       // Add more comments as needed
//     ];

//     const createdComments = [];
//     for (const comment of commentsToCreate) {
//       const createdComment = await createComment(comment);
//       createdComments.push(createdComment);
//     }

//     console.log("Comments created:");
//     console.log(createdComments);
//     console.log("Finished creating comments!");

//   } catch (error) {
//     console.error("Error creating comments!");
//     throw error;
//   }
// }


async function rebuildDB() {
  try {
    await dropTables()
    await createTables()
    await createInitialUsers()
    // await createInitialCategories()
    // await createInitialPosts()
    // await createInitialComments()
  } catch (error) {
    console.log("Error during rebuildDB")
    throw error
  }
}

module.exports = {
  rebuildDB,
  dropTables,
  createTables,
}
