import { CategoryScale, Chart, LineController, LineElement, LinearScale, PointElement, Tooltip } from 'chart.js';
import React, { useEffect } from 'react';

Chart.register(LinearScale, LineController, CategoryScale, PointElement, LineElement, Tooltip);

export default (props) => {
    const chartId = props.chartId;

    useEffect(() => {
        new Chart(chartId, {
            type: 'line',
            data: {
                datasets: props.datasets,
                labels: props.labels
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        suggestedMin: 0,
                        suggestedMax: props.max
                    }
                },
                legend: {
                    display: false
                }
            }
        });
    }, []);

    return (
        <canvas id={chartId}></canvas>
    );
};