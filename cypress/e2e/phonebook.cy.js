describe('Phonebook App', () => {
  beforeEach(() => {
    // Stub the initial GET request to load some mock contacts
    cy.intercept('GET', '/api/persons', {
      statusCode: 200,
      body: [
        { id: '1', name: 'Arto Hellas', number: '040-123456' },
        { id: '2', name: 'Ada Lovelace', number: '39-44-5323523' }
      ]
    }).as('getPersons')

    cy.visit('/')
    cy.wait('@getPersons')
  })

  it('renders the initial page and displays existing contacts', () => {
    cy.contains('h2', 'Phonebook')
    cy.contains('h2', 'Numbers').should('be.visible')

    // Check that both stubbed contacts are displayed
    cy.contains('Arto Hellas 040-123456')
    cy.contains('Ada Lovelace 39-44-5323523')
  })

  it('can add a new contact to the phonebook', () => {
    const newContact = { id: '3', name: 'Dan Abramov', number: '12-43-234345' }

    // Intercept POST request for creating a contact
    cy.intercept('POST', '/api/persons', {
      statusCode: 201,
      body: newContact
    }).as('addContact')

    // Find the Form inputs and type the new contact details
    cy.get('form').within(() => {
      // First input is the name, second input is the number
      cy.get('input').eq(0).type(newContact.name)
      cy.get('input').eq(1).type(newContact.number)
      cy.get('button[type="submit"]').click()
    })

    // Wait for the POST request to complete
    cy.wait('@addContact')

    // Verify the new contact is shown on the page
    cy.contains(`${newContact.name} ${newContact.number}`).should('be.visible')

    // Verify the success notification is shown
    cy.get('.notification-box.good')
      .should('be.visible')
      .and('contain', `Added ${newContact.name}`)
  })

  it('can filter the contacts displayed on the page', () => {
    // There are initially Arto Hellas and Ada Lovelace
    // Type 'Ada' in the filter input
    cy.get('input').first().type('Ada')

    // Ada Lovelace should remain visible
    cy.contains('Ada Lovelace 39-44-5323523').should('be.visible')

    // Arto Hellas should be filtered out (not exist/not visible)
    cy.contains('Arto Hellas 040-123456').should('not.exist')
  })

  it('can delete a contact from the phonebook after confirmation', () => {
    // Intercept DELETE request for contact with ID '1' (Arto Hellas)
    cy.intercept('DELETE', '/api/persons/1', {
      statusCode: 204
    }).as('deleteContact')

    // Stub window.confirm to return true (approve deletion)
    cy.on('window:confirm', (str) => {
      expect(str).to.equal('Delete Arto Hellas?')
      return true
    })

    // Click the delete button next to Arto Hellas
    cy.contains('Arto Hellas 040-123456')
      .parent()
      .contains('button', 'delete')
      .click()

    // Wait for the DELETE request to complete
    cy.wait('@deleteContact')

    // Verify Arto Hellas is removed from the page
    cy.contains('Arto Hellas 040-123456').should('not.exist')

    // Ada Lovelace should still be visible
    cy.contains('Ada Lovelace 39-44-5323523').should('be.visible')
  })
})
