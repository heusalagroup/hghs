// Copyright (c) 2022. Heusala Group <info@heusalagroup.fi>. All rights reserved.

import {
    GetMapping, PostMapping,
    RequestHeader,
    RequestMapping
} from "../fi/hg/core/Request";
import { ReadonlyJsonObject } from "../fi/hg/core/Json";
import { ResponseEntity } from "../fi/hg/core/request/ResponseEntity";
import { LogService } from "../fi/hg/core/LogService";
import { MATRIX_AUTHORIZATION_HEADER_NAME } from "../fi/hg/matrix/constants/matrix-routes";

const LOG = LogService.createLogger('HgHsBackendController');

@RequestMapping("/")
export class HgHsBackendController {

    @GetMapping("/")
    public static async getIndex (
        @RequestHeader(MATRIX_AUTHORIZATION_HEADER_NAME, {
            required: false,
            defaultValue: ''
        })
        token: string
    ): Promise<ResponseEntity<ReadonlyJsonObject | {readonly error: string}>> {
        try {

            return ResponseEntity.ok({
                hello: 'world'
            } as unknown as ReadonlyJsonObject);

        } catch (err) {
            LOG.error(`ERROR: `, err);
            return ResponseEntity.internalServerError<{readonly error: string}>().body({
                error: 'Internal Server Error'
            });
        }
    }

    @GetMapping("/_synapse/admin/v1/register")
    public static async getSynapseAdminRegister (
        @RequestHeader(MATRIX_AUTHORIZATION_HEADER_NAME, {
            required: false,
            defaultValue: ''
        })
        token: string
    ): Promise<ResponseEntity<ReadonlyJsonObject | {readonly error: string}>> {
        try {

            return ResponseEntity.ok({
                hello: 'world'
            } as unknown as ReadonlyJsonObject);

        } catch (err) {
            LOG.error(`ERROR: `, err);
            return ResponseEntity.internalServerError<{readonly error: string}>().body({
                error: 'Internal Server Error'
            });
        }
    }

    @PostMapping("/_synapse/admin/v1/register")
    public static async postSynapseAdminRegister (
        @RequestHeader(MATRIX_AUTHORIZATION_HEADER_NAME, {
            required: false,
            defaultValue: ''
        })
        token: string
    ): Promise<ResponseEntity<ReadonlyJsonObject | {readonly error: string}>> {
        try {

            return ResponseEntity.ok({
                hello: 'world'
            } as unknown as ReadonlyJsonObject);

        } catch (err) {
            LOG.error(`ERROR: `, err);
            return ResponseEntity.internalServerError<{readonly error: string}>().body({
                error: 'Internal Server Error'
            });
        }
    }

}
