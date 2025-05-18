// src/utils/ageSorter.js
function parseAgeString(ageString) {
    if (!ageString || typeof ageString !== 'string') {
        return { months: Infinity, isRange: false, original: ageString };
    }

    const rangeMatch = ageString.match(/^(\d+)-(\d+)\s*([мmYг]?)$/i);
    if (rangeMatch) {
        let low = parseInt(rangeMatch[1], 10);
        let high = parseInt(rangeMatch[2], 10);
        const unit = rangeMatch[3] ? rangeMatch[3].toLowerCase() : '';

        if (unit === 'y' || unit === 'г') {
            low *= 12;
            high *= 12;
        }
        return { months: low, isRange: true, original: ageString, upperMonths: high };
    }

    const singleMatch = ageString.match(/^(\d+)\s*([мmYг]?)$/i);
    if (singleMatch) {
        let value = parseInt(singleMatch[1], 10);
        const unit = singleMatch[2] ? singleMatch[2].toLowerCase() : '';
        if (unit === 'y' || unit === 'г') {
            value *= 12;
        }
        return { months: value, isRange: false, original: ageString };
    }

    const justNumberMatch = ageString.match(/^(\d+)$/);
    if (justNumberMatch) {
        return { months: parseInt(justNumberMatch[1], 10), isRange: false, original: ageString };
    }

    return { months: Infinity, isRange: false, original: ageString };
}

export function compareAgeStrings(a, b) {
    const parsedA = parseAgeString(a);
    const parsedB = parseAgeString(b);

    if (parsedA.months !== parsedB.months) {
        return parsedA.months - parsedB.months;
    }
    if (!parsedA.isRange && parsedB.isRange) {
        return -1;
    }
    if (parsedA.isRange && !parsedB.isRange) {
        return 1;
    }

    if (parsedA.isRange && parsedB.isRange) {
        if (parsedA.upperMonths !== undefined && parsedB.upperMonths !== undefined) {
            if (parsedA.upperMonths !== parsedB.upperMonths) {
                return parsedA.upperMonths - parsedB.upperMonths;
            }
        }
    }
    return parsedA.original.localeCompare(parsedB.original);
}