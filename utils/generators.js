const { faker } = require("@faker-js/faker");

const generator = module.exports;

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
    "firstName",
    "fullName",
    "lastName",
    "middleName"
];


const ranzomizedArray = [animal, name];

generator.generateRanzomizedName = () => {
    const ranzomizedArrayElement = [];
  
};

generator.generateRanzomizedAbout = () => {
    return faker.hacker.phrase();
};
