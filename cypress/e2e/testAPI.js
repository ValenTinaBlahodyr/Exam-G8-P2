import post from '../fixtures/post.json';
import {faker, fakerFA} from '@faker-js/faker';

post.title = faker.lorem.sentence();
post.content = faker.lorem.paragraph();

describe('API Tests', () => {
  it('1-Get all posts', () => {
    cy.request('GET','/posts').then((response) => {
      expect(response.status).to.eq(200);
        expect(response.headers['content-type']).to.include('application/json')
    });
  });
  it('2-Get only first 10 posts', () => {
    cy.request('/posts?_limit=10')
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.length(10);

        });
  });
  it('3-Get posts with id = 55 and id = 60.', () => {
    cy.request('GET', '/posts?id=55&id=60')
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.length(2);
          const ids = response.body.map(post => post.id);
          expect(ids).to.include(55);
          expect(ids).to.include(60);

        });
  });
  it('4-Create a post. Verify HTTP response status code.', () => {
    cy.request({
      method: 'POST',
      url: '/664/posts',
      failOnStatusCode: false,
    }).then((response) =>{
      expect(response.status).to.eq(401);

    })
  })
  it.skip('5-Create post with adding access token in header. Verify HTTP response status code. Verify post is created.', () => {
   const accessToken = 'test-access-token'
   cy.request({
      method: 'POST',
      url: '/664/posts',
      headers: {
          'Authorization': `Bearer ${accessToken}`
      }
    }).then((response) =>{
      expect(response.status).to.eq(201);

    })
  })
  it('6-Create post entity and verify that the entity is created', () => {
    cy.request('POST','/posts', post).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('id');
      expect(response.body).to.have.property('title', post.title);
      expect(response.body).to.have.property('content', post.content);

    });
  });
  it('7-Update non-existing entity. Verify HTTP response status code.', () => {
    const nonExistingPost = 666;
      cy.request({
          method: 'PUT',
          url: `/posts/${nonExistingPost}`,
          failOnStatusCode: false
      })
          .then((response) => {
      expect(response.status).to.eq(404);

    });
  });
  it('8-Create post entity and update the created entity. Verify HTTP response status code and verify that the entity is updated.', () => {
      const newPost = {
          title: faker.lorem.sentence(),
          content: faker.lorem.paragraph()
      };
      cy.request('POST', `/posts`, newPost).then((createResponse) => {
          expect(createResponse.status).to.eq(201);
          const createdPostId = createResponse.body.id;
          const updatedPost = {
              title: faker.lorem.sentence(),
              content: faker.lorem.paragraph()
          };
          cy.request('PUT', `/posts/${createdPostId}`, updatedPost).then((updateResponse) => {
              expect(updateResponse.status).to.eq(200);

              expect(updateResponse.body.title).to.eq(updatedPost.title);
              expect(updateResponse.body.content).to.eq(updatedPost.content);
          })
      })
  })
  it('9-Delete non-existing post entity. Verify HTTP response status code.', () => {
      const nonExistingPost = 9999;
      cy.request({
          method: 'DELETE',
          url: `/posts/${nonExistingPost}`,
          failOnStatusCode: false
      }).then((response) => {
          expect(response.status).to.eq(404);
      });
  });
  it('10-Create post entity, update the created entity, and delete the entity. Verify HTTP response status code and verify that the entity is deleted.', () => {
      let postId;
      const newPost = {
          title: faker.lorem.sentence(),
          body: faker.lorem.paragraph(),
          userId: faker.datatype.number()
      };
      cy.request('POST', `/posts`, newPost).then((createResponse) => {
          expect(createResponse.status).to.eq(201);
          postId = createResponse.body.id;

          cy.log('Update the  post');
          const updatedPost = {
              ...newPost,
              title: faker.lorem.sentence(),
              body: faker.lorem.paragraph()
          };

          cy.request('PUT', `/posts/${postId}`, updatedPost).then((updateResponse) => {
              expect(updateResponse.status).to.eq(200);
              expect(updateResponse.body.title).to.eq(updatedPost.title);
              expect(updateResponse.body.body).to.eq(updatedPost.body);

              cy.log('Delete post');
              cy.request('DELETE', `/posts/${postId}`).then((deleteResponse) => {
                  expect(deleteResponse.status).to.eq(200);

                cy.log('Check deleted post');
                  cy.request({
                      method: 'GET',
                      url: `/posts/${postId}`,
                      failOnStatusCode: false
                  }).then((getResponse) => {
                      expect(getResponse.status).to.eq(404);
                  });
              });
          });
      });
  });

});

