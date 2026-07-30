import { describe, expect, it } from "vitest";
import { restructureToASLGrammar } from "./aslGrammar";

describe("restructureToASLGrammar", () => {
  it("rewrites subject + verb into ASL order", () => {
    expect(restructureToASLGrammar("I am going to class")).toBe("ME GO CLASS");
  });

  it("drops articles, copulas and prepositions", () => {
    expect(restructureToASLGrammar("the cat is on the table")).toBe("CAT TABLE");
  });

  it("keeps multi-word phrases that have a single sign", () => {
    expect(restructureToASLGrammar("how are you")).toBe("HOW YOU");
  });

  it("strips punctuation", () => {
    expect(restructureToASLGrammar("Thank you!")).toBe("THANK YOU");
  });

  it("returns an empty string for blank input", () => {
    expect(restructureToASLGrammar("")).toBe("");
    expect(restructureToASLGrammar("   ")).toBe("");
  });

  it("returns an empty string when every word is filler", () => {
    expect(restructureToASLGrammar("the a an of")).toBe("");
  });
});
