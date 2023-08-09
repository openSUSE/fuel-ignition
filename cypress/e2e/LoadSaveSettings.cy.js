describe('Read-Save Settings', () => {
  beforeEach(() => {
    cy.visit('/edit')
    cy.contains('Ignition Config Generator')
  })

  it('loads settings from fixtures', () => {
    cy.get('input[type=file]').selectFile('cypress/fixtures/fuel-ignition.json')
  })

  it('saves settings to a file and compares it with the fixtures', () => {
    cy.get('input[type=file]').selectFile('cypress/fixtures/fuel-ignition.json')
    // saving to download folder
    cy.contains(' Save ').click()
    // comparing saved settings with the imported fixtures
    cy.readFile('cypress/fixtures/fuel-ignition.json')
      .then(created => cy.readFile('cypress/downloads/fuel-ignition.json').should('deep.equal', created))
  })
})