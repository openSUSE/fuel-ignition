describe('Setting Azure Entry ID', () => {
  beforeEach(() => {
    cy.visit('/edit')
  })

  it('creates combustion settings', () => {
    cy.get('[data-testid=toggle_ignition]').click()
    // load fixtures
    cy.get('input[type=file]').selectFile('cypress/fixtures/Azure.json')
    cy.get('[data-testid=download_combustion]').click()

    // checking generated combustion file
    cy.readFile('cypress/downloads/script').then((content) => {
      cy.log(content)
      expect(content).to.have.string(
        'domain = test.de')
      expect(content).to.have.string(
        'systemctl enable himmelblaud himmelblaud-tasks')
    });
  })
})