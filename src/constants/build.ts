// Copyright (c) 2022. Heusala Group <info@heusalagroup.fi>. All rights reserved.
//
// See also rollup.config.js
//

import {
    parseBoolean as _parseBoolean,
    parseNonEmptyString as _parseNonEmptyString
} from "../fi/hg/core/modules/lodash";

function parseBoolean (value : any) : boolean | undefined {
    if (value.startsWith('%'+'{') && value.endsWith('}')) return undefined;
    return _parseBoolean(value);
}

function parseNonEmptyString (value : any) : string | undefined {
    if (value.startsWith('%'+'{') && value.endsWith('}')) return undefined;
    return _parseNonEmptyString(value);
}

/**
 * @__PURE__
 */
export const BUILD_USAGE_URL = 'https://github.com/heusalagroup';

/**
 * @__PURE__
 */
export const BUILD_VERSION : string  = /* @__PURE__ */parseNonEmptyString('%{BUILD_VERSION}') ?? '?';

/**
 * @__PURE__
 */
export const BUILD_BACKEND_URL : string  = /* @__PURE__ */parseNonEmptyString('%{BUILD_BACKEND_URL}') ?? `http://0.0.0.0:3000`;

/**
 * @__PURE__
 */
export const BUILD_BACKEND_HOSTNAME : string  = /* @__PURE__ */parseNonEmptyString('%{BUILD_BACKEND_HOSTNAME}') ?? 'localhost';

/**
 * @__PURE__
 */
export const BUILD_BACKEND_IO_SERVER : string  = /* @__PURE__ */parseNonEmptyString('%{BUILD_BACKEND_IO_SERVER}') ?? 'memory:';

/**
 * @__PURE__
 */
export const BUILD_JWT_SECRET : string  = /* @__PURE__ */parseNonEmptyString('%{BUILD_JWT_SECRET}') ?? '';

/**
 * @__PURE__
 */
export const BUILD_JWT_ALG : string  = /* @__PURE__ */parseNonEmptyString('%{BUILD_JWT_ALG}') ?? 'HS256';

/**
 * @__PURE__
 */
export const BUILD_DEFAULT_LANGUAGE : string  = /* @__PURE__ */parseNonEmptyString('%{BUILD_DEFAULT_LANGUAGE}') ?? 'en';

/**
 * @__PURE__
 */
export const BUILD_COMMAND_NAME : string  = /* @__PURE__ */parseNonEmptyString('%{BUILD_COMMAND_NAME}') ?? 'nor-backend';

/**
 * @__PURE__
 */
export const BUILD_LOG_LEVEL : string  = /* @__PURE__ */parseNonEmptyString('%{BUILD_LOG_LEVEL}') ?? '';

/**
 * @__PURE__
 */
export const BUILD_NODE_ENV : string  = /* @__PURE__ */parseNonEmptyString('%{BUILD_NODE_ENV}')       ?? 'development';

/**
 * @__PURE__
 */
export const BUILD_DATE : string  = /* @__PURE__ */parseNonEmptyString('%{BUILD_DATE}')           ?? '';

/**
 * @__PURE__
 */
export const BUILD_WITH_FULL_USAGE       : boolean = /* @__PURE__ */parseBoolean('%{BUILD_WITH_FULL_USAGE}')       ?? true;

/**
 * @__PURE__
 */
export const IS_PRODUCTION  : boolean = BUILD_NODE_ENV === 'production';

/**
 * @__PURE__
 */
export const IS_TEST        : boolean = BUILD_NODE_ENV === 'test';

/**
 * @__PURE__
 */
export const IS_DEVELOPMENT : boolean = !IS_PRODUCTION && !IS_TEST;

/**
 * @__PURE__
 */
export const BUILD_EMAIL_FROM : string  = /* @__PURE__ */parseNonEmptyString('%{BUILD_EMAIL_FROM}') ?? 'Procure Node <info@procurenode.app>';

/**
 * @__PURE__
 */
export const BUILD_EMAIL_CONFIG : string  = /* @__PURE__ */parseNonEmptyString('%{BUILD_EMAIL_CONFIG}') ?? 'smtp://localhost:25';

/**
 * Minutes
 * @__PURE__
 */
export const BUILD_ACCESS_TOKEN_EXPIRATION_TIME : string  = /* @__PURE__ */parseNonEmptyString('%{BUILD_ACCESS_TOKEN_EXPIRATION_TIME}') ?? '3600';

/**
 * @__PURE__
 */
export const BUILD_BACKEND_PUBLIC_URL : string  = /* @__PURE__ */parseNonEmptyString('%{BUILD_BACKEND_PUBLIC_URL}') ?? 'http://localhost:3000';
