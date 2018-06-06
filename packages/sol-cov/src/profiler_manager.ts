import { promisify } from '@0xproject/utils';
import * as fs from 'fs';
import { Collector } from 'istanbul';
import * as _ from 'lodash';
import * as mkdirp from 'mkdirp';
import * as path from 'path';

import { collectCoverageEntries } from './collect_coverage_entries';
import { CoverageManager } from './coverage_manager';
import { parseSourceMap } from './source_maps';
import { ContractData, Coverage, SourceRange, Subtrace } from './types';
import { utils } from './utils';

const mkdirpAsync = promisify<undefined>(mkdirp);

export class ProfilerManager extends CoverageManager {
    protected static _getSingleFileCoverageForSubtrace(
        contractData: ContractData,
        subtrace: Subtrace,
        pcToSourceRange: { [programCounter: number]: SourceRange },
        fileIndex: number,
    ): Coverage {
        const absoluteFileName = contractData.sources[fileIndex];
        const coverageEntriesDescription = collectCoverageEntries(contractData.sourceCodes[fileIndex]);
        const statementCoverage: { [statementId: number]: number } = {};
        const statementIds = _.keys(coverageEntriesDescription.statementMap);
        for (const statementId of statementIds) {
            const statementDescription = coverageEntriesDescription.statementMap[statementId];
            const totalGasCost = _.sum(
                _.map(subtrace, structLog => {
                    const sourceRange = pcToSourceRange[structLog.pc];
                    if (_.isUndefined(sourceRange)) {
                        return 0;
                    }
                    if (sourceRange.fileName !== absoluteFileName) {
                        return 0;
                    }
                    if (utils.isRangeInside(sourceRange.location, statementDescription)) {
                        return structLog.gasCost;
                    } else {
                        return 0;
                    }
                }),
            );
            statementCoverage[statementId as any] = totalGasCost;
        }
        const partialCoverage = {
            [absoluteFileName]: {
                ...coverageEntriesDescription,
                l: {}, // It's able to derive it from statement coverage
                path: absoluteFileName,
                f: {},
                s: statementCoverage,
                b: {},
            },
        };
        return partialCoverage as any;
    }
    public async writeProfilerOutputAsync(): Promise<void> {
        const finalProfilerOutput = await this._computeCoverageAsync();
        const stringifiedProfilerOutput = JSON.stringify(finalProfilerOutput, null, '\t');
        await mkdirpAsync('coverage');
        fs.writeFileSync('coverage/coverage.json', stringifiedProfilerOutput);
    }
}
