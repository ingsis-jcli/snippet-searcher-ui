import {AUTH0_PASSWORD, AUTH0_USERNAME, BACKEND_URL} from "../../src/utils/constants";

describe('Add snippet tests', () => {
  beforeEach(() => {
    cy.loginToAuth0(
        AUTH0_USERNAME,
        AUTH0_PASSWORD
    )
  })
  it('Can add snippets manually', () => {
    cy.wait(2000)
    cy.visit("/")
    cy.intercept('POST', BACKEND_URL+"/snippets/snippet", (req) => {
      req.reply((res) => {
        expect(res.body).to.include.keys("id","name","content","language")
        expect(res.statusCode).to.eq(201);
      });
    }).as('postRequest');

    /* ==== Generated with Cypress Studio ==== */
    cy.get('.css-9jay18 > .MuiButton-root').click();
    cy.get('.MuiList-root > [tabindex="0"]').click();
    cy.get('#name').type('Name4');
    cy.get('#demo-simple-select').click()
    cy.get('[data-testid="menu-option-printscript:1.1"]').click()

    cy.get('[data-testid="add-snippet-code-editor"]').click();
    cy.get('[data-testid="add-snippet-code-editor"]').type(`const snippet: string = "some snippet"; \n println(snippet);`);
    cy.get('button:contains("Save Snippet")').click();

    cy.wait('@postRequest').its('response.statusCode').should('eq', 201);
  })

  it('Can add snippets via file', () => {
    cy.wait(2000)
    cy.visit("/")
    cy.intercept('POST', BACKEND_URL+"/snippets/snippet", (req) => {
      req.reply((res) => {
        expect(res.body).to.include.keys("id","name","content","language")
        expect(res.statusCode).to.eq(201);
      });
    }).as('postRequest');

    /* ==== Generated with Cypress Studio ==== */
      cy.get('[data-testid="AddSnippetButton"]').click();

      cy.get('[data-testid="LoadFromFileButton"]').click();

      cy.get('[data-testid="upload-file-input"').selectFile("cypress/fixtures/example_ps.ps", {force: true})

      cy.get('button:contains("Save Snippet")').click();

    cy.wait('@postRequest').its('response.statusCode').should('eq', 201);
  })
})
