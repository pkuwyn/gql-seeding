//https://github.com/keystonejs/keystone-discussions-archive/discussions/54
//https://www.drewtown.dev/post/uploading-images-and-files-to-keystone-js-via-the-graphql-api/

const { createReadStream } = require("fs");
const { request, gql } = require("graphql-request");
const courses = require("./courses");

const { graphqlUri } = require("./config.js");

console.log({ graphqlUri });

const courseIdMap = {};

const CreateCourseWithCoverImage = gql`
  mutation createCourseWithImage($data: CourseCreateInput) {
    createCourse(data: $data) {
      name
      id
    }
  }
`;

const addCourse = async (course, imageFolder) => {
  console.log(`start add Course ${course.name}...`);
  console.log(courseIdMap);
  const fatherId = course.father ? courseIdMap[course.father] : undefined;
  console.log(fatherId);

  try {
    const data = await request(graphqlUri, CreateCourseWithCoverImage, {
      data: {
        name: course.name,
        summary: course.summary,
        category: course.category,
        learningTime: course.learningTime,
        father: fatherId ? { connect: { id: fatherId } } : null,
        order: course.order,
        coverImage: createReadStream(`${imageFolder}/${course.coverImage}`),
      },
    });

    console.log(data);
    courseIdMap[data.createCourse.name] = data.createCourse.id;
  } catch (error) {
    console.log(error);
  }
};

const blockedAdd = async () => {
  for (let index = 0; index < courses.length; index++) {
    let course = courses[index];
    await addCourse(course, "./courses/coverImages");
  }
  // console.log(courseIdMap);
  console.log("finish add courses");
};

// courses.forEach((course) => addCourse(course, "./courses/coverImages"));

// console.log(courseIdMap);

exports.addCourses = blockedAdd;
