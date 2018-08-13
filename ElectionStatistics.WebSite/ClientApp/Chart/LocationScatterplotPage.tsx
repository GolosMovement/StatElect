import * as React from 'react';

import { HighchartComponent } from '../Highchart/Component';

import { ChartsController, ChartBuildParameters } from './ChartsController';
import { ChartPage, ScatterploChartPageRouteProps } from './ChartPage';
import { ElectoralDistrictDto, DictionariesController, NamedChartParameter } from './DictionariesController';
import { QueryString } from '../Common';
import { Link } from 'react-router-dom';

export class LocationScatterplotPage extends ChartPage {
    protected renderAdditionalParameterSelectors(): JSX.Element[] {
        return [
        <div className="row">
            <div className="col-md-3">
                {this.renderParametersSelect(
                    "Выберите параметр для оси Y",
                    this.state.y,
                    electionId => DictionariesController.Instance.getParameters(electionId),
                    this.onYChange
                )}
            </div>
        </div>
        ];
    }
    
    protected getChartData(parameters: ChartBuildParameters): Promise<Highcharts.Options> {
        return ChartsController.Instance.getLocationScatterplotData(parameters);
    }

    protected renderButton() {
        if (this.state.electionId === null ||
            this.state.y === null) {
            return null;
        }
        else {
            const queryParams: ScatterploChartPageRouteProps = {
                electionId: this.state.electionId,
                districtId: this.state.districtId || undefined,
                y: this.toQueryStringParameter(this.state.y)
            }
    
            return (
                <Link 
                    className="btn btn-primary"               
                    to={{ search: QueryString.stringify(queryParams)}}>
                    Построить
                </Link>
            );
        }
    }

    protected tryLoadChartData() {
        if (this.state.electionId !== null &&
            this.state.y !== null) {
            this.setState({
                ...this.state,
                isLoading: true
            });
            
            this.getChartData({
                    electionId: this.state.electionId,
                    districtId: this.state.districtId,
                    y: this.state.y,
                })
                .then(series => {
                    this.setState({
                        ...this.state,
                        isLoading: false,
                        chartOptions: series
                    });
                });
        }
    }

    protected renderChart(optionsFromBackend: Highcharts.Options): JSX.Element {    
        const options = {
            ...optionsFromBackend,
            title: { text: '' },
            chart: { type: 'scatter' },
            boost: {
                useGPUTranslations: true,
                usePreAllocated: true
            },
            series: (optionsFromBackend.series as Highcharts.ScatterChartSeriesOptions[])
                .map(s => ({
                    ...s,
                    marker: {
                        radius: 2
                    },
                    tooltip: {
                        ...s.tooltip,
                        followPointer: false
                    }
                })),
            plotOptions: {
                series: {
                    animation: false,
                    turboThreshold: 100000,
                    states: {
                        hover: {
                            enabled: false
                        }
                    }
                }
            },
        };

        return <HighchartComponent options={options} />;
    }
}