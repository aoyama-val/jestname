const fs = require("fs");

const x = 123;

describe("des1", () => {
    beforeAll(() => {
        // ...
    });

    afterAll(() => {
        // ...
    });

    it("it1", () => {
        expect(1 + 1).toEqual(2);
    });

    it("it2", () => {
        expect(1 + 1).toEqual(2);
    });

    describe("des2", () => {
        it("it2_1", () => {
            expect(1 + 1).toEqual(2);
        });

        it("it2_2", () => {
            expect(1 + 1).toEqual(2);
        });
    });
});
