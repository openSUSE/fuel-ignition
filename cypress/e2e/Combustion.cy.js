describe('General combustion script test', () => {
  beforeEach(() => {
    cy.visit('/edit')
  })

  it('creates combustion settings', () => {
    // load fixtures
    cy.get('input[type=file]').selectFile('cypress/fixtures/fuel-ignition.json')
    cy.get('[data-testid=download_combustion]').click()
    
    // checking generated combustion file
    cy.readFile('cypress/downloads/script').then((content) => {
      expect(content).to.have.string(
        '#!/bin/bash')
      expect(content).to.have.string(
        '# combustion: network')
      expect(content).to.have.string(
        'echo "Configured with combustion" > /etc/issue.d/combustion')
    });
  })
})