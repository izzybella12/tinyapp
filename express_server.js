const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());

app.set("view engine", "ejs");

let newID = function generateRandomString() {
  let r = Math.random().toString(36).substring(7);
  return r;
}

const emailChecker = function(newKey) {
  for (let object in users) {
    if (users[object].email === newKey) {
      return true; 
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
  "b2xVn2": "http://www.lighthouselabs.ca", 
  "9sm5xK": "http://www.google.com",
  "3bd9hd": "http://www.panagrosso.com"
}

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

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
  console.log(req.cookies);
  let templateVars = {
    urlDatabase,
    users: users[req.cookies.user_id]
  }; 
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
  if (!urlDatabase[shortURL]) {
    res.send("<html><body>404: This page does not exist...</body></html>")
  }
  let templateVars = {
    shortURL, 
    longURL: urlDatabase[shortURL], 
    users: users[req.cookies.user_id]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  let newURL = req.body.longURL;
  let shortURL = newID();
  urlDatabase[shortURL] = newURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  let shortURL = req.params.shortURL
  delete urlDatabase[shortURL];
  res.redirect("/urls");
})

app.post('/urls/:shortURL/edit', (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase.shortURL;
  
  let editedContent = req.body.edit_content;
  urlDatabase[shortURL] = editedContent;

  res.redirect("/urls");
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
  if (submittedUsername === "" || submittedPassword === "") {
    res.send("400: Your email or password was entered incorrectly. Please enter a valid username or password.")  
  } else if (emailChecker(submittedUsername) === false){
    res.send("403: No account registered to that email.")
  } else if (emailChecker(submittedUsername) === true) {
    for (let object in users) {
      if ((users[object].email === submittedUsername) && (users[object].password !== submittedPassword)) {
        res.send("403: Incorrect password.");
      } else if ((users[object].email === submittedUsername) && (users[object].password === submittedPassword)) {
        res.cookie("user_id", users[object].id);
      }
    }
  } 
  res.redirect("/urls");
})

app.post('/register', (req, res) => {
  let newUsername = req.body.email;
  let newPassword = req.body.password;
  let newFormID = newID();
  if (newUsername === "" || newPassword === "") {
    res.send("400: Your email or password was entered incorrectly. Please enter a valid username or password.")  
  } else if (emailChecker(newUsername) === true) {
    res.send("404: This email is already registered.") 
  } else {
    users[newFormID] = {id: newFormID, email: newUsername, password: newPassword}
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