const {createUser} = require('./users');
const {createPost} = require('./posts')

const client = require("./client")

async function dropTables() {
  try {
    console.log("Starting to drop tables...");

    await client.query(`
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
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        "isAdmin" BOOLEAN DEFAULT false
    );

    CREATE TABLE posts (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description VARCHAR(255) NOT NULL,
      price INTEGER,
      image BYTEA NOT NULL,
      contact VARCHAR(255) NOT NULL,
      contact_backup VARCHAR(255),
      report_count INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      location VARCHAR(255),
      category VARCHAR(255),
      "isActive" BOOLEAN DEFAULT false
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
      { username: "albert", password: "Bertie99", isAdmin: true },
      { username: "sandra", password: "Sandra123!", isAdmin: false },
      { username: "glamgal", password: "Glamgal123!", isAdmin: false }
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

async function createInitialposts() {
  console.log("Starting to create posts...");
  try {
    const postsToCreate = [
      {
        name: "Snowboard",
        description: "A great snowboard for any level of rider.",
        price: 200,
        image: "https://example.com/snowboard.jpg",
        contact: "john@example.com",
        contact_backup: "555-555-5555",
        report_count: 0,
        created_at: new Date(),
        isActive: true,
      },
      {
        name: "Ski Boots",
        description: "Top-of-the-line ski boots in great condition.",
        price: 150,
        image: "https://example.com/skiboots.jpg",
        contact: "jane@example.com",
        contact_backup: null,
        report_count: 0,
        created_at: new Date(),
        isActive: true,
      },
      {
        name: "Snowshoes",
        description: "Brand new snowshoes, never used.",
        price: 100,
        image: "https://example.com/snowshoes.jpg",
        contact: "bob@example.com",
        contact_backup: "555-555-5555",
        report_count: 0,
        created_at: new Date(),
        isActive: true,
      }
    ];

    const createdposts = [];
    for (const post of postsToCreate) {
      const createdpost = await createPost(post);
      createdposts.push(createdpost);
    }

    console.log("posts created:");
    console.log(createdposts);
    console.log("Finished creating posts!");

  } catch (error) {
    console.error("Error creating posts!");
    throw error;
  }
}

async function rebuildDB() {
  try {
    await dropTables()
    await createTables()
    await createInitialUsers()
    await createInitialposts()

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
