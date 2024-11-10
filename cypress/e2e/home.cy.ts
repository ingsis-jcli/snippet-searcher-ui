import {AUTH0_PASSWORD, AUTH0_USERNAME, BACKEND_URL, FRONTEND_URL} from "../../src/utils/constants";

describe('Home', () => {
    beforeEach(() => {
        cy.loginToAuth0(
            AUTH0_USERNAME,
            AUTH0_PASSWORD
        )
    })
    before(() => {
        process.env.FRONTEND_URL = Cypress.env("FRONTEND_URL");
        process.env.BACKEND_URL = Cypress.env("BACKEND_URL");
    })
    it('Renders home', () => {
        cy.visit(FRONTEND_URL)
        /* ==== Generated with Cypress Studio ==== */
        cy.get('.MuiTypography-h6').should('have.text', 'Printscript');
        cy.get('.MuiBox-root > .MuiInputBase-root > .MuiInputBase-input').should('be.visible');
        cy.get('.css-9jay18 > .MuiButton-root').should('be.visible');
        cy.get('.css-jie5ja').click();
        /* ==== End Cypress Studio ==== */
    })

    // You need to have at least 1 snippet in your DB for this test to pass
    it('Renders the first snippets', () => {
        cy.visit(FRONTEND_URL)
        const first10Snippets = cy.get('[data-testid="snippet-row"]')

        first10Snippets.should('have.length.greaterThan', 0)

        first10Snippets.should('have.length.lessThan', 10)
    })

    it('Can create snippet and find snippets by name', () => {
        cy.loginToAuth0(AUTH0_USERNAME, AUTH0_PASSWORD);

        cy.visit(FRONTEND_URL);
        const snippetData = {
            name: "TestName8",
            content: "println(1);",
            language: "printscript",
            version: "1.1",
        };

        cy.intercept('POST', 'http://localhost/api/snippets/snippet', {
            statusCode: 201,
            body: {
                ...snippetData,
                id: 9,
            }
        }).as('createSnippet');

        cy.intercept('GET', 'http://localhost/api/snippets*', (req) => {
            req.reply((res) => {
                expect(res.statusCode).to.eq(200);
            });
        }).as('getSnippets');

        cy.get('[data-testid="AddSnippetButton"]').click();
        cy.get('[data-testid="CreateSnippetButton"]').click();
        cy.get('[data-testid="SnippetNameInput"]', { timeout: 10000 }).type(snippetData.name);
        cy.get('[data-testid="add-snippet-code-editor"]').type(snippetData.content);
        cy.get('#demo-simple-select').click();
        cy.get('[data-testid="menu-option-printscript:1.1"]').click();
        cy.get('button:contains("Save Snippet")').click();

        cy.wait(500);
        cy.wait('@createSnippet').then((interception) => {
            const { request, response } = interception;
            expect(request.body).to.deep.equal(snippetData);
            expect(response?.statusCode).to.eq(201);
            expect(response.body.name).to.eq(snippetData.name);
        });
    });


})