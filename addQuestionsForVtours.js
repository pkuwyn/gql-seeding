const { createReadStream } = require("fs");
const { request, gql } = require("graphql-request");
const questions = require("./questionsForVtour");

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

const GetVtourId = gql`
  query getIdByName($name: String) {
    allVtours(where: { name: $name }) {
      id
    }
  }
`;

const AddVtourQuestion = gql`
  mutation updateVtourQuestions($questionId: ID!, $id: ID!) {
    updateVtour(
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

    const { allVtours } = await request(graphqlUri, GetVtourId, {
      name: question.name,
    });

    const tourId =
      allVtours.length === 1
        ? allVtours[0].id
        : `虚拟实习${question.name}不存在`;
    console.log(tourId);

    const vtourAddQuestion = await request(graphqlUri, AddVtourQuestion, {
      id: tourId,
      questionId: data.createQuestion.id,
    });

    console.log(vtourAddQuestion);
  } catch (error) {
    console.log(error);
  }
};

const blockedAdd = async () => {
  for (let index = 0; index < questions.length; index++) {
    let question = questions[index];
    await addQuestion(question, "./questionsForVtour/questionImages");
  }
  console.log("finish add questions for vtours");
};

exports.addQuestionsForVtours = blockedAdd;
