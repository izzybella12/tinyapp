const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const emailChecker = require('./helper')
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
}

//Function to generate a random 6 digit alphanumetic string
let randomUserId = function generateRandomString() {
  let r = Math.random().toString(36).substring(7);
  return r;
}

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
}

//Hard-coded URL Database
const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"}, 
  "9sm5xK": {longURL: "http://www.google.com", userID: "user2RandomId"},
  "3bd9hd": {longURL: "http://www.panagrosso.com", userID: "bestwebsite"}
}

//Function to generate a user-specific URL database
const urlsUserSpecific = function(id, database) {
  let specificUrls = {};
  for (let eachUrl in database) {
    if (database[eachUrl].userID === id) {
      specificUrls[eachUrl] = database[eachUrl];
    }
  } return specificUrls;
};

app.get("/urls", (req, res) => {
  let userSpecificUrls = urlsUserSpecific(req.session.user_id, urlDatabase);

  let templateVars = {
    userSpecificUrls,
    users: users[req.session.user_id]
  }; 
  res.render("urls_index", templateVars);
})

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

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  let userSpecificUrls = urlsUserSpecific(req.session.user_id, urlDatabase);
  
  if (!userSpecificUrls[shortURL]) {
    res.send("<html><body>404: You must be logged in to access this page...</body></html>")
  }
  
  let templateVars = {
    shortURL, 
    longURL: userSpecificUrls[shortURL].longURL, 
    users: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = randomUserId();
  let userID = req.session.user_id;
  urlDatabase[shortURL] = {longURL, userID};
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  if (req.session.user_id !== undefined) {
    let shortURL = req.params.shortURL
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
})

app.post('/urls/:shortURL', (req, res) => {
  if (req.session.user_id !== undefined) {
    let userSpecificUrls = urlsUserSpecific(req.session.user_id, urlDatabase);

    let shortURL = req.params.shortURL;
    let longURL = userSpecificUrls[shortURL].longURL;
    
    let editedContent = req.body.edit_content;
    userSpecificUrls[shortURL].longURL = editedContent;
  
    res.redirect("/urls");
  }
})

app.get('/login', (req, res) => {
  let templateVars = {
    users: users[req.session.user_id]
  };
  res.render("urls_login", templateVars);
})

app.get('/register', (req, res) => {
  let templateVars = {
    users: users[req.session.user_id]
  };
  res.render("urls_form", templateVars);
})

app.post('/login', (req, res) => {
  let submittedUsername = req.body.email;
  let submittedPassword = req.body.password;
  let userFound = emailChecker(submittedUsername, users)
  if (submittedUsername === "" || submittedPassword === "") {
    res.send("400: Your email or password was entered incorrectly. Please enter a valid username or password.")  
  } else if (!userFound){
    res.send("403: No account registered to that email.")
  } else if (userFound) {
    if (bcrypt.compareSync(submittedPassword, users[userFound].password)) {
      req.session.user_id = users[userFound].id;
      res.redirect("/urls");
    } else {
      res.send("403: Incorrect password.");
    }
  } 
})

app.post('/register', (req, res) => {
  let newUsername = req.body.email;
  let newPassword = req.body.password;
  let newFormID = randomUserId();
  if (newUsername === "" || newPassword === "") {
    res.send("400: Your email or password was entered incorrectly. Please enter a valid username or password.")  
  } else if (emailChecker(newUsername, users)) {
    res.send("404: This email is already registered.") 
  } else {
    users[newFormID] = {id: newFormID, email: newUsername, password: hashedPassword(newPassword)}
    req.session.user_id = newFormID
    res.redirect("/urls");
  }
})

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect("/login");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});