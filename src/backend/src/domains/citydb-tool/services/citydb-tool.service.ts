import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import { ExportFileOptions, ImportFileOptions, RemoveDataOptions } from '../interfaces/citydb-tool.interface';

const execAsync = promisify(exec);
type ExecError = Error & { stderr?: string };

@Injectable()
export class CityDbToolService {
  private readonly logger = new Logger(CityDbToolService.name);

  private readonly containerName: string;
  private readonly exportsPath: string;

  constructor(private readonly config: ConfigService) {
    this.containerName = this.config.get<string>(
      'CITYDB_TOOL_CONTAINER',
      'legger-db-tool',
    );
    this.exportsPath = this.config.get<string>(
      'CITYDB_TOOL_EXPORTS_PATH',
      '/data',
    );
  }

  async exportCityGml(opts: ExportFileOptions): Promise<string> {
    const args = [
      'export',
      'citygml',
      '--citygml-version=2.0',
      '-o',
      path.join(this.exportsPath, opts.outputFile),
    ];
    if (opts.srid) args.push(`--crs=${opts.srid}`);

    // handle filter
    const filters: string[] = [];
    if (opts.objectId) filters.push(`objectid = '${opts.objectId}'`);
    if (opts.assetId) filters.push(`gen:asset_id = '${opts.assetId}'`);
    if (opts.sourceFileId) filters.push(`gen:source_file_id = '${opts.sourceFileId}'`);

    if (filters.length > 0) {
        const filterString = filters.join(' AND ');
        args.push(`--filter="${filterString}"`);
    }

    await this.run(args);
    return path.join(this.exportsPath, opts.outputFile);
  }

  async exportCityJson(opts: ExportFileOptions): Promise<string> {
    const args = [
      'export',
      'cityjson',
      '--output',
      path.join(this.exportsPath, opts.outputFile),
    ];
    if (opts.objectId) args.push(`--filter="${opts.objectId}"`);
    if (opts.srid) args.push(`--crs=${opts.srid}`);

    await this.run(args);
    return path.join(this.exportsPath, opts.outputFile);
  }

  async importCityGml(opts: ImportFileOptions): Promise<void> {
    await this.run([
      'import',
      'citygml',
      opts.inputFile,
      `--import-mode=${opts.importMode}`,
      `--updating-person="${opts.importer}"`
    ]);
  }

  async importCityJson(opts: ImportFileOptions): Promise<void> {
    await this.run([
      'import',
      'cityjson',
      '--input',
      path.join(this.exportsPath, opts.inputFile),
    ]);
  }

  async remove(opts: RemoveDataOptions) {
    const args: string[] = ['delete', '--delete-mode=delete']
    
    const filters: string[] = [];
    if (opts.assetId) filters.push(`gen:asset_id = '${opts.assetId}'`);
    if (opts.sourceFileId) filters.push(`gen:source_file_id = '${opts.sourceFileId}'`);
    if (filters.length) {
      const filterString = filters.join(' AND ')
      args.push(`--filter="${filterString}"`)
    } else {
      throw new ForbiddenException('Cannot delete all data!')
    }

    await this.run(args);
  }

  async run(args: string[]): Promise<{ stdout: string; stderr: string }> {
    const cmd = `docker exec -i ${this.containerName} citydb ${args.join(' ')}`;

    this.logger.debug(`Executing: ${cmd}`);

    try {
      const result = await execAsync(cmd);

      if (result.stderr && result.stderr.toLowerCase().includes('error')) {
        this.logger.error(
          `citydb-tool execution warning/error: ${result.stderr}`,
        );
        throw new Error(result.stderr);
      }

      this.logger.log(`stdout: ${result.stdout}`);
      return result;
    } catch (error: unknown) {
      const err = this.toExecError(error);

      this.logger.error(`citydb-tool failed: ${err.message}`, err.stderr);
      throw new InternalServerErrorException(
        `citydb-tool error: ${err.message}`,
      );
    }
  }

  private toExecError(error: unknown): ExecError {
    if (error instanceof Error) {
      return error as ExecError;
    }

    return new Error('Unknown citydb-tool error');
  }
}
