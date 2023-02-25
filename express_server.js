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


const check_If_In_Use = (email, userDatabase) => {
  for (userId in userDatabase) {
    if (userDatabase[userId].email === email) {
      return true;
    }
  }
  return false;
}



//////////////tiny app - localhost:8080/urls begins//////////////

////////////////GETS////////////////
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// updated the headlines for it to display the username
app.get("/urls", (req, res) => {
  const user_Id = req.cookies["user_Id"]
  const templateVars = {
    urls: urlDatabase,
    user_Id: user_Id
  };
  res.render("urls_index", templateVars);
});

//create new URL page
app.get("/urls/new", (req, res) => {
  const user_Id = req.cookies["user_Id"]
  const templateVars = {
    urls: urlDatabase,
    user_Id: user_Id
  };
  res.render("urls_new", templateVars);
});

//long ID page
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const user_Id = req.cookies["user_Id"];
  const templateVars = {id, longURL, user_Id};
  res.render("urls_show", templateVars);
});

//register page
app.get("/register", (req, res) => {
  const user_Id = req.cookies["user_Id"];
  const templateVars = { user_Id };
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
  if (req.body.username) {
    const user_Id = req.body.user_id;
    res.cookie("user_id", user_Id);
  }
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  const user_Id = req.body["user_Id"]
  res.clearCookie("user_id", user_Id);
  res.redirect("/urls");
});

app.post("/register", (req,res) => {
  const user_Id = generateRandomString();
  console.log ('this is req.body', req.body) 
  const user_Password = req.body.password
  const accountEmail = req.body.email
 
    if(!user_Password || !accountEmail) {
    return res.status(400).send ("Please enter a valid information! ⛔")  
  } else if (check_If_In_Use(accountEmail, users)) {
    return res.status(400).send ("Sorry, the email you registered is already in use 🚫 ")
  }
  
  const newUser = {
    id: user_Id,
    password: user_Password,
    email: accountEmail
  };

  users[user_Id] = newUser 
  res.cookie("user_Id", user_Id) 
  res.redirect("/urls")

})

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






