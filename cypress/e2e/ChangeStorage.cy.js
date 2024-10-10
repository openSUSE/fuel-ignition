describe('Change storage', () => {
  beforeEach(() => {
    cy.visit('/edit')
  })

  it('creates ignition settings', () => {
    // load fixtures
    cy.get('input[type=file]').selectFile('cypress/fixtures/ChangeStorage.json')
    cy.get('[data-testid=download_ignition]').click()
    
    // checking generated ignition file
    cy.readFile('cypress/downloads/config.ign').then((content) => {
      cy.log(content)
      const parsed = JSON.parse(content)
      
      expect(parsed.storage.files[0].path).to.equal('/etc/repart.d/10-root.conf')
      expect(parsed.storage.files[0].mode).to.equal(384)
      expect(parsed.storage.files[0].overwrite).to.be.true
      expect(parsed.storage.files[0].contents.source).to.be.a('string')
      expect(parsed.storage.files[0].contents.human_read).to.equal('[Partition]\nType=root\n')

      expect(parsed.storage.files[1].path).to.equal('/etc/repart.d/11-swap.conf')
      expect(parsed.storage.files[1].mode).to.equal(384)
      expect(parsed.storage.files[1].overwrite).to.be.true
      expect(parsed.storage.files[1].contents.source).to.be.a('string')
      expect(parsed.storage.files[1].contents.human_read).to.equal('[Partition]\nType=swap\nSizeMinBytes=1000M\nSizeMaxBytes=1000M\n')

      expect(parsed.storage.files[2].path).to.equal('/etc/repart.d/12-partition.conf')
      expect(parsed.storage.files[2].mode).to.equal(384)
      expect(parsed.storage.files[2].overwrite).to.be.true
      expect(parsed.storage.files[2].contents.source).to.be.a('string')
      expect(parsed.storage.files[2].contents.human_read).to.equal('[Partition]\nType=linux-generic\nLabel=ignition\nFormat=ext4\nSizeMinBytes=2000M\nSizeMaxBytes=3000M\nPriority=5')

    });
  })
})