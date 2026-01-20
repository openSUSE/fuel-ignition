describe('showing fuel-ignition', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('goes to page -Create New Config-', () => {
    cy.contains('Create New Config').click()
    cy.contains('Config Generator')
  })

})