import { ProfileShapeType, SolidProfileShape } from "../example/profileData";
import { LdoFactory } from "../lib";
import df from "@rdfjs/data-model";
import { sampleJsonld, sampleTurtle } from "./sampleData";
import { createDataset } from "o-dataset-pack";

describe("LdoFactory", () => {
  let profileFactory: LdoFactory<SolidProfileShape>;
  beforeEach(() => {
    profileFactory = new LdoFactory(ProfileShapeType);
  });

  it("Creates a blank profile", async () => {
    const profile = profileFactory.new("https://example.com/person1#me");
    profile.fn = "Diplo";
    expect(await profile.$toTurtle()).toBe(
      '<https://example.com/person1#me> <http://www.w3.org/2006/vcard/ns#fn> "Diplo".\n'
    );
  });

  it("Creates a blank profile with a blank node if the id is not provided", () => {
    const profile = profileFactory.new();
    profile.fn = "Diplo";
    expect(profile["@id"]).toBe(undefined);
  });

  it("initializes a profile using the fromJson method", () => {
    const profile = profileFactory.fromJson({
      type: ["Person", "Person2"],
      inbox: "https://inbox.com",
      fn: "Diplo",
    });
    expect(profile.inbox).toBe("https://inbox.com");
    expect(profile.fn).toBe("Diplo");
    expect(profile["@id"]).toBe(undefined);
  });

  it("initializes a profile with an id using the fromJson method", () => {
    const profile = profileFactory.fromJson({
      "@id": "https://example.com/person1",
      type: ["Person", "Person2"],
      inbox: "https://inbox.com",
      fn: "Diplo",
    });
    expect(profile.inbox).toBe("https://inbox.com");
    expect(profile.fn).toBe("Diplo");
    expect(profile["@id"]).toBe("https://example.com/person1");
  });

  it("parses turtle", async () => {
    const profile = await profileFactory.parse(
      df.namedNode("https://solidweb.org/jackson/profile/card#me"),
      sampleTurtle,
      { baseIRI: "https://solidweb.org/jackson/profile/card" }
    );
    expect(profile.fn).toBe("Jackson Morgan");
  });

  it("parses turtle with a string id", async () => {
    const profile = await profileFactory.parse(
      "https://solidweb.org/jackson/profile/card#me",
      sampleTurtle,
      { baseIRI: "https://solidweb.org/jackson/profile/card" }
    );
    expect(profile.fn).toBe("Jackson Morgan");
  });

  it("uses an existing dataset as the basis for the ldo", async () => {
    const dataset = createDataset();
    dataset.add(
      df.quad(
        df.namedNode("https://example.com/person1"),
        df.namedNode("http://xmlns.com/foaf/0.1/name"),
        df.literal("Captain cool")
      )
    );
    const profile = await profileFactory.parse(
      "https://example.com/person1",
      dataset
    );
    expect(profile.name).toBe("Captain cool");
  });

  it.skip("parses JsonLD", async () => {
    const profile = await profileFactory.parse(
      "https://example.com/item",
      sampleJsonld
    );
    expect(profile.name).toBe("Captain of Coolness");
  });
});
