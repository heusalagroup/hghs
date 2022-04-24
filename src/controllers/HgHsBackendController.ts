// Copyright (c) 2022. Heusala Group <info@heusalagroup.fi>. All rights reserved.

import {
    GetMapping, PathVariable, PostMapping,
    RequestHeader,
    RequestMapping
} from "../fi/hg/core/Request";
import { ReadonlyJsonObject } from "../fi/hg/core/Json";
import { ResponseEntity } from "../fi/hg/core/request/ResponseEntity";
import { LogService } from "../fi/hg/core/LogService";
import { MATRIX_AUTHORIZATION_HEADER_NAME } from "../fi/hg/matrix/constants/matrix-routes";
import { createErrorDTO } from "../fi/hg/core/types/ErrorDTO";

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

            return ResponseEntity.ok(
                {
                    hello: 'world'
                } as unknown as ReadonlyJsonObject
            );

        } catch (err) {
            LOG.error(`ERROR: `, err);
            return ResponseEntity.internalServerError<{readonly error: string}>().body(
                createErrorDTO('Internal Server Error', 500)
            );
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

            return ResponseEntity.ok(
                {
                    hello: 'world'
                } as unknown as ReadonlyJsonObject
            );

        } catch (err) {
            LOG.error(`ERROR: `, err);
            return ResponseEntity.internalServerError<{readonly error: string}>().body(
                createErrorDTO('Internal Server Error', 500)
            );
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

            return ResponseEntity.ok(
                {
                    hello: 'world'
                } as unknown as ReadonlyJsonObject
            );

        } catch (err) {
            LOG.error(`ERROR: `, err);
            return ResponseEntity.internalServerError<{readonly error: string}>().body(
                createErrorDTO('Internal Server Error', 500)
            );
        }
    }

    @GetMapping("/_matrix/client/r0/account/whoami")
    public static async accountWhoAmI (
        @RequestHeader(MATRIX_AUTHORIZATION_HEADER_NAME, {
            required: false,
            defaultValue: ''
        })
            token: string
    ): Promise<ResponseEntity<ReadonlyJsonObject | {readonly error: string}>> {
        try {

            return ResponseEntity.ok(
                {
                    hello: 'world'
                } as unknown as ReadonlyJsonObject
            );

        } catch (err) {
            LOG.error(`ERROR: `, err);
            return ResponseEntity.internalServerError<{readonly error: string}>().body(
                createErrorDTO('Internal Server Error', 500)
            );
        }
    }

    @PostMapping("/_matrix/client/r0/login")
    public static async login (
        @RequestHeader(MATRIX_AUTHORIZATION_HEADER_NAME, {
            required: false,
            defaultValue: ''
        })
            token: string
    ): Promise<ResponseEntity<ReadonlyJsonObject | {readonly error: string}>> {
        try {

            return ResponseEntity.ok(
                {
                    hello: 'world'
                } as unknown as ReadonlyJsonObject
            );

        } catch (err) {
            LOG.error(`ERROR: `, err);
            return ResponseEntity.internalServerError<{readonly error: string}>().body(
                createErrorDTO('Internal Server Error', 500)
            );
        }
    }

    @GetMapping("/_matrix/client/r0/directory/room/:roomAlias")
    public static async getDirectoryRoomByName (
        @RequestHeader(MATRIX_AUTHORIZATION_HEADER_NAME, {
            required: false,
            defaultValue: ''
        })
            token: string,
        @PathVariable('roomAlias', {required: true})
            roomAlias = ""
    ): Promise<ResponseEntity<ReadonlyJsonObject | {readonly error: string}>> {
        try {

            LOG.debug(`roomAlias = `, roomAlias);

            return ResponseEntity.ok(
                {
                    hello: 'world'
                } as unknown as ReadonlyJsonObject
            );

        } catch (err) {
            LOG.error(`ERROR: `, err);
            return ResponseEntity.internalServerError<{readonly error: string}>().body(
                createErrorDTO('Internal Server Error', 500)
            );
        }
    }

    @GetMapping("/_matrix/client/r0/rooms/:roomId/joined_members")
    public static async getRoomJoinedMembers (
        @RequestHeader(MATRIX_AUTHORIZATION_HEADER_NAME, {
            required: false,
            defaultValue: ''
        })
            token: string,
        @PathVariable('roomId', {required: true})
            roomId = ""
    ): Promise<ResponseEntity<ReadonlyJsonObject | {readonly error: string}>> {
        try {

            LOG.debug(`roomId = `, roomId);

            return ResponseEntity.ok(
                {
                    hello: 'world'
                } as unknown as ReadonlyJsonObject
            );

        } catch (err) {
            LOG.error(`ERROR: `, err);
            return ResponseEntity.internalServerError<{readonly error: string}>().body(
                createErrorDTO('Internal Server Error', 500)
            );
        }
    }

}
