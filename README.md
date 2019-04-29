# nosql-vulnerable-nodejs-app
Minimalist NodeJS app with NoSQL injection attack vulnerabilities.

Fixes ```branch``` on this repository contains the source code with fixes for the vulnerabilities.

Please make sure that NodeJS and MongoDB are installed in order to deploy the vulnerable app.

After cloning the repository, navigate to the app directory and execute the following commands: 

    npm install
    npm run db-migrate
    npm run app

When the app is running, open ```http://localhost:3000/``` on browser.

There are three features in this app: registration, login, and user invoices page.
1. Registration (```/register```) enables the user to register a new account. 
It will open a form with name field, username field, and password field.
2. Login (```/login```) enables the user to login using registered username and password combination. On successful login attempt, it will set the cookie and redirect the user to user invoices page.
3. User invoices page (```/protected/searchinvoices```) let the authenticated user to view the invoices belong to his/her account. The page will not show invoices for other users. In this page, user can set the minimum amount in the invoice to be displayed.

There are two registered account, each has some invoices attached to his/her account.

Name	| Username |	Password
------|----------|-----------
Alice Alison |	alice | passw0rd
Bobby Bobson | bobby | secret
