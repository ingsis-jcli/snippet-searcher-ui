

export function loginViaAuth0Ui(username: string, password: string) {
  // App landing page redirects to Auth0.
  cy.visit('/')

  // Login on Auth0.
  cy.origin(
      "https://dev-441si1uvg8e57v45.us.auth0.com/",
      { args: { username, password } },
      ({ username, password }) => {
        cy.get('input#username').type(username)
        cy.get('input#password').type(password, { log: false })
        cy.contains('button[value=default]', 'Continue').click()
      }
  )

  // Ensure Auth0 has redirected us back to the RWA.
  cy.url().should('equal', 'https://snippetsearcherjcli.duckdns.org/')
}




