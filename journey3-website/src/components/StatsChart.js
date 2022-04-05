import {CategoryScale, Chart, LineController, LineElement, LinearScale, PointElement, Tooltip} from 'chart.js';
import React, {useState, useEffect} from 'react';

Chart.register(LinearScale, LineController, CategoryScale, PointElement, LineElement, Tooltip);

export default (props) => {
    const chartId = props.chartId;

    const [chart, setChart] = useState(undefined);

    useEffect(() => {
        if (chart) {
            chart.destroy();
        }

        const newChart = new Chart(chartId, {
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

        setChart(newChart);
    }, [props.datasets]);

    return (
        <canvas id={chartId}></canvas>
    );
};
