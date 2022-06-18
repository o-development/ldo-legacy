import "cross-fetch/polyfill";
import { ProfileShapeFactory } from "./profileData";

async function run() {
  // Fetch profile
  const profileRes = await fetch("https://solidweb.me/jackson/profile/card");
  const profileTurtle = await profileRes.text();
  console.log(profileTurtle);
  const profile = await ProfileShapeFactory.parse(
    "https://solidweb.me/jackson/profile/card#me",
    profileTurtle,
    { baseIRI: "https://solidweb.me/jackson/profile/card" }
  );
  profile.fn = "Cool Dude";
  console.log(profile.$dataset().toString());
  console.log(await profile.$toSparqlUpdate());
}
run();
