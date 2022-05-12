import { SERVER } from "./config";

describe("Contact page is correct", () => {
    it("Renders correctly", () => {
        cy.visit(`${SERVER}/contact/`);
        cy.get("#contact_name").should("be.visible");
        cy.get("#contact_method").should("be.visible");
        cy.get("#contact_message").should("be.visible");

        cy.get("#contact_submit").should("not.be.visible");

        cy.get(".g-recaptcha iframe").then(iframe => {
            const body = iframe.contents().find("body");
            cy.wrap(body).find(".recaptcha-checkbox-border").click();
        });

        cy.get("#contact_submit").should("be.visible");
    });
});
