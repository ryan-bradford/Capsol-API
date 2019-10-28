// TODO: convert to service
let currentMonth = 10;

export function getDateAsNumber(): number {
    // return new Date().getMonth() + 12 * new Date().getFullYear();
    return currentMonth;
}

export function addMonth() {
    currentMonth += 1;
}

export function resetDate() {
    currentMonth = 1;
}
