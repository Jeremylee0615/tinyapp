const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const bodyParser = require('body-parser');
const app = express();
const PORT = 8080;

app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['userId']
}));


//////////////tiny app - localhost:8080/urls begins//////////////



////////////////Global users'  information////////////////
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "a1b2c3"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "d1e2f3"
  }
};

const users = {
  userRandomID: {
    id: "abc123",
    email : "abc123@example.com",
    password: "def456",
  }
};


////////////////Helper Functions////////////////
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


const newAdd = (newInfo, users) => {
  const addId = generateRandomString();
  newInfo.id = addId;
  newInfo.password = bcrypt.hashSync(newInfo.password, 10);
  users[addId] = newInfo;
  return newInfo;
};

const checkUser = (cookie, users) => {
  for (let userIds in users) {
    if (cookie === userIds) 
      return users[userIds].email
  }
}


const checkURL = (url, urlDatabase) => {
  return urlDatabase[url];
};


const checkBelong = (userId, id, users) => {
  return userId === users[id].usersID;
};


const getUserByEmail  = (email, users) => {
  for (let userId in users) {
    if (users[userId].email === email) {
    return users[userId]
    }
  }
  return undefined;
};


const checkIfInUse = (email, users) => {
  for (let userId in users) {
    if (users[userId].email === email) {
      return true;
    }
  }
  return false;
};


const urlsForUser = (id) => {
  let userUrls  = {};
  for (let info in urlDatabase) {
    if (urlDatabase[info]["userID"] === id) {
      urlDatabase[info] = urlDatabase[info];

    }
  }
  return userUrls;
}


////////////////GETS////////////////
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


//updated the headlines for it to display the username
app.get("/urls", (req, res) => {
  const currentUser = checkUser(req.session["userId"], users)
  if (!currentUser) {
    res.redirect ("register");
  } else {
    const linksForUser = urlsForUser(currentUser)
    const templateVars = {
      urls: linksForUser,
      userId: currentUser
    };
  res.render("urls_index", templateVars);
  }
});


/////create new URL page/////
app.get("/urls/new", (req, res) => {
  const currentUser = checkUser(req.session["userId"], users)
  if (!currentUser) {
    return res.redirect ("/login")
  } else {
    const templateVars = { 
      userId: currentUser 
    };
    res.render("urls_new", templateVars);
  }
});


/////short ID page/////
app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const currentUser = checkUser(req.session["userId"], users);
  if (checkURL(shortURL, urlDatabase)) {
    if (currentUser !== urlDatabase[shortURL].userID) {
      res.send('This id does not belong to you');
    } else {
      const longURL = urlDatabase[shortURL].longURL;
      let templateVars = { 
        id: shortURL, 
        longURL: longURL, 
        userId: currentUser};
      res.render('urls_show', templateVars);
    }
  } else {
    res.send('This url does not exist');
  }
});




app.get("/login", (req, res) => {
  const currentUser = checkUser(req.session["userId"], users)
  if (currentUser) {
    res.redirect ("/urls")
  } else {
    const templateVars = { 
      userId: currentUser
    };
    res.render("login", templateVars);
  }  
});



/////register page/////
app.get("/register", (req, res) => {
  const currentUser = checkUser(req.session["userId"], users)
  if (currentUser) {    
    res.redirect("/urls")
  } else {
    const templateVars = {
      userId: currentUser
    }
    res.render("register", templateVars);
  }
});



/////tinyapp/u/shortURL page/////
app.get("/u/:id", (req, res) => {
  const urlID = req.params.shortURL;
  if (checkURL(urlID, urlDatabase)) {
    const longURL = urlDatabase[urlID].longURL;
    res.redirect(longURL);
  } else {
    res.status(404).send('Does not exist');
  }
});



////////////////POSTS////////////////
app.post("/urls", (req, res) => {
  const currentUser = checkUser(req.session["userId"], users)
  if (!currentUser) {
    res.redirect("/login")
  } else {
  const urlID = generateRandomString();
  const longURL = req.body.longURL
    urlDatabase[urlID] = {
    longURL: longURL,
    userId: currentUser
  }
  res.redirect(`/urls/${urlID}`);  
  }
});


app.post("/login", (req, res) => {
    const emailEntered = req.body.email;  
    const passwordEntered = req.body.password;
    const currentUser = getUserByEmail (emailEntered, users)
    if (!currentUser) {
      return res.status(403).send("The email does not exist. ⛔")
    }
    if (!bcrypt.compareSync(passwordEntered, currentUser.password)){
      return res.status(403).send("Password does not match. ⛔")
    }
    req.session.userId = currentUser.id
    res.redirect("/urls"); 
  });


app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});


app.post("/register", (req,res) => {
  const userPassword = req.body.password;
  const accountEmail = req.body.email;
 
  if (!userPassword || !accountEmail) {
    return res.status(400).send("Please enter a valid information! ⛔");
  } else if (checkIfInUse(accountEmail, users)) {
    return res.status(400).send("Sorry, the email you registered is already in use 🚫 ");
  } else {
    const newId = newAdd(req.body, users);
    req.session.userId = newId.id;
    res.redirect('/urls');
  }
});


app.post("/urls/:id/edit", (req,res) => {
  const currentUser = checkUser(req.session["userId"], users)
  const urlID = req.params.id
  if (!checkBelong (currentUser, urlID, urlDatabase)) {
    res.status(400).send ("Sorry you do not have an access to edit this URL!⛔")
  } else {
  urlDatabase[urlID].longURL = req.body.longURL;
  res.redirect("/urls");
  }
});


app.post("/urls/:id/delete", (req,res) => {
  const currentUser = checkUser(req.session["userId"], users)
  const urlID = req.params.id
  if (!checkBelong (currentUser, urlID, urlDatabase)) {
    res.status(400).send ("Sorry you do not have an access to delete this URL!⛔")
  } else {
    delete urlDatabase[urlID];
    res.redirect("/urls");
  }
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});