Built with Next.js(https://nextjs.org/).
Using Ant.Design for UI Component Framework(https://ant.design/).
Using MySQL as database

Prerequisite
1. Node v14
2. NPM v6
3. MySQL v8

Setup Instructions
1. Run "npm install" via command line
2. Import restaurant.sql into your MySQL database to setup the table
3. Update .env file with database configuration and a secret key for JWT token
4. Run "Node ParseAndInsertData.js" via command line to populate the database

Dev Deployment
1. Run "npm run dev" via command line on the directory root

Production Deployment
1. Run "npm run build && npm run start" via command line on the directory root







