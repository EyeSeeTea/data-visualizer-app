import React from 'react'
import i18n from '@dhis2/d2-i18n'
import { FONT_STYLE_LEGEND } from '@dhis2/analytics'

import CheckboxBaseOption from './CheckboxBaseOption'

const HideLegend = () => (
    <CheckboxBaseOption
        label={i18n.t('Show legend key')}
        option={{
            name: 'hideLegend',
        }}
        inverted={true}
        fontStyleKey={FONT_STYLE_LEGEND}
    />
)

export default HideLegend
