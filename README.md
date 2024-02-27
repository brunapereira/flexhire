## Flexhire 

## Pre-requisites

- Node 18 and NPM
- ngrok account

## Running the application

1. Run `npm install` on both frontend and backend projects.
2. Run `ngrok http 3001` on backend project and copy the public address provided by ngrok. 
3. Run `NGROK_HOST='host' npm start` on backend project.
4. Run `npm start` on frontend project.
5. Using a browser, navigate to `localhost:3000`
6. Enter a valid Flexhire API Key and press Load Profile.
