describe('General ignition script test', () => {
  beforeEach(() => {
    cy.visit('/edit')
  })

  it('creates ignition settings', () => {
    // load fixtures
    cy.get('input[type=file]').selectFile('cypress/fixtures/fuel-ignition.json')
    cy.get('[data-testid=download_ignition]').click()
    
    // checking generated ignition file
    cy.readFile('cypress/downloads/config.ign').then((content) => {
      const parsed = JSON.parse(content)
      expect(parsed.ignition.version).to.be.a('string')
    });
  })
})