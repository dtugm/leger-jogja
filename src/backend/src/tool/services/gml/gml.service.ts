import { Injectable } from '@nestjs/common';
import { AddAttributeToGML, normalizeCityGML } from 'src/tool/interfaces/gml-tool.interface';
import * as fs from 'fs';

import * as readline from 'readline';

@Injectable()
export class GmlService {

  async addAttributeToGml(args: AddAttributeToGML): Promise<string> {
    const outputPath = args.filepath.replace('.gml', '_updated.gml');

    // Create streams
    const readStream = fs.createReadStream(args.filepath, { encoding: 'utf8' });
    const writeStream = fs.createWriteStream(outputPath, { encoding: 'utf8' });

    const rl = readline.createInterface({
      input: readStream,
      crlfDelay: Infinity, // Recognizes all instances of CR LF ('\r\n') as a single line break.
    });

    // Build the XML strings we want to inject
    let injectedXml = '';
    if (args.validFrom) {
      injectedXml += `\n      <core:validFrom>${new Date(args.validFrom).toISOString()}</core:validFrom>`;
    }
    if (args.validTo) {
      injectedXml += `\n      <core:validTo>${new Date(args.validTo).toISOString()}</core:validTo>`;
    }

    injectedXml += `
      <gen:stringAttribute name="asset_id">
        <gen:value>${args.assetId}</gen:value>
      </gen:stringAttribute>
      <gen:stringAttribute name="source_file_id">
        <gen:value>${args.sourceFileId}</gen:value>
      </gen:stringAttribute>`;

    return new Promise((resolve, reject) => {
      rl.on('line', (line) => {
        const closingTagRegex = /(<\/(?:bldg:Building|gen:GenericCityObject|Building|GenericCityObject)>)/;

        if (closingTagRegex.test(line)) {
          const modifiedLine = line.replace(closingTagRegex, `${injectedXml}    $1`);
          writeStream.write(modifiedLine + '\n');
        } else {
          writeStream.write(line + '\n');
        }
      });

      rl.on('close', () => {
        writeStream.end();
      });

      writeStream.on('finish', () => {
        resolve(outputPath);
      });

      writeStream.on('error', (err) => {
        reject(err);
      });

      readStream.on('error', (err) => {
        reject(err);
      });
    });
  }

  normalizeCityGml(args: normalizeCityGML) {
    try {
      let xml = fs.readFileSync(args.filepath, 'utf8');

      // Regex for finding all Envelope for calculating global extent
      const envelopeRegex = /<gml:lowerCorner>([^<]+)<\/gml:lowerCorner>\s*<gml:upperCorner>([^<]+)<\/gml:upperCorner>/g;

      let envelopes: { lower: number[], upper: number[] }[] = [];
      let match;

      while ((match = envelopeRegex.exec(xml)) !== null) {
        const lower = match[1].trim().split(/\s+/).map(Number);
        const upper = match[2].trim().split(/\s+/).map(Number);
        if (lower.length >= 3 && upper.length >= 3) {
          envelopes.push({ lower, upper });
        }
      }

      if (envelopes.length === 0) throw new Error("Tidak ditemukan elemen gml:Envelope.");

      // Calculate Min/Max Global
      let minX = envelopes[0].lower[0], minY = envelopes[0].lower[1], minZ = envelopes[0].lower[2];
      let maxX = envelopes[0].upper[0], maxY = envelopes[0].upper[1], maxZ = envelopes[0].upper[2];

      for (const env of envelopes) {
        minX = Math.min(minX, env.lower[0]);
        minY = Math.min(minY, env.lower[1]);
        minZ = Math.min(minZ, env.lower[2]);
        maxX = Math.max(maxX, env.upper[0]);
        maxY = Math.max(maxY, env.upper[1]);
        maxZ = Math.max(maxZ, env.upper[2]);
      }

      // Converting int value into float
      const f = (n: number) => Number.isInteger(n) ? `${n}.0` : `${n}`;
      const lowerCorner = `${f(minX)} ${f(minY)} ${f(minZ)}`;
      const upperCorner = `${f(maxX)} ${f(maxY)} ${f(maxZ)}`;

      // Find Root Element CityModel
      // Regex for finding <CityModel ... > or <core:CityModel ... > tag
      const rootRegex = /<(?:core:)?CityModel\b([^>]*)>/;
      const rootMatch = xml.match(rootRegex);

      if (!rootMatch) throw new Error("Root element CityModel tidak ditemukan.");

      const fullRootTag = rootMatch[0];
      const rootAttributes = rootMatch[1];

      // populate new element for global extent
      const newHeader = `
    <gml:name>${args.datasetName}</gml:name>
    <gml:boundedBy>
      <gml:Envelope srsName="http://www.opengis.net/def/crs/EPSG/0/32748" srsDimension="3">
        <gml:lowerCorner>${lowerCorner}</gml:lowerCorner>
        <gml:upperCorner>${upperCorner}</gml:upperCorner>
      </gml:Envelope>
    </gml:boundedBy>`;

      // add new tag to the gml
      xml = xml.replace(rootRegex, `${fullRootTag}${newHeader}`);

      fs.writeFileSync(args.outputPath, xml, 'utf8');
      console.log(`Berhasil! File disimpan di: ${args.outputPath}`);

    } catch (err) {
      console.error(`Error: ${(err as Error).message}`);
    }
  }
}