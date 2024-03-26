describe('Creating notwork devices', () => {
  beforeEach(() => {
    cy.visit('/edit')
  })

  it('creates ignition settings', () => {
    // load fixtures
    cy.get('input[type=file]').selectFile('cypress/fixtures/S390.json')
    cy.get('[data-testid=download_ignition]').click()    
    cy.get('[data-testid=download_combustion]').click()
    
    // checking generated ignition file
    cy.readFile('cypress/downloads/config.ign').then((content) => {
      cy.log(content)
      const parsed = JSON.parse(content)
      
      expect(parsed.storage.files[0].path).to.equal('/etc/NetworkManager/conf.d/noauto.conf')
      expect(parsed.storage.files[0].mode).to.equal(420)
      expect(parsed.storage.files[0].overwrite).to.be.true
      expect(parsed.storage.files[0].contents.source).to.be.a('string')
      expect(parsed.storage.files[0].contents.human_read).to.equal('[main]\n# Do not do automatic (DHCP/SLAAC) configuration on ethernet devices\n# with no other matching connections.\nno-auto-default=*\n')
    });

    // checking generated combustion file
    cy.readFile('cypress/downloads/script').then((content) => {
      cy.log(content)
      expect(content).to.have.string(
        'chzdev qeth 0.0.800,0.0.801,0.0.802 -e')
      expect(content).to.have.string(
        'if [ "${1-}" = "--prepare" ]; then')
      expect(content).to.have.string(
        'combustion: network prepare')
      expect(content).to.have.string(
        'umask 077')
      expect(content).to.have.string(
        'mkdir -p /etc/NetworkManager/system-connections/')
      expect(content).to.have.string(
        'cat >/etc/NetworkManager/system-connections/eth0.nmconnection <<-EOF')
      expect(content).to.have.string(
        'address1=10.144.136.50/24,10.144.136.254')	
    });

  })
})