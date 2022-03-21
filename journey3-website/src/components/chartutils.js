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
    'rgb(45, 137, 239)', // blue
    'rgb(255, 87, 34)', // orange
    'rgb(0, 188, 212)', // cyan
    'rgb(171, 71, 188)', // purple
    'rgb(76, 175, 80)', // green
    'rgb(121, 85, 72)', // brown
    'rgb(236, 64, 122)', // pink
    'rgb(38, 166, 154)', // teal
    'rgb(103, 58, 183)', // deep purple
    'rgb(124, 179, 66)', // light green
];