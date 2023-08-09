describe('Creating users', () => {
  beforeEach(() => {
    cy.visit('/edit')
  })

  it('creates ignition settings', () => {
    // load all fixtures
    cy.get('input[type=file]').selectFile('cypress/fixtures/AddUsers.json')
    cy.get('[data-testid=download_ignition]').click()
    
    // checking generated ignition file
    cy.readFile('cypress/downloads/config.ign').then((content) => {
      cy.log(content)
      const parsed = JSON.parse(content)
      expect(parsed.passwd.users[0].name).to.equal('schubi')
      expect(parsed.passwd.users[0].passwordHash).to.be.a('string')
      expect(parsed.passwd.users[0].sshAuthorizedKeys[0]).to.equal('ssh_pubilic_keys')      
      expect(parsed.storage.filesystems[0].device).to.equal('/dev/disk/by-label/ROOT')
      expect(parsed.storage.filesystems[0].format).to.equal('btrfs')
      expect(parsed.storage.filesystems[0].mountOptions[0]).to.equal('subvol=/@/home')
      expect(parsed.storage.filesystems[0].path).to.equal('/home')
      expect(parsed.storage.filesystems[0].wipeFilesystem).to.be.false
    });
  })
})