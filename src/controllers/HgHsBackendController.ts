// Copyright (c) 2022. Heusala Group <info@heusalagroup.fi>. All rights reserved.

import {
    GetMapping,
    PathVariable,
    PostMapping, PutMapping,
    RequestHeader,
    RequestMapping,
    RequestParam
} from "../fi/hg/core/Request";
import { ReadonlyJsonObject } from "../fi/hg/core/Json";
import { ResponseEntity } from "../fi/hg/core/request/ResponseEntity";
import { LogService } from "../fi/hg/core/LogService";
import { MATRIX_AUTHORIZATION_HEADER_NAME } from "../fi/hg/matrix/constants/matrix-routes";
import { createErrorDTO } from "../fi/hg/core/types/ErrorDTO";
import { RequestParamValueType } from "../fi/hg/core/request/types/RequestParamValueType";
import { parseMatrixRegisterKind } from "../fi/hg/matrix/types/request/register/types/MatrixRegisterKind";

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

    @PostMapping("/_matrix/client/r0/register")
    public static async registerUser (
        @RequestHeader(MATRIX_AUTHORIZATION_HEADER_NAME, {
            required: false,
            defaultValue: ''
        })
            token: string,
        @RequestParam('kind', RequestParamValueType.STRING)
            kindString = ""
    ): Promise<ResponseEntity<ReadonlyJsonObject | {readonly error: string}>> {
        try {

            const kind : string | undefined = parseMatrixRegisterKind(kindString);
            LOG.debug(`kind = `, kind);

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

    @GetMapping("/_matrix/client/r0/rooms/:roomId/state/:eventType/:stateKey")
    public static async getRoomStateByType (
        @RequestHeader(MATRIX_AUTHORIZATION_HEADER_NAME, {
            required: false,
            defaultValue: ''
        })
        token: string,
        @PathVariable('roomId', {required: true})
        roomId = "",
        @PathVariable('eventType', {required: true})
        eventType = "",
        @PathVariable('stateKey', {required: true})
        stateKey = ""
    ): Promise<ResponseEntity<ReadonlyJsonObject | {readonly error: string}>> {
        try {

            LOG.debug(`roomId = `, roomId, eventType, stateKey);

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

    @PutMapping("/_matrix/client/r0/rooms/:roomId/state/:eventType/:stateKey")
    public static async setRoomStateByType (
        @RequestHeader(MATRIX_AUTHORIZATION_HEADER_NAME, {
            required: false,
            defaultValue: ''
        })
        token: string,
        @PathVariable('roomId', {required: true})
        roomId = "",
        @PathVariable('eventType', {required: true})
        eventType = "",
        @PathVariable('stateKey', {required: true})
        stateKey = ""
    ): Promise<ResponseEntity<ReadonlyJsonObject | {readonly error: string}>> {
        try {

            LOG.debug(`set: roomId = `, roomId, eventType, stateKey);

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

    @PostMapping("/_matrix/client/r0/rooms/:roomId/forget")
    public static async forgetRoom (
        @RequestHeader(MATRIX_AUTHORIZATION_HEADER_NAME, {
            required: false,
            defaultValue: ''
        })
        token: string,
        @PathVariable('roomId', {required: true})
        roomId = ""
    ): Promise<ResponseEntity<ReadonlyJsonObject | {readonly error: string}>> {
        try {

            LOG.debug(`set: roomId = `, roomId);

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

    @PostMapping("/_matrix/client/r0/rooms/:roomId/leave")
    public static async leaveRoom (
        @RequestHeader(MATRIX_AUTHORIZATION_HEADER_NAME, {
            required: false,
            defaultValue: ''
        })
        token: string,
        @PathVariable('roomId', {required: true})
        roomId = ""
    ): Promise<ResponseEntity<ReadonlyJsonObject | {readonly error: string}>> {
        try {

            LOG.debug(`leaveRoom: roomId = `, roomId);

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

    @PostMapping("/_matrix/client/r0/rooms/:roomId/invite")
    public static async inviteToRoom (
        @RequestHeader(MATRIX_AUTHORIZATION_HEADER_NAME, {
            required: false,
            defaultValue: ''
        })
        token: string,
        @PathVariable('roomId', {required: true})
        roomId = ""
    ): Promise<ResponseEntity<ReadonlyJsonObject | {readonly error: string}>> {
        try {

            LOG.debug(`inviteToRoom: roomId = `, roomId);

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

    @PutMapping("/_matrix/client/v3/rooms/:roomId/send/:eventName/:tnxId")
    public static async sendEventToRoomWithTnxId (
        @RequestHeader(MATRIX_AUTHORIZATION_HEADER_NAME, {
            required: false,
            defaultValue: ''
        })
        token: string,
        @PathVariable('roomId', {required: true})
        roomId = "",
        @PathVariable('eventName', {required: true})
        eventName = "",
        @PathVariable('tnxId', {required: true})
        tnxId = ""
    ): Promise<ResponseEntity<ReadonlyJsonObject | {readonly error: string}>> {
        try {

            LOG.debug(`sendEventToRoomWithTnxId: roomId = `, roomId, eventName, tnxId);

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

    @PostMapping("/_matrix/client/r0/createRoom")
    public static async createRoom (
        @RequestHeader(MATRIX_AUTHORIZATION_HEADER_NAME, {
            required: false,
            defaultValue: ''
        })
            token: string
    ): Promise<ResponseEntity<ReadonlyJsonObject | {readonly error: string}>> {
        try {

            LOG.debug(`createRoom`);

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
