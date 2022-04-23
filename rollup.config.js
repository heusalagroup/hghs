// Copyright (c) 2021. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import pkg from './package.json';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import { babel, getBabelOutputPlugin } from '@rollup/plugin-babel';
import { uglify } from "rollup-plugin-uglify";
import PATH from 'path';
import replace from '@rollup/plugin-replace';
// import externalGlobals from "rollup-plugin-external-globals";
// import inject from '@rollup/plugin-inject';

const BUILD_VERSION               = process?.env?.BUILD_VERSION                            ?? pkg?.version ?? '';
const BUILD_NODE_ENV              = process?.env?.BUILD_NODE_ENV ?? process?.env?.NODE_ENV ?? 'production';
const BUILD_DATE                  = new Date().toISOString()                               ?? '';
const BUILD_WITH_FULL_USAGE       = process?.env?.BUILD_WITH_FULL_USAGE                    ?? '';
const BUILD_COMMAND_NAME          = process?.env?.BUILD_COMMAND_NAME                       ?? '';
const BUILD_LOG_LEVEL             = process?.env?.BUILD_LOG_LEVEL                          ?? '';

console.log(`Building with options:

  BUILD_VERSION               = '${BUILD_VERSION}'
  BUILD_NODE_ENV              = '${BUILD_NODE_ENV}'
  BUILD_DATE                  = '${BUILD_DATE}'
  BUILD_COMMAND_NAME          = '${BUILD_COMMAND_NAME}'
  BUILD_LOG_LEVEL             = '${BUILD_LOG_LEVEL}'
  BUILD_WITH_FULL_USAGE       = '${BUILD_WITH_FULL_USAGE}'`);

export default {
    input: 'src/hghs.ts',
    external: [
        'node:buffer',
        'node:path',
        'node:child_process',
        'node:process',
        'node:os',
        'node:url'
    ],
    plugins: [

        // See also ./src/runtime-constants.ts
        replace({
            exclude: 'node_modules/**',
            // include: './src/build-constants.ts',
            values: {
                'BUILD_VERSION'                : BUILD_VERSION,
                'BUILD_NODE_ENV'               : BUILD_NODE_ENV,
                'BUILD_DATE'                   : BUILD_DATE,
                'BUILD_COMMAND_NAME'           : BUILD_COMMAND_NAME,
                'BUILD_LOG_LEVEL'              : BUILD_LOG_LEVEL,
                'BUILD_WITH_FULL_USAGE'        : BUILD_WITH_FULL_USAGE
            },
            preventAssignment: true,
            delimiters: ['%{', '}']
        }),

        typescript(),

        json(),

        resolve(),

        commonjs({
            sourceMap: false,
            include: /node_modules/
        }),

        babel({ babelHelpers: 'bundled' }),

        // externalGlobals({
        //     intl: 'IntlPolyfill'
        // }),

        // See also https://github.com/mishoo/UglifyJS/blob/master/README.md#minify-options
        uglify({
            annotations: true,
            toplevel: true,
            sourcemap: false,
            compress: {
                collapse_vars: true,
                imports: true,
                booleans: true,
                annotations: true,
                unused: true,
                dead_code: true,
                passes: 10,
                hoist_funs: true,
                hoist_vars: true,
                merge_vars: true,
                toplevel: true,
                unsafe_math: true
            },
            output: {
                annotations: false,
                shebang: true,
                max_line_len: 120,
                indent_level: 2
            }
        })

    ],
    output: {
        dir: 'dist',
        format: 'cjs',
        banner: '#!/usr/bin/env node',
        plugins: [
            getBabelOutputPlugin({
                configFile: PATH.resolve(__dirname, 'babel.config.json')
            })
        ]
        // globals: {
        //     intl: 'Intl'
        // }
    }
};
