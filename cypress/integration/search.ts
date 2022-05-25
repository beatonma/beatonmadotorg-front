import { SERVER } from "./config";

function expectFeedItems(n: number) {
    cy.get("#feed").find(".h-entry").should("have.length", n);
}

describe("Search results are correct", () => {
    it("Search results are displayed", () => {
        cy.visit(`${SERVER}/search/?query=target`);
        cy.contains("Target article");
        cy.contains("Target blog");
        cy.contains("Target app");
        expectFeedItems(3);
    });

    it("Search result links are correct", () => {
        cy.visit(`${SERVER}/search/?query=target`);
        cy.contains("Target article").click();
        cy.url().should("include", "/a/220516-target-article/");
    });

    it("Language results are displayed", () => {
        cy.visit(`${SERVER}/language/TargetLang/`);
        cy.title().should("contain", "TargetLang");
        cy.contains("Target app");
        expectFeedItems(1);
    });

    it("Tag results are displayed", () => {
        cy.visit(`${SERVER}/tag/target-tag/`);
        cy.title().should("contain", "#target-tag");
        cy.contains("Target app");
        expectFeedItems(1);
    });
});
