import { SERVER } from "./config";

describe("About page displays correctly", () => {
    const url = `${SERVER}/about/`;
    it("Renders correctly", () => {
        cy.visit(url);
        cy.contains("beatonma.org");
        cy.contains("About content");
        cy.title().should("contain", "About");
    });

    it("Displays hcard", () => {
        cy.visit(url);
        cy.get(".h-card").should("be.visible");
        cy.contains("Michael Beaton");
    });
});
