import {
    CategoryScale,
    Chart,
    LineController,
    BarController,
    LineElement,
    BarElement,
    LinearScale,
    PointElement,
    Tooltip}
    from 'chart.js';
import React, {useState, useEffect} from 'react';

Chart.register(
    LinearScale, LineController,
    BarController, BarElement,
    CategoryScale, PointElement, LineElement, Tooltip);

export default (props) => {
    const chartId = props.chartId;
    const datasets = props.datasets;
    const labels = props.labels;
    const max = props.max;
    const type = props.type ?? 'line';
    const stacked = props.stacked;

    const [chart, setChart] = useState(undefined);

    useEffect(() => {
        if (chart) {
            chart.destroy();
        }

        const newChart = new Chart(chartId, {
            type,
            data: {
                datasets,
                labels
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        stacked
                    },
                    y: {
                        suggestedMin: 0,
                        suggestedMax: max,
                        stacked
                    }
                },
                legend: {
                    display: false
                }
            }
        });

        setChart(newChart);
    }, [datasets]);

    return (
        <canvas id={chartId}></canvas>
    );
};
