// update-admin.js
// Usage: node update-admin.js
// Make sure to install dependencies: npm install mongodb bcrypt

const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const MONGO_URI = 'mongodb://localhost:27017'; // Change if needed
const DB_NAME = 'your_db_name'; // Change to your database name
const ADMIN_EMAIL_OLD = 'superadmin@example.com';
const ADMIN_EMAIL_NEW = 'superadmin@discovergroup.com';
const NEW_PASSWORD = 'SuperSecure123!';

async function updateAdmin() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const users = db.collection('users');
    const hash = await bcrypt.hash(NEW_PASSWORD, 10);
    const result = await users.updateOne(
      { email: ADMIN_EMAIL_OLD },
      {
        $set: {
          email: ADMIN_EMAIL_NEW,
          password: hash,
          updatedAt: new Date(),
        },
      }
    );
    if (result.matchedCount) {
      console.log('Admin user updated successfully.');
    } else {
      console.log('No user found with email', ADMIN_EMAIL_OLD);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

updateAdmin();
