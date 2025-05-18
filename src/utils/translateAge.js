// src/utils/translateAge.js
export const translateAgeString = (ageString, t) => {
    if (!ageString) {
        return '';
    }

    if (ageString.endsWith('m')) {
        return ageString.replace(/m$/, t('monthAbbr', { defaultValue: 'мес.' }));
    }
    if (ageString.endsWith('Y')) {
        return ageString.replace(/Y$/, t('yearAbbr', { defaultValue: 'г.' }));
    }
    if (ageString.endsWith('года')) {
        return ageString.replace(/года$/, t('yearFull', { defaultValue: 'года' }));
    }
    if (ageString.endsWith('год')) {
        return ageString.replace(/год$/, t('yearSingular', { defaultValue: 'год' }));
    }

    return ageString;
};