import { expect } from "chai";
import { Library } from "../src";

describe('Can use Library class', ()=> {
    const library = new Library();
    it('can say hello', function () {
        library.sayHello();
    })
    it('can do simple addition', function () {
        expect(library.add(1, 2)).equal(3);
    })
})