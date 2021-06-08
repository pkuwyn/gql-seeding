const { createReadStream } = require("fs");
const { request, gql } = require("graphql-request");
const questions = require("./questionsForCourse");

const { graphqlUri } = require("./config.js");
console.log({ graphqlUri });

const CreateQuestionWithCoverImage = gql`
  mutation createQuestionWithImage($data: QuestionCreateInput) {
    createQuestion(data: $data) {
      name
      id
    }
  }
`;

const GetCourseId = gql`
  query getIdByName($name: String) {
    allCourses(where: { name: $name }) {
      id
    }
  }
`;

const AddCourseQuestion = gql`
  mutation updateCourseQuestion($questionId: ID!, $id: ID!) {
    updateCourse(
      id: $id
      data: { questions: { connect: { id: $questionId } } }
    ) {
      name
      questions {
        content
      }
    }
  }
`;

const addQuestion = async ({ questionImage, ...question }, imageFolder) => {
  console.log(`start add Vtour ${question.name}...`);

  const questionData = {
    ...question,
  };

  if (questionImage) {
    questionData.questionImage = createReadStream(
      `${imageFolder}/${questionImage}`
    );
  }

  try {
    const data = await request(graphqlUri, CreateQuestionWithCoverImage, {
      data: questionData,
    });
    console.log(data);

    const { allCourses } = await request(graphqlUri, GetCourseId, {
      name: question.name,
    });

    const courseId =
      allCourses.length === 1 ? allCourses[0].id : `课程${question.name}不存在`;
    console.log(courseId);

    const courseAddQuestion = await request(graphqlUri, AddCourseQuestion, {
      id: courseId,
      questionId: data.createQuestion.id,
    });

    console.log(courseAddQuestion);
  } catch (error) {
    console.log(error);
  }
};

const blockedAdd = async () => {
  for (let index = 0; index < questions.length; index++) {
    let question = questions[index];
    await addQuestion(question, "./questionsForCourse/questionImages");
  }
  console.log("finish add questions for courses");
};

exports.addQuestionsForCourses = blockedAdd;
