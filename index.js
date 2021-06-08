const { addQuestionsForCourses } = require("./addQuestionsForCourses");
const { addCourses } = require("./addCourses");
const { addVtours } = require("./addVtours");
const { addQuestionsForVtours } = require("./addQuestionsForVtours");

const addInOrder = async () => {
  await addCourses();
  await addVtours();
  await addQuestionsForCourses();
  await addQuestionsForVtours();
};

addInOrder();
