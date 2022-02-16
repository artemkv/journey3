import * as dateTimeUtil from '../datetimeutil';

import {CategoryScale, Chart, LineController, LineElement, LinearScale, PointElement} from 'chart.js';
import React, {useEffect} from 'react';

import {charRange} from '../util';

Chart.register(LinearScale, LineController, CategoryScale, PointElement, LineElement);

export default (props) => {
    const chartId = props.chartId;

    useEffect(() => {
        const values = getValues(props.data, props.period, props.dateTime);
        const max = Math.max(...values, 1);

        new Chart(props.chartId, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Count',
                    data: values,
                    backgroundColor: '#2d89ef',
                    borderColor: '#2d89ef',
                    fill: false,
                    lineTension: 0
                }],
                labels: getLabels(props.period, props.dateTime)
            },
            options: {
                scales: {
                    y: {
                        suggestedMin: 0,
                        suggestedMax: max
                    }
                },
                legend: {
                    display: false
                }
            }
        });
    }, []);

    return (
        <canvas id={chartId} width="200" height="100"></canvas>
    );
};

function getLabels(period, dateTime) {
    switch (period) {
    case 'year':
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    case 'month':
        return charRange(1, dateTimeUtil.daysInMonth(dateTime));
    case 'day':
        return charRange(0, 24).map((x) => x + ':00');
    default:
        throw new Error(`Unknown period ${period}`);
    }
}

function getValues(data, period, dateTime) {
    const countByDt = {};
    data.map((x) => {
        countByDt[x.dt] = x.count;
    });
    return dateTimeUtil.getPeriodDts(period, dateTime).map((x) => {
        return (x in countByDt) ? countByDt[x] : 0;
    });
}
