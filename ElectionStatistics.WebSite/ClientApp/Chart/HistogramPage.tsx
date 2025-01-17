import * as React from 'react';

import { HighchartComponent } from '../Highchart/Component';

import { ChartsController, ChartBuildParameters } from './ChartsController';
import { OldChartPage } from './OldChartPage';
import { DictionariesController, ElectoralDistrictDto, INamedChartParameter } from './DictionariesController';

export class HistogramPage extends OldChartPage {
    protected renderAdditionalParameterSelectors(): JSX.Element[] {
        return [
        (<div key={1} className="row">
            <div className="col-md-3">
                {this.renderParametersSelect(
                    "Выберите параметр для оси X",
                    this.state.x,
                    electionId => DictionariesController.Instance.getParameters(electionId),
                    this.onXChange
                )}
            </div>
        </div>),
        (<div key={2} className="row">
            <div className="col-md-3">
                {this.renderParametersSelect(
                    "Выберите параметр для оси Y",
                    this.state.y,
                    electionId => DictionariesController.Instance.getSummaryParameters(),
                    this.onYChange
                )}
            </div>
        </div>)
        ];
    }

    protected getChartData(parameters: ChartBuildParameters): Promise<Highcharts.Options> {
        return ChartsController.Instance.getHistogramData({
            ...parameters,
            stepSize: 1
        });
    }

    protected renderChart(optionsFromBackend: Highcharts.Options): JSX.Element {
        const options = {
            ...optionsFromBackend,
            title: { text: '' },
            chart: { type: 'line' },
            plotOptions: {
                series: {
                    turboThreshold: 100000
                },
                line: {
                    step: 'center',
                    marker: {
                        enabled: false
                    }
                }
            }
        };

        return <HighchartComponent options={options} />;
    }
}
