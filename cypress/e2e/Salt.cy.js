describe('Connecting to Salt Master', () => {
  beforeEach(() => {
    cy.visit('/edit')
  })

  it('creates combustion settings', () => {
    // load fixtures
    cy.get('input[type=file]').selectFile('cypress/fixtures/Salt.json')
    cy.get('[data-testid=download_combustion]').click()
    
    // checking generated combustion file
    cy.readFile('cypress/downloads/script').then((content) => {
      cy.log(content)
      expect(content).to.have.string(
        'zypper --non-interactive install salt-minion')
      expect(content).to.have.string(
        'echo "master: salter_master_name" \\\n >/etc/salt/minion.d/fuel-ignition.conf')
      expect(content).to.have.string(
        'echo "minion_pem_key" \\\n >/etc/salt/pki/minion/minion.pem')
      expect(content).to.have.string(
        'echo "minion_pub_key" \\\n >/etc/salt/pki/minion/minion.pub')
      expect(content).to.have.string(	
	'systemctl enable salt-minion.service')
    });
  })
})