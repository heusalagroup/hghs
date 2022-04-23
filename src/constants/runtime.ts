// Copyright (c) 2022. Heusala Group <info@heusalagroup.fi>. All rights reserved.

import { parseNonEmptyString } from "../fi/hg/core/modules/lodash";
import { LogLevel, parseLogLevel } from "../fi/hg/core/types/LogLevel";
import {
    BUILD_COMMAND_NAME,
    BUILD_LOG_LEVEL,
    BUILD_BACKEND_URL,
} from "./build";

export const BACKEND_LOG_LEVEL       : LogLevel = parseLogLevel(parseNonEmptyString(process?.env?.BACKEND_LOG_LEVEL) ?? parseNonEmptyString(BUILD_LOG_LEVEL)) ?? LogLevel.INFO ;
export const BACKEND_SCRIPT_NAME     : string   = parseNonEmptyString(process?.env?.BACKEND_SCRIPT_NAME)     ?? BUILD_COMMAND_NAME;
export const BACKEND_URL             : string   = parseNonEmptyString(process?.env?.BACKEND_URL)             ?? BUILD_BACKEND_URL;
