describe('Creating a file', () => {
  beforeEach(() => {
    cy.visit('/edit')
  })

  it('creates ignition settings', () => {
    // load fixtures
    cy.get('input[type=file]').selectFile('cypress/fixtures/CreateFile.json')
    cy.get('[data-testid=download_ignition]').click()
    
    // checking generated ignition file
    cy.readFile('cypress/downloads/config.ign').then((content) => {
      cy.log(content)
      const parsed = JSON.parse(content)
      expect(parsed.storage.files[0].path).to.equal('/tmp/tmp/added_file')
      expect(parsed.storage.files[0].mode).to.equal(420)
      expect(parsed.storage.files[0].overwrite).to.be.true      
      expect(parsed.storage.files[0].contents.source).to.be.a('string')
      expect(parsed.storage.files[0].user.name).to.equal('root')
      expect(parsed.storage.files[0].group.name).to.equal('root')
      expect(parsed.storage.files[1].user.id).to.equal(0)
      expect(parsed.storage.files[1].group.id).to.equal(0)
    });
  })
})
