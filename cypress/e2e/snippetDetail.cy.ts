import {AUTH0_PASSWORD, AUTH0_USERNAME, BACKEND_URL} from "../../src/utils/constants";

describe('Add snippet tests', () => {
  beforeEach(() => {
    cy.loginToAuth0(
        AUTH0_USERNAME,
        AUTH0_PASSWORD
    )

    cy.intercept('GET', BACKEND_URL + "/snippets/snippet/search*", {
      statusCode: 200,
      body: [snippet],
    }).as("getSnippets")

    cy.intercept('GET', BACKEND_URL + "/snippets/snippet?snippetId=1", {
      statusCode: 200,
      body: snippet,
    }).as("getSnippetById")

    cy.intercept('POST', BACKEND_URL + "/permissions/*", {
      statusCode: 200,
      body: {
        page: 1,
        page_size: 1,
        count: 1,
        users: [ { id: "1", email: "name@gmail.com" } ]
      },
    }).as("share")

    cy.visit("/")

    cy.wait("@getSnippets")
    cy.wait(2000)

    cy.get('[data-testid="snippet-row"]').first().click();

    cy.wait("@getSnippetById")
  })

  it('Can share a snippet ', () => {
    cy.wait(2000)
    cy.get('[aria-label="Share"]').click();
    cy.get('button[aria-label="Open"]').click();
    cy.get('[role="listbox"] li:nth-child(1)').click();
    cy.wait(1000)
    cy.get('.css-1yuhvjn > .MuiBox-root > .MuiButton-contained').click();
    cy.wait(2000)
  })

  /*
  it('Can run snippets', function() {
    cy.get('[data-testid="PlayArrowIcon"]').click();
    cy.get('.css-1hpabnv > .MuiBox-root > div > .npm__react-simple-code-editor__textarea').should("have.length.greaterThan",0);
  });
  */

  it('Can format snippets', function() {
    cy.get('[data-testid="ReadMoreIcon"] > path').click();
  });

  it('Can save snippets', function() {
    cy.get('.css-10egq61 > .MuiBox-root > div > .npm__react-simple-code-editor__textarea').click();
    cy.get('.css-10egq61 > .MuiBox-root > div > .npm__react-simple-code-editor__textarea').type("println(2);");
    cy.get('[data-testid="SaveIcon"] > path').click();
  });

  it('Can delete snippets', function() {
    cy.get('[data-testid="DeleteIcon"] > path').click();
  });
})

const snippet = {
  id: "1",
  name: "snippet1234",
  content: "let a:string;",
  language: "printscript",
  extension: 'ps',
  compliance: 'pending',
  author: 'auth0|6713367e70200200728782b5',
  owner: 'auth0|6713367e70200200728782b5',
}