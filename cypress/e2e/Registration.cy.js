describe('Registering system', () => {
  beforeEach(() => {
    cy.visit('/edit')
  })

  it('creates combustion settings', () => {
    // load fixtures
    cy.get('input[type=file]').selectFile('cypress/fixtures/Registration.json')
    cy.get('[data-testid=download_combustion]').click()
    
    // checking generated combustion file
    cy.readFile('cypress/downloads/script').then((content) => {
      cy.log(content)
      expect(content).to.have.string(
        'if which SUSEConnect')
      expect(content).to.have.string(
        'SUSEConnect --product $product/$version/$architecture --email test@suse.com --url scc.suse.com --regcode $regcode')
    });
  })
})