export const charRange = (from, to) => {
    const arr = [];
    for (let i = from; i <= to; i++) {
        if (i < 10) {
            arr.push('0' + i.toString());
        } else {
            arr.push(i.toString());
        }
    }
    return arr;
};
