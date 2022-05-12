import { SERVER } from "./config";

describe("Index page displays correctly", () => {
    it("Opens the main page", () => {
        cy.visit(SERVER);
        cy.contains("beatonma.org");

        cy.get("#github_recent");
        cy.get("#notes");
    });

    it("Feed pagination works", () => {
        cy.visit(SERVER);
        cy.get("[title='Next page']").click();
        cy.url().should("include", "?page=2");

        // Github and notes should only be on the first page.
        cy.get("#github_recent").should("not.exist");
        cy.get("#notes").should("not.exist");
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
