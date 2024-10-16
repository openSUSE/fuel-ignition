describe('Disk Encryption', () => {
  beforeEach(() => {
    cy.visit('/edit')
  })

  it('creates combustion settings', () => {
    // load fixtures
    cy.get('input[type=file]').selectFile('cypress/fixtures/Encryption.json')
    cy.get('[data-testid=download_combustion]').click()
    
    // checking generated combustion file
    cy.readFile('cypress/downloads/script').then((content) => {
      cy.log(content)
      expect(content).to.have.string(
        'mkdir -p /run/credstore')
      expect(content).to.have.string(
        'echo "force" > /run/credstore/disk-encryption-tool-dracut.encrypt')
      expect(content).to.have.string(
        'systemd-machine-id-setup')
      expect(content).to.have.string(
        'mount /var')
      expect(content).to.have.string(
        'mkdir -p /etc/credstore.encrypted')
      expect(content).to.have.string(
        'credential="$(mktemp disk-encryption-tool.XXXXXXXXXX)"')
      expect(content).to.have.string(
        'echo "linux" > "$credential"')
      expect(content).to.have.string(
        'systemd-creds encrypt --name=disk-encryption-tool-enroll.pw "$credential"')
      expect(content).to.have.string(
        'echo "1" > "$credential"')
      expect(content).to.have.string(
        'systemd-creds encrypt --name=disk-encryption-tool-enroll.tpm2')
      expect(content).to.have.string(
        'shred -u "$credential"')
      expect(content).to.have.string(
        'umount /var')
    });
  })
})