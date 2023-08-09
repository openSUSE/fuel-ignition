describe('Creating/Enabling/Mofifying services', () => {
  beforeEach(() => {
    cy.visit('/edit')
  })

  it('creates ignition settings', () => {
    // load fixtures
    cy.get('input[type=file]').selectFile('cypress/fixtures/Service.json')
    cy.get('[data-testid=download_ignition]').click()
    
    // checking generated ignition file
    cy.readFile('cypress/downloads/config.ign').then((content) => {
      cy.log(content)
      const parsed = JSON.parse(content)
      
      expect(parsed.systemd.units[0].name).to.equal('testservice')
      expect(parsed.systemd.units[0].enabled).to.be.true
      expect(parsed.systemd.units[0].contents).to.equal('testservice_unit_content')

      expect(parsed.systemd.units[1].name).to.equal('modified_service')
      expect(parsed.systemd.units[1].dropins[0].name).to.equal('drop_file_name')
      expect(parsed.systemd.units[1].dropins[0].contents).to.equal('dropunit')
    });
  })
})