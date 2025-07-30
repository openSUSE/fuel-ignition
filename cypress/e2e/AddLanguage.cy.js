describe('Setting language', () => {
  beforeEach(() => {
    cy.visit('/edit')
  })

  it('creates ignition settings', () => {
    // load fixtures
    cy.get('input[type=file]').selectFile('cypress/fixtures/AddLanguage.json')
    cy.get('[data-testid=download_ignition]').click()

    // checking generated ignition file
    cy.readFile('cypress/downloads/config.ign').then((content) => { 
      const parsed = JSON.parse(content)
      cy.log(JSON.stringify(parsed.storage.files[0]))
      expect(parsed.storage.files[0]).to.have.all.keys('path', 'mode', 'overwrite', 'contents')
      expect(parsed.storage.files[0].path).to.equal('/etc/locale.conf')
      expect(parsed.storage.files[0].mode).to.equal(420)
      expect(parsed.storage.files[0].overwrite).to.equal(true)
      expect(parsed.storage.files[0].contents.human_read).to.equal('LANG=ast_ES@euro\n')
    });
  })
})