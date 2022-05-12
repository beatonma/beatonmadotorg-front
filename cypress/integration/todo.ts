import { SERVER } from "./config";

describe("Check no TODO markers left on any templates", () => {
    it("Main page", () => {
        const urls = [
            SERVER,
            `${SERVER}/search/?query=target`,
            `${SERVER}/tag/target-tag/`,
            `${SERVER}/language/TargetLang/`,
            `${SERVER}/app/target.app/`,
            `${SERVER}/blog/220516-target-blog/`,
            `${SERVER}/a/220516-target-article/`,
        ];

        urls.forEach(url => {
            cy.visit(url);
            cy.contains("todo", { matchCase: false }).should("not.exist");
        });
    });
});
