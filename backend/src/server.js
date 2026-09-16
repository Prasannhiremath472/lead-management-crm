require('module-alias/register');

// Make sure we are running node 7.6+
const [major, minor] = process.versions.node.split('.').map(parseFloat);
if (major < 20) {
  console.log('Please upgrade your node.js version at least 20 or greater. 👌\n ');
  process.exit();
}

// import environmental variables from our variables.env file
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

const pool = require('@/db/pool');

pool
  .query('SELECT 1')
  .then(() => console.log('✅ MySQL connection established'))
  .catch((error) => {
    console.log(
      `1. 🔥 Common Error caused issue → : check your .env file first and add your MySQL credentials`
    );
    console.error(`2. 🚫 Error → : ${error.message}`);
  });

// Start our app!
const app = require('./app');
app.set('port', process.env.PORT || 8888);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running → On PORT : ${server.address().port}`);
});
