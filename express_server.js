const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
app.set("view engine", "ejs");

const hashedPassword = function(password) {
  let secretPass = bcrypt;
  return secretPass.hashSync(password, 10);
}

let newID = function generateRandomString() {
  let r = Math.random().toString(36).substring(7);
  return r;
}

const emailChecker = function(newKey) {
  for (let object in users) {
    if (users[object].email === newKey) {
      return users[object]; 
    }
  } return false;
}

const flexibelEmailChecker = function(oldKey, newKey) {
  for (let object in users) {
    if (users[object][oldKey] === newKey) {
      return false; 
    }
  } return true;
}

const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"}, 
  "9sm5xK": {longURL: "http://www.google.com", userID: "user2RandomId"},
  "3bd9hd": {longURL: "http://www.panagrosso.com", userID: "bestwebsite"}
}

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

const urlsForUser = function(id) {
  let specificUrls = {};
  for (let eachUrl in urlDatabase) {
    if (urlDatabase[eachUrl].userID === id) {
      specificUrls[eachUrl] = urlDatabase[eachUrl];
    }
  } return specificUrls;
};

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// })

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/urls", (req, res) => {
  let userSpecificUrls = urlsForUser(req.cookies.user_id);

  let templateVars = {
    userSpecificUrls,
    users: users[req.cookies.user_id]
  }; 
  console.log(templateVars.users);
  res.render("urls_index", templateVars); //modify 
})

app.get("/urls/new", (req, res) => {
  if (req.cookies.user_id !== undefined) {
    let templateVars = {
      users: users[req.cookies.user_id]
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;

  let userSpecificUrls = urlsForUser(req.cookies.user_id);
  
  if (!userSpecificUrls[shortURL]) {
    res.send("<html><body>404: This page does not exist or does not belong to you...</body></html>")
  }
  let templateVars = {
    shortURL, 
    longURL: userSpecificUrls[shortURL].longURL, 
    users: users[req.cookies.user_id]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = newID();
  let userID = req.cookies.user_id;
  urlDatabase[shortURL] = {longURL, userID};
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  if (req.cookies.user_id !== undefined) {
    let shortURL = req.params.shortURL
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
})

app.post('/urls/:shortURL', (req, res) => {
  if (req.cookies.user_id !== undefined) {
    let userSpecificUrls = urlsForUser(req.cookies.user_id);

    let shortURL = req.params.shortURL;
    let longURL = userSpecificUrls[shortURL].longURL;
    
    let editedContent = req.body.edit_content;
    userSpecificUrls[shortURL].longURL = editedContent;
  
    res.redirect("/urls");
  }
})

app.get('/login', (req, res) => {
  let templateVars = {
    users: users[req.cookies.user_id]
  };
  res.render("urls_login", templateVars);
})

app.get('/register', (req, res) => {
  let templateVars = {
    users: users[req.cookies.user_id]
  };
  res.render("urls_form", templateVars);
})

app.post('/login', (req, res) => {
  let submittedUsername = req.body.email;
  let submittedPassword = req.body.password;
  let userFound = emailChecker(submittedUsername)
  if (submittedUsername === "" || submittedPassword === "") {
    res.send("400: Your email or password was entered incorrectly. Please enter a valid username or password.")  
  } else if (!userFound){
    res.send("403: No account registered to that email.")
  } else if (userFound) {
    if (bcrypt.compareSync(submittedPassword, userFound.password)) {
      res.cookie("user_id", userFound.id);
      res.redirect("/urls");
    } else {
      res.send("403: Incorrect password.");
    }
  } 
})

console.log(users);

app.post('/register', (req, res) => {
  let newUsername = req.body.email;
  let newPassword = req.body.password;
  let newFormID = newID();
  if (newUsername === "" || newPassword === "") {
    res.send("400: Your email or password was entered incorrectly. Please enter a valid username or password.")  
  } else if (emailChecker(newUsername)) {
    res.send("404: This email is already registered.") 
  } else {
    users[newFormID] = {id: newFormID, email: newUsername, password: hashedPassword(newPassword)}
    res.cookie("user_id", newFormID)
    res.redirect("/urls");
  }
})

app.post('/logout', (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});