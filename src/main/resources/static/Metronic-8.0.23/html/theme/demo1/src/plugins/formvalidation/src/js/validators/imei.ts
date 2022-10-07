/**
 * FormValidation (https://formvalidation.io)
 * The best validation library for JavaScript
 * (c) 2013 - 2021 Nguyen Huu Phuoc <me@phuoc.ng>
 */

import luhn from '../algorithms/luhn';
import {
    Localization,
    ValidateFunctionInterface,
    ValidateInput,
    ValidateOptions,
    ValidateResult,
} from '../core/Core';

export default function imei(): ValidateFunctionInterface<
    ValidateOptions,
    ValidateResult
> {
    return {
        /**
         * Validate IMEI (International Mobile Station Equipment Identity)
         * @see http://en.wikipedia.org/wiki/International_Mobile_Station_Equipment_Identity
         */
        validate(
            input: ValidateInput<ValidateOptions, Localization>
        ): ValidateResult {
            if (input.value === '') {
                return { valid: true };
            }

            switch (true) {
                case /^\d{15}$/.test(input.value):
                case /^\d{2}-\d{6}-\d{6}-\d{1}$/.test(input.value):
                case /^\d{2}\s\d{6}\s\d{6}\s\d{1}$/.test(input.value):
                    return { valid: luhn(input.value.replace(/[^0-9]/g, '')) };

                case /^\d{14}$/.test(input.value):
                case /^\d{16}$/.test(input.value):
                case /^\d{2}-\d{6}-\d{6}(|-\d{2})$/.test(input.value):
                case /^\d{2}\s\d{6}\s\d{6}(|\s\d{2})$/.test(input.value):
                    return { valid: true };

                default:
                    return { valid: false };
            }
        },
    };
}
