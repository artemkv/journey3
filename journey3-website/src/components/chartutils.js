import * as dateTimeUtil from '../datetimeutil';
import { charRange } from '../util';

export const getLabels = (period, dateTime) => {
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

export const getValues = (data, period, dateTime) => {
    const countByDt = {};
    data.map((x) => {
        countByDt[x.dt] = x.count;
    });
    return dateTimeUtil.getPeriodDts(period, dateTime).map((x) => {
        return (x in countByDt) ? countByDt[x] : 0;
    });
}

export const CHART_COLORS = [
    'rgb(54, 162, 235)', // blue
    'rgb(255, 99, 132)', // red
    'rgb(75, 192, 192)', // green
    'rgb(255, 159, 64)', // orange
    'rgb(255, 205, 86)', // yellow
    'rgb(153, 102, 255)', // purple
    'rgb(201, 203, 207)' // grey
];