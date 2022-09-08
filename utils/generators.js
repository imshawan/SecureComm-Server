const { faker } = require("@faker-js/faker");
const { capitalizeFirstLetter } = require("./utilities");

const generator = module.exports;

const MAX_FIRSTNAME_LENGTH = 1;
const MAX_LASTNAME_LENGTH = 2;

const animal = [
  "bear",
  "bird",
  "cat",
  "cetacean",
  "cow",
  "crocodilia",
  "dog",
  "fish",
  "horse",
  "insect",
  "lion",
  "rabbit",
  "rodent",
  "snake",
];

const name = [
    "lastName",
    "middleName"
];


const ranzomizedArray = [{animal}, {name}];
const firstNameArray = [
    {name: ["firstName"]},
    {word: ["adjective"]},
    {hacker: ["adjective"]}
];

generator.generateRanzomizedName = () => {
    let key, value;

    ({ key, value } = getRandomElement(firstNameArray));
    let firstName = capitalizeFirstLetter(faker[key][value]());

    ({ key, value } = getRandomElement(ranzomizedArray));
    let lastName = capitalizeFirstLetter(faker[key][value]());

    let lastNameToArray = lastName.split(' ');
    let firstNameToArray = firstName.split(' ');
    
    if (firstNameToArray.length > MAX_FIRSTNAME_LENGTH) {
        firstNameToArray.length = MAX_FIRSTNAME_LENGTH;
        firstName = firstNameToArray.join(' ');
    }

    if (lastNameToArray.length > MAX_LASTNAME_LENGTH) {
        lastNameToArray.length = MAX_LASTNAME_LENGTH;
        lastName = lastNameToArray.join(' ');
    }

    return { firstName, lastName };
};

generator.generateRanzomizedAbout = () => {
    return faker.hacker.phrase();
};

function getRandomElement (array) {
    const ranzomizedArrayElement = array[Math.floor(Math.random() * array.length)];
    let key = Object.keys(ranzomizedArrayElement)[0];
    let values = ranzomizedArrayElement[key];

    values = values[Math.floor(Math.random() * values.length)];
    return { key, value: values };
}