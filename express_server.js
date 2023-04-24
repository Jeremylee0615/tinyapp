const express = require("express");
var cookieParser = require("cookie-parser");
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
  exampleUserInfo: {
    id: "ihateerrors",
    email: "why@isitnotdefined.com",
    password: "man-I-hate-this",}
};

/// checking Currently signed in user ///
const userNow = (cookie) => {
  for (let user in users) {
    if (cookie === user) {
      return users[user].id;
    }
  }
};

/// Generates 6 digits of Random Strings consisting numbers and letters ///
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

/// adding New user to users database ///
const newUser = (user) => {
 const newUserId = generateRandomString ()
 /// storing the new generated user's id to the database /// 
 user.id = newUserId;
 users[newUserId] = user;
 return user;
}


/// checking if URLS are stored/created in the database ///
const checkUrls = (ids, urlDatabase) => {
  return urlDatabase [ids];
};


/// checking if email is available to use ///
const checkAvailEmail = (email, users) => {
  for (let key in users) {
    if (users[key].email === email) {
      return false;
    }
  }
  return true;
};

/// checking if user's info associated with email matched in database ///

const verifyInfo = (email, users) => {
  for (let key in users) {
    if (users[key].email === email) {
      return users[key];
    }
  }
  return undefined;
};

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//////////////////// URLs main Page ////////////////////
app.get("/urls", (req, res) => {
  const currentUser = userNow(req.cookies['user_id'])
  const templateVars = { 
    urls: urlDatabase, 
    currentUser: currentUser
  };
  res.render("urls_index", templateVars);
});

/// Generating random shortURLs for the longURLs that is newly added ///
app.post("/urls", (req, res) => {
  const generatedURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[generatedURL] = longURL
  res.redirect(`/urls/${generatedURL}`);
});


//////////////////// Create New URL Page ////////////////////
app.get("/urls/new", (req, res) => {
  const currentUser = userNow(req.cookies['user_id'])
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
  if (checkUrls(id, urlDatabase)) {
    const longURL = urlDatabase[req.cookies.id];
    const currentUser = userNow(req.cookies['user_id'])
    const templateVars = { 
    id: id,
    longURL: longURL,
    currentUser : currentUser
  };
  res.render("urls_show", templateVars);
 } else {
  res.send ("does not exist")
 };
});

/// After adding new URL auto-redirect to the URL info Page ///
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  res.redirect(`/urls/${id}`);
});


//////////////////// Direct to the URL site ////////////////////
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  if (checkUrls(id, urlDatabase)) {
    const longURL = urlDatabase[id];
    res.redirect(longURL);
  } else {
  res.status(404).send("URLs not found");
  }
});


//////////////////// Register Page ////////////////////
app.get("/register", (req, res) => {
  const currentUser = userNow(req.cookies['user_id'])
  const templateVars = { 
    currentUser: currentUser
  };
  res.render("register", templateVars);
});

/// User Registration function ///
app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  
  /// Missing email input ///
  if (userEmail === '') {
    return  res.status(400).send("Email is missing! ⛔")
  /// Missing passward input ///
  } else if (userPassword === '') {
    return  res.status(400).send("Password is missing! ⛔")
  /// Entered existing emails /// 
  } else if (!checkAvailEmail (userEmail, users)) {
    return res.status(400).send ("Sorry, the email you registered is already in use 🚫 ") 
  }
  
  addNew = newUser (req.body)
  res.cookie ('user_id', addNew.id)
  res.redirect("/urls");
});

//////////////////// Login Page ////////////////////

app.get("/login", (req, res) => {
  const currentUser = userNow(req.cookies['user_id'])
  const templateVars = { 
    currentUser: currentUser,
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const emailEntered = req.body.email;
  const passwordEntered = req.body.password;
   /// checking if password enetered matches with the user password in the database ///
  if (verifyInfo (emailEntered, users)) { 
    const userPassword = verifyInfo(emailEntered, users).password;
    const userId = verifyInfo(emailEntered, users).id;
    if (userPassword !== passwordEntered) {
      res.status(400).send ('Oops... Something is not quite right. Please check your password! ⛔')
    } else {
      res.cookie('user_id', userId)
      res.redirect("/urls")
    }  
  } else {
    res.status(400).send ('Email does not seem to exist! Please register first! 🖊️')
  } 
});

/// Log Out function ///
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/login");
});


/// editing URL function ///
app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL
  urlDatabase[id] = longURL;
  res.redirect("/urls");
});

/// deleting URL function ///
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});