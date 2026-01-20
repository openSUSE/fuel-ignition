describe('Creating/Enabling/Mofifying services', () => {
  beforeEach(() => {
    cy.visit('/edit')
  })

  it('creates ignition settings', () => {
    // load fixtures
    cy.get('input[type=file]').selectFile('cypress/fixtures/Service.json')
    cy.get('[data-testid=download_combustion]').click()
    
    // checking generated combustion file
    cy.readFile('cypress/downloads/script').then((content) => {
      cy.log(content)
      expect(content).to.have.string(
        'echo \"testservice_unit_content\" > /etc/systemd/system/testservice\nsystemctl enable testservice')
      expect(content).to.have.string(
        'mkdir -p /etc/systemd/system/modified_service.d/\necho \"dropunit\" > /etc/systemd/system/modified_service.d/drop_file_name')
    });
  })
})