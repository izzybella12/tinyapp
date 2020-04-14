const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));

app.set("view engine", "ejs");

function generateRandomString() {

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

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
})

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
})

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  let templateVars = {shortURL, longURL: urlDatabase[shortURL]};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  urlDatabase[req.body] = req.body;
  console.log(urlDatabase);
  // console.log(req.body);  // Log the POST request body to the console
  res.send(//This is where I'd put the value new URL?);         // Respond with 'Ok' (we will replace this)
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});