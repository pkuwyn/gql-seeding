const { createReadStream } = require("fs");
const { request, gql } = require("graphql-request");
const vtours = require("./vtours");

const { graphqlUri } = require("./config.js");
console.log({ graphqlUri });

const CreateVtourWithCoverImage = gql`
  mutation createVtourWithImage($data: VtourCreateInput) {
    createVtour(data: $data) {
      name
      id
    }
  }
`;

const addVtour = async (vtour, imageFolder) => {
  console.log(`start add Vtour ${vtour.name}...`);
  try {
    const data = await request(graphqlUri, CreateVtourWithCoverImage, {
      data: {
        name: vtour.name,
        tourType: vtour.tourType,
        url: vtour.url,
        summary: vtour.summary,
        learningTime: vtour.learningTime,
        order: vtour.order,
        content: vtour.content,
        tourImage: createReadStream(`${imageFolder}/${vtour.tourImage}`),
      },
    });

    console.log(data);
  } catch (error) {
    console.log(error);
  }
};

const blockedAdd = async () => {
  for (let index = 0; index < vtours.length; index++) {
    let vtour = vtours[index];
    await addVtour(vtour, "./vtours/tourImages");
  }
  console.log("finish add vtours");
};

exports.addVtours = blockedAdd;
