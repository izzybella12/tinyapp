const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const emailChecker = require('./helper');
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieSession({
  name: 'session',
  secret: "apple"
}));

//Function to hash through password
const hashedPassword = function(password) {
  let secretPass = bcrypt;
  return secretPass.hashSync(password, 10);
};

//Function to generate a random 6 digit alphanumetic string
let randomUserId = function() {
  let r = Math.random().toString(36).substring(7);
  return r;
};

//Function to generate a user-specific URL database
const urlsUserSpecific = function(id, database) {
  let specificUrls = {};
  for (let eachUrl in database) {
    if (database[eachUrl].userID === id) {
      specificUrls[eachUrl] = database[eachUrl];
    }
  } return specificUrls;
};

//Hard-coded user database
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: hashedPassword("purple")

  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: hashedPassword("dishwasher")
  },
  "bestwebsite": {
    id: "bestwebsite",
    email: "phil@gmail.com",
    password: hashedPassword("1234")
  }
};

//Hard-coded URL Database
const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"},
  "9sm5xK": {longURL: "http://www.google.com", userID: "user2RandomId"},
  "3bd9hd": {longURL: "http://www.panagrosso.com", userID: "bestwebsite"}
};

//If logged in, redirects to urls
//If logged out, redirects to login
app.get("/", (req, res) => {
  if (req.session.user_id !== undefined) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

//If logged in, renders HTML with header and list of relevant URLS
//If logged out, renders HTML with header and message to log in
app.get("/urls", (req, res) => {
  let userSpecificUrls = urlsUserSpecific(req.session.user_id, urlDatabase);

  let templateVars = {
    userSpecificUrls,
    users: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});

//If logged in, renders HTML with header and form to input URL and submit
//If logged out, redirects to login page
app.get("/urls/new", (req, res) => {
  if (req.session.user_id !== undefined) {
    let templateVars = {
      users: users[req.session.user_id]
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

//If logged in and user owns URL, renders HTML and header with form and to edit and submit
//If logged in and users doesn't own URL, returns appropriate error message
//If logged out, returns appropriate error message
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  let userSpecificUrls = urlsUserSpecific(req.session.user_id, urlDatabase);
  if ((req.session.user_id !== undefined) && !userSpecificUrls[shortURL]) {
    res.send("<html><body>404: This page is not part of your URL repertoir.</body></html>");
  }
  if (req.session.user_id === undefined) {
    res.send("<html><body>404: You must be logged in to access this page.</body></html>");
  }
  let templateVars = {
    shortURL,
    longURL: userSpecificUrls[shortURL].longURL,
    users: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
});

//If long URL exists, redirects to the long URL
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

//If logged in, generates a short URL and associates it with user ID in URL database
app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = randomUserId();
  let userID = req.session.user_id;
  urlDatabase[shortURL] = {longURL, userID};
  res.redirect(`/urls/${shortURL}`);
});

//If logged in and user owns URL, updates URL and redirects to URLs page
//If logged out, no URLs can be updated
app.post('/urls/:shortURL', (req, res) => {
  if (req.session.user_id !== undefined) {
    let userSpecificUrls = urlsUserSpecific(req.session.user_id, urlDatabase);
    let shortURL = req.params.shortURL;
    let editedLongUrl = req.body.edit_content;
    userSpecificUrls[shortURL].longURL = editedLongUrl;
    res.redirect("/urls");
  }
});

//If logged in, deletes a given URL in repertoir and redirects to URLs
//If logged out, no URLs can be deleted
app.post('/urls/:shortURL/delete', (req, res) => {
  if (req.session.user_id !== undefined) {
    let shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
});

//If logged in, redirects to URLs
//If logged out, renders HTML with login section and login button
app.get('/login', (req, res) => {
  let templateVars = {
    users: users[req.session.user_id]
  };
  res.render("urls_login", templateVars);
});

//If logged in, redirects to URLs
//If logged out, renders HTML with register section and register button
app.get('/register', (req, res) => {
  let templateVars = {
    users: users[req.session.user_id]
  };
  res.render("urls_form", templateVars);
});

//If an empty email/password is submitted, prompts an error message
//If email isn't in user database, prompts an error message
//If email is in database and password is correct, sets a cookie and redirects to URLs
//If email is in database but password is incorrect, prompts an erorr message
app.post('/login', (req, res) => {
  let submittedEmail = req.body.email;
  let submittedPassword = req.body.password;
  let userFound = emailChecker(submittedEmail, users);
  if (submittedEmail === "" || submittedPassword === "") {
    res.send("401: Your email or password was entered incorrectly. Please enter a valid username or password.");
  } else if (!userFound) {
    res.send("404: No account registered to this email.");
  } else if (userFound) {
    if (bcrypt.compareSync(submittedPassword, users[userFound].password)) {
      req.session.user_id = users[userFound].id;
      res.redirect("/urls");
    } else {
      res.send("401: Incorrect password.");
    }
  }
});

//If an empty email/password is submitted, prompts an error message
//If email is already in user database, prompts an error message
//Creates a new user, hashes the password, sets a cookie, and redirects to URLs
app.post('/register', (req, res) => {
  let newUsername = req.body.email;
  let newPassword = req.body.password;
  let newFormID = randomUserId();
  if (newUsername === "" || newPassword === "") {
    res.send("401: Your email or password was entered incorrectly. Please enter a valid username or password.");
  } else if (emailChecker(newUsername, users)) {
    res.send("404: This email is already registered.");
  } else {
    users[newFormID] = {id: newFormID, email: newUsername, password: hashedPassword(newPassword)};
    req.session.user_id = newFormID;
    res.redirect("/urls");
  }
});

//Deletes the cookie
//Redirects to URLs
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});