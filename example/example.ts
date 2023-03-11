import "cross-fetch/polyfill";
import {
  commitTransaction,
  getDataset,
  parseRdf,
  startTransaction,
  toNTriples,
  toSparqlUpdate,
} from "../lib";
import { ProfileShapeType } from "./profileData";

async function run() {
  // Fetch profile
  const profileRes = await fetch("https://solidweb.me/jackson/profile/card");
  const rawTurtle = await profileRes.text();
  // const dataset = await parseRdf(rawTurtle, {
  //   baseIRI: "https://solidweb.me/jackson/profile/card",
  // });

  const ldoDataset = await parseRdf(rawTurtle, {
    baseIRI: "https://solidweb.me/jackson/profile/card",
  });

  const profile = ldoDataset
    .getType(ProfileShapeType)
    .fromSubject("https://solidweb.me/jackson/profile/card#me");

  startTransaction(profile);
  profile.fn = "Cool Dude";

  console.log(getDataset(profile).toString());
  console.log(await toSparqlUpdate(profile));
  commitTransaction(profile);
  console.log(await toNTriples(profile));
}
run();
