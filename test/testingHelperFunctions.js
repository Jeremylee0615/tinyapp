const { assert } = require('chai');

/// Testing these 4 helper functions since, other helper functions are just there to clean up codes and tested through the app.get/posts since they all worked how they are intended.///


const {generateRandomString, userOnlyURLs, checkAvailEmail, verifyInfo} = require('../helperFunctions'); 


const testUrlDatabase = {
  "saj2fi": {
    longURL: "http://github.com",
    user_id: "userRandomID"
  },
}

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  }
};



/// Testing generateRandomString () ///
describe('generateRandomString', function() {
  
  it('should return 6 digits', function() {
    const actualLength = generateRandomString().length
    const expectedLength = 6
    assert.equal(actualLength, expectedLength);
  });

  it('should generate same 2 consecutive strings', function() {
    const first = generateRandomString();
    const second = generateRandomString();
    assert.notEqual(first,second)
  });
});



/// Testing userOnlyURLs (id, urlDatabase) ///
describe('userOnlyURLs', function() { 

  it('should return an empty objects current user ID is not stored in the datebase', function() {
    const nonExsitingUserURL = userOnlyURLs("notAnUser", testUrlDatabase)
    const expected = {};
    assert.deepEqual(nonExsitingUserURL, expected)  
  });

  it('should return an objects of URL information accosiated with the current user ID', function() {
    const currentUserURL =  userOnlyURLs("userRandomID", testUrlDatabase)
    const expected = {
      "saj2fi": {
        longURL: "http://github.com",
        user_id: "userRandomID"
      },
    }
    assert.deepEqual(currentUserURL, expected)  
  });
})



/// Testing checkAvailEmail (email, users) ///
describe('checkAvailEmail', function() {
  
  it('should return false if email is already registered', function() {
    const registeredEmail = checkAvailEmail("user@example.com", testUsers);
    const expected = false;
    assert.equal(registeredEmail, expected)  
  });

  it('should return true if email is available to a use/not registered yet', function() {
    const availableEmail = checkAvailEmail("notregisterdEmail@test.com", testUsers);
    const expectedOutput = true;
    assert.equal(availableEmail, expectedOutput);
  });
});



describe('getUserByEmail (by using verifyInfo)', function() {
/// Test verifyInfo (email, users) ///
  it('should return a user with valid information with the associated email', function() {
    const userInfo = verifyInfo("user@example.com", testUsers);
    const expected = { id: "userRandomID", "email": "user@example.com", password: "purple-monkey-dinosaur" };
    assert.equal(userInfo.id, expected.id);
    assert.equal(userInfo.email, expected.email);
    assert.equal(userInfo.password, expected.password);
  });
});

