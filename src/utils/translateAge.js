// src/utils/translateAge.js

export const translateAgeString = (ageString, t) => {
    if (!ageString || typeof ageString !== 'string') {
        return '';
    }

    const rangeMonthMatch = ageString.match(/^(\d+)\s*-\s*(\d+)\s*([mMм]?)$/i);
    if (rangeMonthMatch) {
        const low = rangeMonthMatch[1];
        const high = rangeMonthMatch[2];
        return `${low}-${high} ${t('monthAbbr', 'мес.')}`;
    }

    const yearMatch = ageString.match(/^(\d+)\s*([YyГг])$/i);
    if (yearMatch) {
        const count = parseInt(yearMatch[1], 10);
        if (!isNaN(count)) {
            const yearText = t('year', { count: count, defaultValue: t('yearAbbr', 'г.') });
            return `${count} ${yearText}`;
        }
    }
    const monthMatch = ageString.match(/^(\d+)\s*([mMм])$/i);
    if (monthMatch) {
        const count = monthMatch[1];
        return `${count} ${t('monthAbbr', 'мес.')}`;
    }
    const justNumberMatch = ageString.match(/^(\d+)$/);
    if (justNumberMatch) {
        const count = parseInt(justNumberMatch[1], 10);
        if (!isNaN(count)) {
            if (count >= 1 && count <= 12) {
                const yearText = t('year', {count: count, defaultValue: t('yearAbbr', 'г.')});
                return `${count} ${yearText}`;
            } else if (count > 12 && count < 100) {
                return `${count} ${t('monthAbbr', 'мес.')}`;
            }
            return `${count} ${t('monthAbbr', 'мес.')}`;
        }
    }
    if (ageString.endsWith('года')) {
        return ageString.replace(/года$/, t('year_few', {defaultValue: 'года'}));
    }
    if (ageString.endsWith('год')) {
        return ageString.replace(/год$/, t('year_one', {defaultValue: 'год'}));
    }
    if (ageString.endsWith('лет')) {
        return ageString.replace(/лет$/, t('year_many', {defaultValue: 'лет'}));
    }
    return ageString;
};