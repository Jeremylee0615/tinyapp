const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; 

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "why@isitnotdefined.com",
    password: "man-I-hate-this",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "a@a.com",
    password: "acscsd",
  },
};


const generateRandomString = () => {
  let upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let lowerCase = upperCase.toLowerCase();
  let numeric = '1234567890';
  let inputs = upperCase + lowerCase + numeric;
  let result = '';
  let combinationLength = 6;
  for (let i = 0; i < combinationLength; i++) {
    result += inputs.charAt(Math.round(Math.random() * inputs.length));
  }
  return result;
};



app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/urls", (req, res) => {
  const user_id = req.cookies["user_id"]
  const templateVars = { 
    urls: urlDatabase, 
    user_id
    };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let generatedURL = generateRandomString();
  urlDatabase[generatedURL] = req.body.longURL;
  res.redirect(`/urls/${generatedURL}`);
});

app.get("/urls/new", (req, res) => {
  const user_id = req.cookies["user_id"]
  const templateVars = { 
    urls: urlDatabase, 
    user_id
    };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[req.params.id].longURL
  const user_id = req.cookies["user_id"]
  const templateVars = { 
    id, 
    longURL, 
    user_id
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  res.redirect(`/urls/${id}`);
});

app.get("/register", (req, res) => {
  const user_id = req.cookies["user_id"]
  const templateVars = { 
    user_id
  };
  res.render("register", templateVars);
});


app.post("/register", (req, res) => {
  const userId = generateRandomString()
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("Please enter a valid information! ⛔");
  } 

  for (const userId in users) {
    if (users[userId].email === email) {
      return res.status(400).send("Sorry, the email you registered is already in use 🚫 ");
    }
  }
  const user = {
    id: userId,
    email: email,
    password: password
  };
  users[userId] = user;
  res.cookie('userId', userId);
  res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
  res.cookie("user_id", req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect(`/urls`);
});

app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls`);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});