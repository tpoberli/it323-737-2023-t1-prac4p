const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const passportJWT = require('passport-jwt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

// Set up body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set up JWT strategy
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const jwtOptions = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'secret'
};
const strategy = new JWTStrategy(jwtOptions, (jwt_payload, next) => {
  // This callback verifies the JWT token and extracts the payload
  // Here you would typically check if the user exists in the database
  // and call next() with an error or the user object
  console.log('payload received', jwt_payload);
  const user = { id: jwt_payload.sub };
  next(null, user);
});
passport.use(strategy);

// Set up authentication middleware
const authMiddleware = passport.authenticate('jwt', { session: false });

// Define routes
app.post('/login', (req, res) => {
  // This route generates a JWT token if the username and password are correct
  const { username, password } = req.body;
  if (username === 'admin' && password === 'password') {
    const token = jwt.sign({ sub: 1 }, 'secret');
    res.json({ token });
  } else {
    res.sendStatus(401);
  }
});

app.get('/protected', authMiddleware, (req, res) => {
  // This route is protected and can only be accessed with a valid JWT token
  res.json({ message: 'Success! You can only see this if you have a valid token.' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
