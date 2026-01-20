describe('Change storage', () => {
  beforeEach(() => {
    cy.visit('/edit')
  })

  it('creates ignition settings', () => {
    // load fixtures
    cy.get('input[type=file]').selectFile('cypress/fixtures/ChangeStorage.json')
    cy.get('[data-testid=download_combustion]').click()
    
    // checking generated combustion file
    cy.readFile('cypress/downloads/script').then((content) => {
      cy.log(content)
      expect(content).to.have.string(
        '/etc/repart.d/11-swap.conf')
      expect(content).to.have.string(
        '[Partition]\nType=swap\nSizeMinBytes=1000M\nSizeMaxBytes=1000M\n')
      expect(content).to.have.string(
        '/etc/repart.d/12-partition.conf')
      expect(content).to.have.string(
        '[Partition]\nType=linux-generic\nLabel=ignition\nFormat=ext4\nSizeMinBytes=2000M\nSizeMaxBytes=3000M\nPriority=5')
      expect(content).to.have.string(
        '[Partition]\nType=root\n')
    });
  })
})