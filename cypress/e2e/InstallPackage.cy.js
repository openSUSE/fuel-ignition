describe('Installing packages', () => {
  beforeEach(() => {
    cy.visit('/edit')
  })

  it('creates combustion settings', () => {
    // load fixtures
    cy.get('input[type=file]').selectFile('cypress/fixtures/InstallPackage.json')
    cy.get('[data-testid=download_combustion]').click()
    
    // checking generated combustion file
    cy.readFile('cypress/downloads/script').then((content) => {
      cy.log(content)
      expect(content).to.have.string(
        'zypper --non-interactive install testpackage1')
      expect(content).to.have.string(
        'zypper --non-interactive install testpackage2')
    });
  })
})