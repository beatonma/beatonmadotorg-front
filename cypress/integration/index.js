export const SERVER = "localhost:8000";

describe("Index page", () => {
    it("Opens the main page", () => {
        cy.visit(SERVER);
        cy.contains("beatonma.org");
    });

    it("Navigates to next page of feed", () => {
        cy.visit(SERVER);
        cy.get("[title='Next page']").click();
        cy.url().should("include", "?page=2");
    });

    it("Search UI works", () => {
        cy.visit(SERVER);
        cy.get("#search_icon").click();
        cy.get("#search").type("test{enter}");
        cy.url().should("include", "/search/?query=test");
    });

    it("Displays github feed", () => {
        cy.visit(SERVER);
        cy.contains("github/beatonma");
    });
});
