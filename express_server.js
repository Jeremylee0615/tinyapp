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


/// checking if email is good to use ///
const checkEmail = (email, users) => {
  for (let key in users) {
    if (users[key].email === email) {
      return false;
    }
  }
  return true;
};


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

/// URLs Front Page ///
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase, 
    user_id: req.cookies['user_id'] 
  };
  res.render("urls_index", templateVars);
});

/// Create New URL Page ///
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    user_id: 
    req.cookies['user_id']
  };
  res.render("urls_new", templateVars);
});

///After Creating new URL Page///
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  if (checkUrls(id, urlDatabase)) {
    const longURL = urlDatabase[req.cookies.id];
    const templateVars = { 
    id, 
    longURL 
  };
  res.render("urls_show", templateVars);
 } else {
  res.send ("does not exist")
 };
});


/// Direct click to the site accociated with URLs ///
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  if (checkUrls(id, urlDatabase)) {
    const longURL = urlDatabase[id];
    res.redirect(longURL);
  } else {
  res.status(404).send("URLs not found");
  }
});


/// Register Page///
app.get("/register", (req, res) => {
  const templateVars = { 
    user_id :req.cookies['user_id']
  };
  res.render("register", templateVars);
});

/// Generating random shortURLs for the longURLs that is newly added ///
app.post("/urls", (req, res) => {
  const generatedURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[generatedURL] = longURL
  res.redirect(`/urls/${generatedURL}`);
});



app.get("/login", (req, res) => {
  const templateVars = { 
    email: null,
  };
  res.render("login", templateVars);
});



/// After adding new URL auto-redirect to the URL info Page ///
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  res.redirect(`/urls/${id}`);
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
  } else if (!checkEmail (userEmail, users)) {
    return res.status(400).send ("Sorry, the email you registered is already in use 🚫 ") 
  }
  
  addNew = newUser (req.body)
  res.cookie ('user_id', addNew.id)
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  for (const user_id in users) {
    if (users[user_id].email === userEmail &&
        users[user_id].password === userPassword      
      )
      res.redirect("/urls");
    }
  return res.status(400).send ("The Information you have entered does not match. ⛔")
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id', req.body["user_id"]);
  res.redirect("/login");
});

app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL
  urlDatabase[id] = longURL;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});