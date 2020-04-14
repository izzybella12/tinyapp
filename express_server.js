const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));

app.set("view engine", "ejs");

let newID = function generateRandomString() {
  let r = Math.random().toString(36).substring(7);
  return r;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca", 
  "9sm5xK": "http://www.google.com"
}

app.get("/", (req, res) => {
  res.send("Hello");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// })

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
})

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.send("<html><body>404: This page does not exist...</body></html>")
  }
  let templateVars = {shortURL, longURL: urlDatabase[shortURL]};
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
  delete urlDatabase[req.params.shortURL];
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
  res.redirect("/urls");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});