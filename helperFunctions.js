
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
const newUser = (user, users) => {
  const newUserId = generateRandomString();
  /// storing the new generated user's id to the database ///
  user.id = newUserId;
  users[newUserId] = user;
  return user;
};

/// checking Currently signed in user ///
const userNow = (ids, users) => {
  for (let user in users) {
    if (ids === user) {
      return users[user].id;
    }
  }
};

/// Only User can see their URLs ///
const userOnlyURLs = (id, urlDatabase) => {
  const userURL = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].user_id === id) {
      userURL[key] = urlDatabase[key];
    }
  }
  return userURL;
};

/// checking if URLS are stored/created in the database ///
const checkUrls = (id, urlDatabase) => {
  return urlDatabase [id];
};

/// checking if the users are eligible to modify URLs (checking its theirs or not) ///
const isOwner = (user, id, urlDatabase) => {
  return user === urlDatabase[id].user_id;
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



module.exports = {generateRandomString, newUser, userNow, userOnlyURLs, checkUrls, isOwner, checkAvailEmail, verifyInfo};