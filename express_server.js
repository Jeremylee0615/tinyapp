const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['Lighthouse Labs'],
  /// 24 hours limit ///
  maxAge: 24 * 60 * 60 * 1000
}));

/// Helper Functions exports ///
const {generateRandomString, newUser, userNow, userOnlyURLs, checkUrls, isOwner, checkAvailEmail, verifyInfo} = require('./helperFunctions');


const urlDatabase = {
  /*"b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    user_id: "abc123"},
  "9sm5xK": {
    longURL: "http://www.google.com",
    user_id: "abc123"}*/
};

const users = {
  /*exampleUserInfo: {
    id: "ihateerrors",
    email: "why@isitnotdefined.com",
    password: "man-I-hate-this",}*/
};



app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});



//////////////////// Direct TinyApp Page ////////////////////
app.get("/", (req, res) => {
  const currentUser = userNow(req.session.user_id, users);
  if (!currentUser) {
    res.redirect("/login");
  }
  res.redirect("/urls");
});



//////////////////// Register Page ////////////////////
app.get("/register", (req, res) => {
  const currentUser = userNow(req.session.user_id, users);
  const templateVars = {
    currentUser: currentUser
  };
  res.render("register", templateVars);
});

/// User Registration function ///
app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  ///implemented hashed passwords///
  const hashedPassword = bcrypt.hashSync(userPassword, 10);
  /// Missing email input ///
  if (userEmail === '') {
    res.status(400).send("Email is missing! ⛔");
  /// Missing passward input ///
  } else if (userPassword === '') {
    res.status(400).send("Password is missing! ⛔");
  /// Entered existing emails ///
  } else if (!checkAvailEmail(userEmail, users)) {
    res.status(400).send("Sorry, the email you registered is already in use 🚫 ");
  } else {
    req.body.password = hashedPassword;
  }
  addNew = newUser(req.body, users);
  req.session.user_id = addNew.id;
  res.redirect("/urls");
});



//////////////////// Login Page ////////////////////
app.get("/login", (req, res) => {
  const currentUser = userNow(req.session.user_id, users);
  const templateVars = {
    currentUser: currentUser,
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const emailEntered = req.body.email;
  const passwordEntered = req.body.password;
  /// checking if password enetered matches with the user password in the database ///
  if (verifyInfo(emailEntered, users)) {
    const userPassword = verifyInfo(emailEntered, users).password;
    const userId = verifyInfo(emailEntered, users).id;
    if (!bcrypt.compareSync(passwordEntered, userPassword)) {
      res.status(400).send('Oops... Something is not quite right. Please check your password! ⛔');
    } else {
      req.session.user_id = userId;
      res.redirect("/urls");
    }
  } else {
    res.status(400).send('Email does not seem to exist! Please register first! 🖊️');
  }
});



//////////////////// URLs main Page ////////////////////
app.get("/urls", (req, res) => {
  const currentUser = userNow(req.session.user_id, users);
  if (!currentUser) {
    res.status(400).send("Please Log in or Register First! ⛔");
  }
  const userURLs = userOnlyURLs(currentUser, urlDatabase);
  const templateVars = {
    urls: userURLs,
    currentUser: currentUser
  };
  res.render("urls_index", templateVars);
});

/// Generating random shortURLs for the longURLs that is newly added ///
app.post("/urls", (req, res) => {
  const generatedURL = generateRandomString();
  const longURL = req.body.longURL;
  const currentUser = userNow(req.session.user_id, users);
  urlDatabase[generatedURL] = {
    longURL: longURL,
    user_id: currentUser
  };
  res.redirect(`/urls/${generatedURL}`);
});



//////////////////// Create New URL Page ////////////////////
app.get("/urls/new", (req, res) => {
  const currentUser = userNow(req.session.user_id, users);
  if (!currentUser) {
    res.redirect('/login');
  }

  const templateVars = {
    currentUser : currentUser
  };

  res.render("urls_new", templateVars);
});



//////////////////// After Creating new URL Page ////////////////////
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const currentUser = userNow(req.session.user_id, users);
  /// if users manually type URL links that does not exist ///
  if (!urlDatabase[id]) {
    res.status(400).send("The URL link does not exist 🚫");
  /// if users manually type the URL links that they did not create ///
  } else if (currentUser !== urlDatabase[id].user_id) {
    res.status(400).send("Sorry, you do not have access to this links ⛔");
  }
  if (checkUrls(id, urlDatabase)) {
    const longURL = urlDatabase[id].longURL;
    const currentUser = userNow(req.session.user_id, users);
    const templateVars = {
      id: id,
      longURL: longURL,
      currentUser : currentUser
    };
    res.render("urls_show", templateVars);
  } else {
    res.send("URLs not found");
  }
});



//////////////////// Direct to the URL site ////////////////////
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  if (checkUrls(id, urlDatabase)) {
    const longURL = urlDatabase[id].longURL;
    res.redirect(longURL);
  } else {
    res.status(404).send("URLs not found");
  }
});



/// editing URL function ///
app.post("/urls/:id/edit", (req, res) => {
  /// Check for LogIn first to pass through the other conditions ///
  if (!req.session.user_id) {
    res.status(400).send("Please Log in or Register First! ⛔");
  }
  const id = req.params.id;
  const longURL = req.body.longURL;
  const currentUser = userNow(req.session.user_id, users);
  if (!isOwner(currentUser, id, urlDatabase)) {
    res.status(400).send("Sorry, This URL does not belong to you to modify ⛔");
  } else {
    urlDatabase[id].longURL = longURL;
    res.redirect("/urls");
  }
});



/// deleting URL function ///
app.post("/urls/:id/delete", (req, res) => {
/// Check for LogIn first to pass through the other conditions ///
  if (!req.session.user_id) {
    res.status(400).send("Please Log in or Register First! ⛔");
  }
  const id = req.params.id;
  const currentUser = userNow(req.session.user_id, users);
  if (!isOwner(currentUser, id, urlDatabase)) {
    res.status(400).send("Sorry, This URL does not belong to you to modify ⛔");
  } else {
    delete urlDatabase[id];
    res.redirect("/urls");
  }
});



/// Log Out function ///
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});