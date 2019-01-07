import isObject from 'lodash-es/isObject';
import i18n from '@dhis2/d2-i18n';

import { YEAR_OVER_YEAR_LINE, YEAR_OVER_YEAR_COLUMN, PIE } from './chartTypes';
import { BASE_FIELD_YEARLY_SERIES } from './fields/baseFields';
import {
    menuLabels,
    DIMENSION_ID_PROP_NAME,
    DIMENSION_ITEMS_PROP_NAME,
} from './layout';
import { FIXED_DIMENSIONS } from './fixedDimensions';

const dxName = FIXED_DIMENSIONS.dx.name;
const peId = FIXED_DIMENSIONS.pe.id;

const errorLabels = {
    defaultSeries: i18n.t('Please add at least one {{series}} dimension', {
        series: menuLabels.columns,
    }),
    defaultCategory: i18n.t('Please add at least one {{category}} dimension', {
        category: menuLabels.rows,
    }),
    defaultPeriod: i18n.t(
        'Please add at least one period as {series}}, {{category}} or {{filter}}',
        {
            series: menuLabels.columns,
            category: menuLabels.rows,
            filter: menuLabels.filters,
        }
    ),
    pie: {
        data: i18n.t('Please add {{data}} as {{category}} or {{filter}}', {
            data: dxName,
            category: menuLabels.rows,
            filter: menuLabels.filters,
        }),
        period: i18n.t(
            'Please add at least one period as {{category}} or {{filter}}',
            {
                category: menuLabels.rows,
                filter: menuLabels.filters,
            }
        ),
        filter: i18n.t('Please add at least one {{filter}} dimension', {
            filter: menuLabels.filters,
        }),
    },
    yearOverYear: {
        seriesPeriod: i18n.t(
            'Please add at least one period as a {{series}} dimension',
            {
                series: menuLabels.columns,
            }
        ),
        categoryPeriod: i18n.t(
            'Please add at least one period as a {{category}} dimension',
            {
                category: menuLabels.rows,
            }
        ),
        data: i18n.t('Please add {{data}} as a filter dimension', {
            data: dxName,
        }),
    },
};

// Layout validation helper functions
const isItemValid = item =>
    Boolean(isObject(item) && typeof item.id === 'string');

const isDimensionValid = dim =>
    Boolean(
        isObject(dim) &&
            typeof dim[DIMENSION_ID_PROP_NAME] === 'string' &&
            Array.isArray(dim[DIMENSION_ITEMS_PROP_NAME]) &&
            isItemValid(dim[DIMENSION_ITEMS_PROP_NAME][0])
    );

const isAxisValid = axis =>
    Boolean(Array.isArray(axis) && isDimensionValid(axis[0]));

const validateDimension = (dimension, message) => {
    if (!(dimension && isDimensionValid(dimension))) {
        throw new Error(message);
    }
};

const validateAxis = (axis, message) => {
    if (!isAxisValid(axis)) {
        throw new Error(message);
    }
};

const findDimension = (layout, dimensionId) =>
    [...layout.columns, ...layout.rows, ...layout.filters].find(
        dim => dim.dimension === dimensionId
    );

// Layout validation
const validateDefaultLayout = layout => {
    validateAxis(layout.columns, errorLabels.defaultSeries);
    validateAxis(layout.rows, errorLabels.defaultCategory);
    validateDimension(findDimension(layout, peId), errorLabels.defaultPeriod);
};

const validateYearOverYearLayout = layout => {
    if (
        !(
            Array.isArray(layout[BASE_FIELD_YEARLY_SERIES]) &&
            typeof layout[BASE_FIELD_YEARLY_SERIES][0] === 'string'
        )
    ) {
        throw new Error(errorLabels.yearOverYear.seriesPeriod);
    }

    validateAxis(layout.rows, errorLabels.yearOverYear.categoryPeriod);

    validateAxis(layout.columns, errorLabels.yearOverYear.data);
};

const validatePieLayout = layout => {
    validateAxis(layout.rows, errorLabels.defaultCategory);
    validateAxis(layout.filters, errorLabels.pie.filter);
    validateDimension(findDimension(layout, peId), errorLabels.pie.period);
};

export const validateLayout = layout => {
    switch (layout.type) {
        case PIE:
            return validatePieLayout(layout);
        case YEAR_OVER_YEAR_COLUMN:
        case YEAR_OVER_YEAR_LINE:
            return validateYearOverYearLayout(layout);
        default:
            return validateDefaultLayout(layout);
    }
};
