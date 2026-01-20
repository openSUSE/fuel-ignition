describe('Creating notwork devices', () => {
  beforeEach(() => {
    cy.visit('/edit')
  })

  it('creates ignition settings', () => {
    // load fixtures
    cy.get('input[type=file]').selectFile('cypress/fixtures/AddNetwork.json')
    cy.get('[data-testid=download_combustion]').click()

    // checking generated combustion file
    cy.readFile('cypress/downloads/script').then((content) => {
      cy.log(content)
      expect(content).to.have.string(
        '\n[connection]\nid=eth0\ntype=ethernet\ninterface-name=eth0\n\n[ipv4]\ndns-search=\nmethod=manual\naddress1=192.1.1.1/32,192.2.2.2\ndns=testserver.suse.com\n\n[ipv6]\ndns-search=\naddr-gen-mode=eui64\nmethod=ignore\n')
      expect(content).to.have.string(
        '\n[connection]\nid=SSSID\ntype=wifi\ninterface-name=wlan0\n\n[ipv4]\ndns-search=\nmethod=disabled\n\n[ipv6]\ndns-search=\naddr-gen-mode=eui64\nmethod=auto\n\n[wifi]\nssid=SSSID\n\n[wifi-security]\nkey-mgmt=wpa-psk\npsk=linux\n')
    });
  })
})