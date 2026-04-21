import { Injectable } from '@nestjs/common';
import { AddAttributeToGML, normalizeCityGML } from 'src/tool/interfaces/gml-tool.interface';
import * as xml2js from 'xml2js';
import * as fs from 'fs';

@Injectable()
export class GmlService {
  async addAttributeToGml(args: AddAttributeToGML): Promise<string> {
    const parser = new xml2js.Parser({ explicitArray: true });
    const builder = new xml2js.Builder({
      renderOpts: { 'pretty': true, 'indent': '  ', 'newline': '\n' },
      xmldec: { 'version': '1.0', 'encoding': 'UTF-8' }
    });

    // Parse XML as Object
    const fileContent = fs.readFileSync(args.filepath, 'utf8');
    const result = await parser.parseStringPromise(fileContent);

    const cityModel = result['core:CityModel'];
    if (cityModel && cityModel['core:cityObjectMember']) {

      cityModel['core:cityObjectMember'].forEach((member: any) => {
        // CityGML biasanya membungkus building di dalam bldg:Building
        const building = member['bldg:Building'] ? member['bldg:Building'][0] : null;

        if (building) {
          // Add new attributes
          if (args.validFrom) {
            const validFromDate = new Date(args.validFrom).toISOString();
            building['core:validFrom'] = [validFromDate]
          }
          if (args.validTo) {
            const validToDate = new Date(args.validTo).toISOString();
            building['core:validTo'] = [validToDate]
          }

          // Inisiate an array if the generic properties does not exist yet
          if (!building['gen:stringAttribute']) {
            building['gen:stringAttribute'] = [];
          }

          building['gen:stringAttribute'].push({
            $: { name: 'asset_id' },
            'gen:value': [args.assetId]
          });
          building['gen:stringAttribute'].push({
            $: { name: 'source_file_id' },
            'gen:value': [args.sourceFileId]
          });
        }
      });
    }

    // Rebuild as an XML String
    const updatedGml = builder.buildObject(result);

    // save the result as a file 
    const outputPath = args.filepath.replace('.gml', 'updated.gml')
    fs.writeFileSync(outputPath, updatedGml, 'utf8');

    return outputPath;
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