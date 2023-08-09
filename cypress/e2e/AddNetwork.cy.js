describe('Creating notwork devices', () => {
  beforeEach(() => {
    cy.visit('/edit')
  })

  it('creates ignition settings', () => {
    // load all fixtures
    cy.get('input[type=file]').selectFile('cypress/fixtures/AddNetwork.json')
    cy.get('[data-testid=download_ignition]').click()
    
    // checking generated ignition file
    cy.readFile('cypress/downloads/config.ign').then((content) => {
      cy.log(content)
      const parsed = JSON.parse(content)
      
      expect(parsed.storage.files[0].path).to.equal('/etc/NetworkManager/system-connections/eth0.nmconnection')
      expect(parsed.storage.files[0].mode).to.equal(384)
      expect(parsed.storage.files[0].overwrite).to.be.true
      expect(parsed.storage.files[0].contents.source).to.be.a('string')
      expect(parsed.storage.files[0].contents.human_read).to.equal('\n[connection]\nid=eth0\ntype=ethernet\ninterface-name=eth0\n\n[ipv4]\ndns-search=\nmethod=manual\naddress1=192.1.1.1/32,192.2.2.2\ndns=testserver.suse.com\n\n[ipv6]\ndns-search=\naddr-gen-mode=eui64\nmethod=ignore\n')

      expect(parsed.storage.files[1].path).to.equal('/etc/NetworkManager/conf.d/noauto.conf')
      expect(parsed.storage.files[1].mode).to.equal(420)
      expect(parsed.storage.files[1].overwrite).to.be.true
      expect(parsed.storage.files[1].contents.source).to.be.a('string')
      expect(parsed.storage.files[1].contents.human_read).to.equal('[main]\n# Do not do automatic (DHCP/SLAAC) configuration on ethernet devices\n# with no other matching connections.\nno-auto-default=*\n')

      expect(parsed.storage.files[2].path).to.equal('/etc/NetworkManager/system-connections/SSSID.nmconnection')
      expect(parsed.storage.files[2].mode).to.equal(384)
      expect(parsed.storage.files[2].overwrite).to.be.true
      expect(parsed.storage.files[2].contents.source).to.be.a('string')
      expect(parsed.storage.files[2].contents.human_read).to.equal('\n[connection]\nid=SSSID\ntype=wifi\ninterface-name=wlan0\n\n[ipv4]\ndns-search=\nmethod=disabled\n\n[ipv6]\ndns-search=\naddr-gen-mode=eui64\nmethod=auto\n\n[wifi]\nssid=SSSID\n\n[wifi-security]\nkey-mgmt=wpa-psk\npsk=linux\n')

    });
  })
})