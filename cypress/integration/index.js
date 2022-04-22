const server = "localhost:8000";

describe("Index page", () => {
    it("Opens the main page", () => {
        cy.visit(server);
        cy.contains("beatonma.org");
    });

    it("Navigates to next page of feed", () => {
        cy.visit(server);
        cy.get("[title='Next page']").click();
        cy.url().should("include", "?page=2");
    });

    it("Search UI works", () => {
        cy.visit(server);
        cy.get("#search_icon").click();
        cy.get("#search").type("test{enter}");
        cy.url().should("include", "/search/?query=test");
    });

    it("Displays github feed", () => {
        cy.visit(server);
        cy.contains("github/beatonma");
    });
});
