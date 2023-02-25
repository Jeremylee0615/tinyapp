const express = require("express");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express();
const PORT = 8080;

app.use(bodyParser.urlencoded({ extended: true}));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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


//Global users' set information
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const usersAccountInfo = (email, users) => {
  for (userId in users) {
    if (users[userId].email === email) {
      return users[userId]
    }
  }
}

const checkIfInUse = (email, userDatabase) => {
  for (userId in userDatabase) {
    if (userDatabase[userId].email === email) {
      return true;
    }
  }
  return false;
};



//////////////tiny app - localhost:8080/urls begins//////////////



////////////////GETS////////////////
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//updated the headlines for it to display the username
app.get("/urls", (req, res) => {
  const userId = req.cookies["userId"];
  const templateVars = {
    urls: urlDatabase,
    userId: userId
  };
  res.render("urls_index", templateVars);
});

//create new URL page
app.get("/urls/new", (req, res) => {
  const userId = req.cookies["userId"];
  const templateVars = {
    urls: urlDatabase,
    userId: userId
  };
  res.render("urls_new", templateVars);
});

//long ID page
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const userId = req.cookies["userId"];
  const templateVars = {id, longURL, userId};
  res.render("urls_show", templateVars);
});

//login page
app.get("/login", (req, res) => {
  const userId = req.cookies["userId"];
  const templateVars = { userId };
  res.render("login", templateVars);
});


//register page
app.get("/register", (req, res) => {
  const userId = req.cookies["userId"];
  const templateVars = { userId };
  res.render("register", templateVars);
});

// tinyapp/u/shortURL page
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});



////////////////POSTS////////////////
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/login", (req, res) => {
    const emailEntered = req.body.email;  
    const passwordEntered = req.body.password;
    if (usersAccountInfo(emailEntered, users)) {
      const userPassword = usersAccountInfo(emailEntered, users).password
      console.log('users from database:', usersAccountInfo(emailEntered, users))
      const userId = usersAccountInfo(emailEntered, users).id;
      if (userPassword !== passwordEntered) {
        res.status(403).send("Password does not match. ⛔")
      } else {
        res.cookie("userId", userId)
        res.redirect("/urls");
      }     
    } else {
      res.status(403).send("The email does not exist. ⛔")
    }
  });

app.post("/logout", (req, res) => {
  const userId = req.body["userId"];
  res.clearCookie("userId", userId);
  res.redirect("/login");
});

app.post("/register", (req,res) => {
  const userId = generateRandomString();
  //console.log ('this is req.body', req.body)
  const userPassword = req.body.password;
  const accountEmail = req.body.email;
 
  if (!userPassword || !accountEmail) {
    return res.status(400).send("Please enter a valid information! ⛔");
  } else if (checkIfInUse(accountEmail, users)) {
    return res.status(400).send("Sorry, the email you registered is already in use 🚫 ");
  }
  
  const newUser = {
    id: userId,
    password: userPassword,
    email: accountEmail
  };

  users[userId] = newUser;
  //res.cookie("userId", userId);
  res.redirect("/login");

});

app.post("/urls/:id/edit", (req,res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req,res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});