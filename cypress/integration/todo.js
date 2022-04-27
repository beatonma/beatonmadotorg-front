import { SERVER } from "./index";

describe("Check no TODO markers left on any templates", () => {
    it("Main page", () => {
        const urls = [
            SERVER,
            `${SERVER}/search/?query=test`,
            `${SERVER}/tag/test/`,
            `${SERVER}/language/test/`,
        ];

        urls.forEach(url => {
            cy.visit(url);
            cy.contains("todo", { matchCase: false }).should("not.exist");
        });
    });
});
