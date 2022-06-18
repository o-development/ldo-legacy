import { Dataset } from "@rdfjs/types";
import { ContextDefinition, JsonLdDocument } from "jsonld";
import { Writer, WriterOptions } from "n3";
import { JsonLdSerializer } from "jsonld-streaming-serializer";

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
  dataset: Dataset,
  _context: ContextDefinition
): Promise<JsonLdDocument> {
  return new Promise((resolve, reject) => {
    // JsonLdSerializer's context is not compatible
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serializer = new JsonLdSerializer();
    let stringJson = "";
    serializer.on("data", (data) => (stringJson += data));
    serializer.on("error", reject);
    serializer.on("end", () => {
      resolve(JSON.parse(stringJson));
    });
    dataset.forEach((quad) => {
      serializer.write(quad);
    });
    serializer.end();
  });
}
