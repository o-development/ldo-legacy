# LDO (Linked Data Objects)

LDO (Linked Data Objects) is a library that lets you easily manipulate RDF as if it were a standard TypeScript object that follows a [ShEx](https://shex.io) shape you define.

For a full tutorial of using LDO to build React Solid applications, see [this tutorial](https://medium.com/@JacksonMorgan/building-solid-apps-with-ldo-6127a5a1979c).

## Setup

### Automatic Setup
To setup LDO, `cd` into your typescript project and run `npx ldo-cli init`.

```bash
cd my-typescript-project
npx ldo-cli init
```

### Manual Setup
Install the LDO dependencies.
```bash
npm install ldo
npm install ldo-cli --save-dev
```

Create a folder to store your ShEx shapes:
```bash
mkdir shapes
```

Create a script to build ShEx shapes and convert them into Linked Data Objects. You can put this script in `package.json`
```json
{
  ...
  scripts: {
    ...
    "build:ldo": "ldo build --input ./shapes --output ./ldo"
    ...
  }
  ...
}
```

## Creating ShEx Schemas
LDO uses [ShEx](https://shex.io) as a schema for the RDF data in your project. To add a ShEx schema to your project, simply create a file ending in `.shex` to the `shapes` folder.

For more information on writing ShEx schemas see the [ShEx Primer](http://shex.io/shex-primer/index.html).


`./shapes/foafProfile.shex`:
```shex
PREFIX ex: <https://example.com/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

ex:FoafProfile EXTRA a {
  a [ foaf:Person ]
    // rdfs:comment  "Defines the node as a Person (from foaf)" ;
  foaf:name xsd:string ?
    // rdfs:comment  "Define a person's name." ;
  foaf:img xsd:string ?
    // rdfs:comment  "Photo link but in string form" ;
  foaf:knows @ex:FoafProfile *
    // rdfs:comment  "A list of WebIds for all the people this user knows." ;
}
```

To build the shape, run:
```bash
npm run build:ldo
```

This will generate five files:
 - `./ldo/foafProfile.ldoFactory.ts`
 - `./ldo/foafProfile.typings.ts`
 - `./ldo/foafProfile.schema.ts`
 - `./ldo/foafProfile.context.ts`
 - `./ldo/foafProfile.shapeTypes.ts`

## Making a Linked Data Object and Converting from RDF
The 'LdoFactory' is responsible for creating Linked Data Objects. To use it, just import it from the generated file.

```typescript
import { FoafProfileFactory } from "./ldo/foafProfile.ldoFactory.ts";
```

### Create a new empty Linked Data Object
```typescript
import { LinkedDataObject } from "ldo";
import { FoafProfileFactory } from "./ldo/foafProfile.ldoFactory.ts";
import { FoafProfile } from "./ldo/foafProfile.typings";

const emptyProfile: LinkedDataObject<FoafProfile>  =
  FoafProfileFactory.new("https://example.com/profile1");
```

`new` takes one optional parameter: `id`. This the url of the Linked Data Object's `subject`. If left blank, the `subject` will be a blank node.

### Create a new Linked Data Object from JSON
```typescript
import { LinkedDataObject } from "ldo";
import { FoafProfileFactory } from "./ldo/foafProfile.ldoFactory.ts";
import { FoafProfile } from "./ldo/foafProfile.typings";

const profileJson: FoafProfile = {
  "@id": "https://example.com/aangProfile",
  type: "Person",
  name: "Aang",
  knows: [
    {
      "@id": "https://example.com/kataraProfile",
      type: "Person",
      name: "Katara",
    }
  ]
}
const profile: LinkedDataObject<FoafProfile> =
  FoafProfileFactory.fromJson(profileJson);
```

The above code converts a simple JSON object into a Linked Data Object.

### Creating a Linked Data Object from RDF
```typescript
import { LinkedDataObject } from "ldo";
import { FoafProfileFactory } from "./ldo/foafProfile.ldoFactory.ts";
import { FoafProfile } from "./ldo/foafProfile.typings";

async function start() {
  const rawTurtle: string = `
  @prefix foaf: <http://xmlns.com/foaf/0.1/>.
  @prefix ex: <https://example.com/>.

  ex:aang
    a foaf:Person
    foaf:name "Aang";
    foaf:knows ex:katara.

  ex:katara
    a foaf:Person;
    foaf:name "Katara";
    foaf:knows ex:Aang;
  `;

  const profile: LinkedDataObject<FoafProfile> = await FoafProfileFactory.parse(
    "https://example.com/aang",
    rawTurtle,
    { format: "Turtle", baseIRI: "https://example.com/" }
  );
}
```

The `parse` method takes in three parameters.

 - `id`: The url for the Linked Data Object's `subject`. This field accepts a `string`, a `namedNode` from [`@rdfjs/data-model`](https://www.npmjs.com/package/@rdfjs/data-model), or a `blankNode` from [`@rdfjs/data-model`](https://www.npmjs.com/package/@rdfjs/data-model).
 - `data`: The raw data to parse as a `string`.
 - `options` (optional): Parse options containing the following keys:
    - `format` (optional): The format the data is in. The following are acceptable formats: `Turtle`, `TriG`, `N-Triples`, `N-Quads`, `N3`, `Notation3`.
    - `baseIRI` (optional): If this data is hosted at a specific location, you can provide the baseIRI of that location.
    - `blankNodePrefix` (optional): If blank nodes should have a prefix, that should be provided here.
    - `factory` (optional): a RDF Data Factory from  [`@rdfjs/data-model`](https://www.npmjs.com/package/@rdfjs/data-model). 

### Creating a Linked Data Object from an RDF.js Dataset
```typescript
import { LinkedDataObject } from "ldo";
import { FoafProfileFactory } from "./ldo/foafProfile.ldoFactory.ts";
import { FoafProfile } from "./ldo/foafProfile.typings";
import { Dataset } from "@rdfjs/types";

aysnc function start() {
  const dataset: Dataset = // initialize dataset
  const profile: LinkedDataObject<FoafProfile> = await FoafProfileFactory.parse(
    "https://example.com/aang",
    dataset
  );
}
```
You can also import an RDFJS dataset in the `parse` method.

## Getting and Setting Data on a Linked Data Object
Once you've created a Linked Data Object, you can get and set data as if it were a normal TypeScript Object. For specific details, see the documentation at [JSONLD Dataset Proxy](https://github.com/o-development/jsonld-dataset-proxy/blob/master/Readme.md).

```typescript
import { LinkedDataObject } from "ldo";
import { FoafProfileFactory } from "./ldo/foafProfile.ldoFactory.ts";
import { FoafProfile } from "./ldo/foafProfile.typings";

aysnc function start() {
  const profile: LinkedDataObject<FoafProfile> = // Create LDO
  // Logs "Aang"
  console.log(profile.name);
  // Logs "Person"
  console.log(profile.type);
  // Logs 1
  console.log(profile.knows?.length);
  // Logs "Katara"
  console.log(profile.knows?.[0].name);
  profile.name = "Bonzu Pippinpaddleopsicopolis III"
  // Logs "Bonzu Pippinpaddleopsicopolis III"
  console.log(profile.name);
  profile.knows?.push({
    type: "Person",
    name: "Sokka"
  });
  // Logs 2
  console.log(profile.knows?.length);
  // Logs "Katara" and "Sokka"
  profile.knows?.forEach((person) => console.log(person.name));
}
```

## Converting a Linked Data Object back to RDF
A linked data object can be converted into RDF in multiple ways

### `$toTurtle()`
```typescript
const rawTurtle: string = await profile.$toTurtle();
```

### `$toNTiples()`
```typescript
const rawNTriples: string = await profile.$toNTriples();
```

### `$toSparqlUpdate()`
```typescript
const sparqlUpdate: string = await profile.$toSparqlUpdate();
```
Sometimes you may want to know how a document should be updated based on the modifications made to it. LDO keeps track of all the changes that have been since the object was created. You can call `$toSparqlUpdate()` to get the updates in the Sparql Update format. This is particularly useful for Solid applications.

### `$serialize(options)`
```typescript
const sparqlUpdate: string = await profile.$serialize({
  format: "Turtle",
  prefixes: {
    ex: "https://example.com/",
    foaf: "http://xmlns.com/foaf/0.1/",
  }
});
```
`$serialize(options)` provides general serialization based on provided options:
 - `foramt` (optional): The format to serialize to. The following are acceptable formats: `Turtle`, `TriG`, `N-Triples`, `N-Quads`, `N3`, `Notation3`.
 - `prefixes`: The prefixes for those serializations that use prefixes.

## Other LDO Methods

### `$dataset()`
Returns the Linked Data Object's underlying RDFJS dataset. Modifying this dataset will change the Linked Data Object as well.
```typescript
import { Dataset } from "@rdfjs/types";
const dataset: Dataset = profile.$dataset();
```

### `$changes()`
Shows the RDF changes that have happened to the Linked Data Object since it was created.
```typescript
profile.name = "Kuzon"
// Logs: <https://example.com/aang> <http://xmlns.com/foaf/0.1/name> "Kuzon"
console.log(profile.$changes().added?.toString());
// Logs: <https://example.com/aang> <http://xmlns.com/foaf/0.1/name> "Aang"
console.log(profile.$changes().removed?.toString());
```

 Note that `added` and `removed` are optional.

### `$clone()`
Clones the current Linked Data Object and resets its changes.
```typescript
import { LinkedDataObject } from "ldo";
import { FoafProfile } from "./ldo/foafProfile.typings";
const clonedProfile: LinkedDataObject<FoafProfile> = profile.$clone();
// Logs {} because no changes have been made
console.log(profile.$changes());
```

## Liscense
MIT
