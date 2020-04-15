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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca", 
  "9sm5xK": "http://www.google.com",
  "3bd9hd": "www.panagrosso.com"
}

// app.get("/", (req, res) => {
//   res.send("Hello");
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// })

app.get("/urls", (req, res) => {
  let templateVars = {
    urlDatabase, 
    username: req.cookies.username
  };
  res.render("urls_index", templateVars); //modify 
})

app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies.username
  };
  res.render("urls_new", templateVars); 
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.send("<html><body>404: This page does not exist...</body></html>")
  }
  let templateVars = {
    shortURL, 
    longURL: urlDatabase[shortURL], 
    username: req.cookies.username
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

app.post('/login', (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
})

app.post('/logout', (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});