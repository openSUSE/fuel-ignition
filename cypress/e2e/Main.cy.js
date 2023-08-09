describe('showing fuel-ignition', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('goes to page -Create New Config-', () => {
    cy.contains('Create New Config').click()
    cy.contains('Ignition Config Generator')
  })

  it('goes to page -JSON to Ignition IMG-', () => {
    cy.contains('JSON to Ignition IMG').click()
    cy.contains('JSON That Will Be Converted')
  })  
})