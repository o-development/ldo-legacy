import { Dataset } from "@rdfjs/types";
import { ContextDefinition, JsonLdDocument } from "jsonld";
import { Writer, WriterOptions } from "n3";
// import SerializerJsonld from "@rdfjs/serializer-jsonld";
// import { Readable } from "readable-stream";

export async function datasetToString(
  dataset: Dataset,
  options: WriterOptions
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const writer = new Writer(options);
    for (const quad of dataset) {
      writer.addQuad(quad);
    }
    writer.end(async (error, parsedString: string) => {
      /* istanbul ignore if */
      if (error) {
        return reject(error);
      }
      return resolve(parsedString);
    });
  });
}

export async function datasetToJsonLd(
  _dataset: Dataset,
  _context: ContextDefinition
): Promise<JsonLdDocument> {
  throw new Error("Not Implemented");
  // return new Promise((resolve, reject) => {
  //   const serializerJsonld = new SerializerJsonld();
  //   const input = new Readable({
  //     objectMode: true,
  //     read: () => {
  //       dataset.forEach((quad) => {
  //         input.push(quad);
  //       });
  //       input.push(null);
  //     },
  //   });
  //   const output = serializerJsonld.import(input);

  //   output.on("data", (jsonld) => {
  //     resolve(jsonld);
  //   });
  //   /* istanbul ignore next */
  //   output.on("error", (err) => {
  //     /* istanbul ignore next */
  //     reject(err);
  //   });
  // });
}
