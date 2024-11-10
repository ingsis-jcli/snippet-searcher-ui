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
        cy.loginToAuth0(AUTH0_USERNAME, AUTH0_PASSWORD); // Asegura que el token esté en localStorage

        cy.visit(FRONTEND_URL);
        const snippetData = {
            name: "Test name",
            content: "println(1);",
            language: "printscript",
            version: "1.1",
        };

        cy.intercept('GET', `${BACKEND_URL}/snippets*`, (req) => {
            req.reply((res) => {
                expect(res.statusCode).to.eq(200);
            });
        }).as('getSnippets');

        cy.window().then((win) => {
            const accessToken = win.localStorage.getItem("authAccessToken");

            cy.request({
                method: 'POST',
                url: `${BACKEND_URL}/api/snippets/snippet`,
                body: snippetData,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`, // Usa el token de localStorage
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.name).to.eq(snippetData.name);
                expect(response.body.content).to.eq(snippetData.content);
                expect(response.body.language).to.eq(snippetData.language);
                expect(response.body).to.haveOwnProperty("id");

                cy.get('.MuiBox-root > .MuiInputBase-root > .MuiInputBase-input').clear();
                cy.get('.MuiBox-root > .MuiInputBase-root > .MuiInputBase-input').type(`${snippetData.name}{enter}`);

                cy.wait("@getSnippets");
                cy.contains(snippetData.name).should('exist');
            });
        });
    });

})