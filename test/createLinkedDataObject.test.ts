import {
  createSubscribableDataset,
  TransactionalDataset,
} from "o-dataset-pack";
import { SolidProfileShape, ProfileShapeType } from "../example/profileData";
import { createLinkedDataObject } from "../lib/createLinkedDataObject";
import { LinkedDataObject } from "../lib/LinkedDataObject";
import df from "@rdfjs/data-model";
import { Quad } from "@rdfjs/types";

describe("createLinkedDataObject", () => {
  let profileLdo: LinkedDataObject<SolidProfileShape>;
  let dataset: TransactionalDataset<Quad>;
  beforeEach(() => {
    const subscribableDataset = createSubscribableDataset();
    dataset = subscribableDataset.startTransaction();
    profileLdo = createLinkedDataObject(
      dataset,
      df.namedNode("https://example.com/item"),
      ProfileShapeType
    );
  });

  it("clones the current linked data object", () => {
    const clonedObject = profileLdo.$clone();
    clonedObject.name = "Beeboo";
    expect(clonedObject.name).toBe("Beeboo");
    expect(clonedObject.$dataset().size).toBe(1);
    expect(profileLdo.$dataset().size).toBe(0);
  });

  it("returns the proper changes", () => {
    profileLdo.name = "Beeboo";
    const changes = profileLdo.$changes();
    expect(changes.added?.size).toBe(1);
    expect(changes.removed).toBe(undefined);
  });

  it("returns data through the proxy", () => {
    profileLdo.name = "Beeboo";
    expect(profileLdo.name).toBe("Beeboo");
  });

  it("provides the correct sparql update", async () => {
    const subscribableDataset = createSubscribableDataset();
    subscribableDataset.add(
      df.quad(
        df.namedNode("https://example.com/item"),
        df.namedNode("http://xmlns.com/foaf/0.1/name"),
        df.literal("Mr. Cool Dude")
      )
    );
    dataset = subscribableDataset.startTransaction();
    profileLdo = createLinkedDataObject(
      dataset,
      df.namedNode("https://example.com/item"),
      ProfileShapeType
    );
    profileLdo.name = "Captain of Coolness";
    expect(await profileLdo.$toSparqlUpdate()).toBe(
      `INSERT DATA { <https://example.com/item> <http://xmlns.com/foaf/0.1/name> "Captain of Coolness" .  }; DELETE DATA { <https://example.com/item> <http://xmlns.com/foaf/0.1/name> "Mr. Cool Dude" .  }`
    );
  });

  it("provides a sparql update when nothing has been changed", async () => {
    expect(await profileLdo.$toSparqlUpdate()).toBe("");
  });

  it("translates into turtle", async () => {
    profileLdo.name = "Captain of Coolness";
    expect(await profileLdo.$toTurtle()).toBe(
      '<https://example.com/item> <http://xmlns.com/foaf/0.1/name> "Captain of Coolness".\n'
    );
  });

  it("translates into n-triples", async () => {
    profileLdo.name = "Captain of Coolness";
    expect(await profileLdo.$toNTriples()).toBe(
      '<https://example.com/item> <http://xmlns.com/foaf/0.1/name> "Captain of Coolness" .\n'
    );
  });

  it("uses the serialize method", async () => {
    profileLdo.name = "Captain of Coolness";
    expect(await profileLdo.$serialize({ format: "Turtle" })).toBe(
      '<https://example.com/item> <http://xmlns.com/foaf/0.1/name> "Captain of Coolness".\n'
    );
  });

  it.skip("translates into jsonld", async () => {
    profileLdo.name = "Captain of Coolness";
    expect(await profileLdo.$toJsonLd()).toEqual([
      {
        "@id": "https://example.com/item",
        "http://xmlns.com/foaf/0.1/name": "Captain of Coolness",
      },
    ]);
  });

  describe("$isValid", () => {
    it("returns true if the data matches the ShEx shape", async () => {
      profileLdo.name = "Captain of Coolness";
      profileLdo.type = [{ "@id": "Person" }, { "@id": "Person2" }];
      profileLdo.inbox = { "@id": "https://coolInbox.com" };
      await expect(profileLdo.$isValid()).toBe(true);
    });
    it("returns false if the data doesn't match the ShEx shape", async () => {
      profileLdo.name = "Captain of Coolness";
      await expect(profileLdo.$isValid()).toBe(false);
    });
  });
});
