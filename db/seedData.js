const { createUser } = require('./users');
const { createPost } = require('./posts');
const { createCategory } = require('./category')
const { createContactType } = require('./contact')

const client = require("./client")

async function dropTables() {
  try {
    console.log("Starting to drop tables...");

    await client.query(`
      DROP TABLE IF EXISTS posts;
      DROP TABLE IF EXISTS category;
      DROP TABLE IF EXISTS contact_type;
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
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        "isAdmin" BOOLEAN DEFAULT false
    );

    CREATE TABLE contact_type (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL
    );

    CREATE TABLE category (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL
    );

    CREATE TABLE posts (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description VARCHAR(255) NOT NULL,
      price INTEGER,
      image BYTEA NOT NULL,
      "contactType" INTEGER REFERENCES contact_type(id),
      contact VARCHAR(255) NOT NULL,
      "contactTypeBackup" INTEGER REFERENCES contact_type(id),
      contact_backup VARCHAR(255),
      report_count INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      location VARCHAR(255),
      "categoryId" INTEGER REFERENCES category(id),
      "isActive" BOOLEAN DEFAULT false,
      "userId" INTEGER REFERENCES users(id)
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
      { email: "cole@gmail.com", username: "albert", password: "Bertie99", isAdmin: true },
      { email: "colee@gmail.com", username: "sandra", password: "Sandra123!", isAdmin: false },
      { email: "coleee@gmail.com", username: "glamgal", password: "Glamgal123!", isAdmin: false }
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

async function createInitialContactType() {
  console.log("Starting to create contact types...");
  try {
    const contactTypesToCreate = [
      { name: "Email" },
      { name: "Instagram" },
      { name: "Phone" },
    ];

    const createdContactTypes = [];
    for (const contactType of contactTypesToCreate) {
      const createdType = await createContactType(contactType);
      createdContactTypes.push(createdType);
    }

    console.log("Contact types created:");
    console.log(createdContactTypes);
    console.log("Finished creating contact types!");

  } catch (error) {
    console.error("Error creating contact types!");
    throw error;
  }
}


async function createInitialCategories() {
  console.log("Starting to create categories...");
  try {
    const categoriesToCreate = [
      { name: "Electronics" },
      { name: "Books" },
      { name: "Clothing" },
    ];

    const createdCategories = [];
    for (const category of categoriesToCreate) {
      const createdCategory = await createCategory(category);
      createdCategories.push(createdCategory);
    }

    console.log("Categories created:");
    console.log(createdCategories);
    console.log("Finished creating categories!");

  } catch (error) {
    console.error("Error creating categories!");
    throw error;
  }
}


async function createInitialPosts() {
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
        contactType: 1,
        contact: "jane@example.com",
        contact_backup: null,
        report_count: 0,
        created_at: new Date(),
        categoryId: 1,
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
    await createInitialContactType()
    await createInitialCategories()
    await createInitialPosts()
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
