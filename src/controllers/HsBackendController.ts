// Copyright (c) 2022. Heusala Group <info@heusalagroup.fi>. All rights reserved.

import {
    GetMapping,
    PathVariable,
    PostMapping,
    PutMapping,
    RequestBody,
    RequestHeader,
    RequestMapping,
    RequestParam
} from "../fi/hg/core/Request";
import { ReadonlyJsonObject } from "../fi/hg/core/Json";
import { ResponseEntity } from "../fi/hg/core/request/ResponseEntity";
import { LogService } from "../fi/hg/core/LogService";
import { MATRIX_AUTHORIZATION_HEADER_NAME } from "../fi/hg/matrix/constants/matrix-routes";
import { RequestParamValueType } from "../fi/hg/core/request/types/RequestParamValueType";
import { parseMatrixRegisterKind } from "../fi/hg/matrix/types/request/register/types/MatrixRegisterKind";
import { createSynapsePreRegisterResponseDTO } from "../fi/hg/matrix/types/synapse/SynapsePreRegisterResponseDTO";
import { isSynapseRegisterRequestDTO } from "../fi/hg/matrix/types/synapse/SynapseRegisterRequestDTO";
import { createSynapseRegisterResponseDTO, SynapseRegisterResponseDTO } from "../fi/hg/matrix/types/synapse/SynapseRegisterResponseDTO";
import { MatrixWhoAmIResponseDTO } from "../fi/hg/matrix/types/response/whoami/MatrixWhoAmIResponseDTO";
import { isMatrixLoginRequestDTO } from "../fi/hg/matrix/types/request/login/MatrixLoginRequestDTO";
import { createMatrixLoginResponseDTO, MatrixLoginResponseDTO } from "../fi/hg/matrix/types/response/login/MatrixLoginResponseDTO";
import { createMatrixDiscoveryInformationDTO } from "../fi/hg/matrix/types/response/login/types/MatrixDiscoveryInformationDTO";
import { createMatrixHomeServerDTO } from "../fi/hg/matrix/types/response/login/types/MatrixHomeServerDTO";
import { createMatrixIdentityServerInformationDTO } from "../fi/hg/matrix/types/response/login/types/MatrixIdentityServerInformationDTO";
import { createGetDirectoryRoomAliasResponseDTO, GetDirectoryRoomAliasResponseDTO } from "../fi/hg/matrix/types/response/directoryRoomAlias/GetDirectoryRoomAliasResponseDTO";
import { createMatrixRoomJoinedMembersDTO, MatrixRoomJoinedMembersDTO } from "../fi/hg/matrix/types/response/roomJoinedMembers/MatrixRoomJoinedMembersDTO";
import { createMatrixRoomJoinedMembersRoomMemberDTO } from "../fi/hg/matrix/types/response/roomJoinedMembers/types/MatrixRoomJoinedMembersRoomMemberDTO";
import { isMatrixMatrixRegisterRequestDTO } from "../fi/hg/matrix/types/request/register/MatrixRegisterRequestDTO";
import { createMatrixRegisterResponseDTO } from "../fi/hg/matrix/types/response/register/MatrixRegisterResponseDTO";
import { createGetRoomStateByTypeResponseDTO } from "../fi/hg/matrix/types/response/getRoomStateByType/GetRoomStateByTypeResponseDTO";
import { isSetRoomStateByTypeRequestDTO } from "../fi/hg/matrix/types/request/setRoomStateByType/SetRoomStateByTypeRequestDTO";
import { createPutRoomStateWithEventTypeResponseDTO, PutRoomStateWithEventTypeResponseDTO } from "../fi/hg/matrix/types/response/setRoomStateByType/PutRoomStateWithEventTypeResponseDTO";
import { isMatrixLeaveRoomRequestDTO } from "../fi/hg/matrix/types/request/leaveRoom/MatrixLeaveRoomRequestDTO";
import { createMatrixLeaveRoomResponseDTO } from "../fi/hg/matrix/types/response/leaveRoom/MatrixLeaveRoomResponseDTO";
import { isMatrixInviteToRoomRequestDTO } from "../fi/hg/matrix/types/request/inviteToRoom/MatrixInviteToRoomRequestDTO";
import { createMatrixInviteToRoomResponseDTO } from "../fi/hg/matrix/types/response/inviteToRoom/MatrixInviteToRoomResponseDTO";
import { isMatrixTextMessageDTO } from "../fi/hg/matrix/types/message/textMessage/MatrixTextMessageDTO";
import { createSendEventToRoomWithTnxIdResponseDTO } from "../fi/hg/matrix/types/response/sendEventToRoomWithTnxId/SendEventToRoomWithTnxIdResponseDTO";
import { explainMatrixCreateRoomDTO, isMatrixCreateRoomDTO } from "../fi/hg/matrix/types/request/createRoom/MatrixCreateRoomDTO";
import { createMatrixCreateRoomResponseDTO, MatrixCreateRoomResponseDTO } from "../fi/hg/matrix/types/response/createRoom/MatrixCreateRoomResponseDTO";
import { isMatrixJoinRoomRequestDTO } from "../fi/hg/matrix/types/request/joinRoom/MatrixJoinRoomRequestDTO";
import { createMatrixJoinRoomResponseDTO } from "../fi/hg/matrix/types/response/joinRoom/MatrixJoinRoomResponseDTO";
import { createMatrixSyncResponseDTO, MatrixSyncResponseDTO } from "../fi/hg/matrix/types/response/sync/MatrixSyncResponseDTO";
import { MatrixServerService } from "../fi/hg/matrix/server/MatrixServerService";
import { MatrixLoginType } from "../fi/hg/matrix/types/request/login/MatrixLoginType";
import { createMatrixErrorDTO, isMatrixErrorDTO, MatrixErrorDTO } from "../fi/hg/matrix/types/response/error/MatrixErrorDTO";
import { MatrixErrorCode } from "../fi/hg/matrix/types/response/error/types/MatrixErrorCode";
import { MatrixType } from "../fi/hg/matrix/types/core/MatrixType";
import { AuthorizationUtils } from "../fi/hg/core/AuthorizationUtils";
import { LogLevel } from "../fi/hg/core/types/LogLevel";
import { MatrixUtils } from "../fi/hg/matrix/MatrixUtils";

const LOG = LogService.createLogger('HsBackendController');

@RequestMapping("/")
export class HsBackendController {

    private static _matrixServer : MatrixServerService | undefined;

    public static setLogLevel (level: LogLevel) {
        LOG.setLogLevel(level);
    }

    public static setMatrixServer (value: MatrixServerService) {
        this._matrixServer = value;
    }

    @GetMapping("/")
    public static async getIndex (
        @RequestHeader(MATRIX_AUTHORIZATION_HEADER_NAME, {
            required: false,
            defaultValue: ''
        })
            accessHeader: string
    ): Promise<ResponseEntity<ReadonlyJsonObject | MatrixErrorDTO>> {
        try {
            return ResponseEntity.ok(
                {
                    hello: 'world'
                } as unknown as ReadonlyJsonObject
            );
        } catch (err) {
            LOG.error(`ERROR: `, err);
            return ResponseEntity.internalServerError<MatrixErrorDTO>().body(
                createMatrixErrorDTO(MatrixErrorCode.M_UNKNOWN,'Internal Server Error')
            );
        }
    }

    /**
     * @param accessHeader
     * @see https://github.com/heusalagroup/hghs/issues/1
     */
    @GetMapping("/_synapse/admin/v1/register")
    public static async getSynapseAdminRegister (
        @RequestHeader(MATRIX_AUTHORIZATION_HEADER_NAME, {
            required: false,
            defaultValue: ''
        })
            accessHeader: string
    ): Promise<ResponseEntity<ReadonlyJsonObject | MatrixErrorDTO>> {
        try {
            const nonce = await this._matrixServer.createAdminRegisterNonce();
            const response = createSynapsePreRegisterResponseDTO( nonce );
            return ResponseEntity.ok( response as unknown as ReadonlyJsonObject );
        } catch (err) {
            LOG.error(`ERROR: `, err);
            return ResponseEntity.internalServerError<MatrixErrorDTO>().body(
                createMatrixErrorDTO(MatrixErrorCode.M_UNKNOWN, 'Internal Server Error')
            );
        }
    }

    /**
     *
     * @param accessHeader
     * @param body
     * @see https://github.com/heusalagroup/hghs/issues/1
     */
    @PostMapping("/_synapse/admin/v1/register")
    public static async postSynapseAdminRegister (
        @RequestHeader(MATRIX_AUTHORIZATION_HEADER_NAME, {
            required: false,
            defaultValue: ''
        })
            accessHeader: string,
        @RequestBody
            body: ReadonlyJsonObject
    ): Promise<ResponseEntity<ReadonlyJsonObject | MatrixErrorDTO>> {
        try {
            if ( !isSynapseRegisterRequestDTO(body) ) {
                return ResponseEntity.badRequest<MatrixErrorDTO>().body(
                    createMatrixErrorDTO(MatrixErrorCode.M_UNKNOWN,`Body not AuthenticateEmailDTO`)
                ).status(400);
            }
            // @FIXME: Implement the end point
            const response : SynapseRegisterResponseDTO = createSynapseRegisterResponseDTO(
                'access_token',
                'user_id',
                'home_server',
                'device_id'
            );
            return ResponseEntity.ok( response as unknown as ReadonlyJsonObject );
        } catch (err) {
            LOG.error(`ERROR: `, err);
            return ResponseEntity.internalServerError<MatrixErrorDTO>().body(
                createMatrixErrorDTO(MatrixErrorCode.M_UNKNOWN, 'Internal Server Error')
            );
        }
    }

    /**
     *
     * @param accessHeader
     * @see https://github.com/heusalagroup/hghs/issues/2
     */
    @GetMapping("/_matrix/client/r0/account/whoami")
    public static async accountWhoAmI (
        @RequestHeader(MATRIX_AUTHORIZATION_HEADER_NAME, {
            required: false,
            defaultValue: ''
        })
        accessHeader: string
    ): Promise<ResponseEntity<ReadonlyJsonObject | MatrixErrorDTO>> {
        try {
            LOG.debug(`accountWhoAmI: accessHeader = `, accessHeader);
            const accessToken = AuthorizationUtils.parseBearerToken(accessHeader);
            LOG.debug(`accountWhoAmI: accessToken = `, accessToken);
            const dto : MatrixWhoAmIResponseDTO = await this._matrixServer.whoAmI(accessToken);
            LOG.debug(`accountWhoAmI: response = `, dto);
            return ResponseEntity.ok( dto as unknown as ReadonlyJsonObject );
        } catch (err) {
            LOG.error(`accountWhoAmI: ERROR: `, err);
            if (isMatrixErrorDTO(err)) {
                return ResponseEntity.badRequest<MatrixErrorDTO>().body(err).status(401);
            }
            return ResponseEntity.internalServerError<MatrixErrorDTO>().body(
                createMatrixErrorDTO(MatrixErrorCode.M_UNKNOWN, 'Internal Server Error')
            );
        }
    }

    /**
     *
     * @param accessHeader
     * @param body
     * @see https://github.com/heusalagroup/hghs/issues/3
     */
    @PostMapping("/_matrix/client/r0/login")
    public static async login (
        @RequestHeader(MATRIX_AUTHORIZATION_HEADER_NAME, {
            required: false,
            defaultValue: ''
        })
            accessHeader: string,
        @RequestBody
            body: ReadonlyJsonObject
    ): Promise<ResponseEntity<ReadonlyJsonObject | MatrixErrorDTO>> {
        try {

            if (!isMatrixLoginRequestDTO(body)) {
                return ResponseEntity.badRequest<MatrixErrorDTO>().body(
                    createMatrixErrorDTO(MatrixErrorCode.M_FORBIDDEN, `Body not MatrixLoginRequestDTO`)
                ).status(400);
            }

            if (body?.type !== MatrixLoginType.M_LOGIN_PASSWORD) {
                return ResponseEntity.badRequest<MatrixErrorDTO>().body(
                    createMatrixErrorDTO(MatrixErrorCode.M_UNKNOWN,`Only type ${MatrixLoginType.M_LOGIN_PASSWORD} supported`)
                ).status(400);
            }

            if ( body?.identifier && body?.identifier?.type !== MatrixType.M_ID_USER ) {
                return ResponseEntity.badRequest<MatrixErrorDTO>().body(
                    createMatrixErrorDTO(MatrixErrorCode.M_UNKNOWN,`Only identifier type ${MatrixType.M_ID_USER} supported`)
                ).status(400);
            }

            const user = body?.user ?? body?.identifier?.user;
            const password = body?.password;

            if ( !user || !password ) {
                return ResponseEntity.badRequest<MatrixErrorDTO>().body(
                    createMatrixErrorDTO(MatrixErrorCode.M_UNKNOWN,`User or password property not defined`)
                ).status(400);
            }

            const deviceId = body?.device_id;

            const accessToken = await this._matrixServer.loginWithPassword(user, password, deviceId);
            if (!accessToken) {
                return ResponseEntity.badRequest<MatrixErrorDTO>().body(
                    createMatrixErrorDTO(MatrixErrorCode.M_FORBIDDEN, `Access denied`)
                ).status(403);
            }

            const backendHostname = this._matrixServer.getHostName();
            const backendUrl = this._matrixServer.getURL();

            // @FIXME: Implement https://github.com/heusalagroup/hghs/issues/3
            const responseDto : MatrixLoginResponseDTO = createMatrixLoginResponseDTO(
                MatrixUtils.getUserId(user, backendHostname),
                accessToken,
                backendUrl,
                deviceId,
                createMatrixDiscoveryInformationDTO(
                    createMatrixHomeServerDTO(backendUrl),
                    createMatrixIdentityServerInformationDTO(backendUrl)
                )
            );

            return ResponseEntity.ok( responseDto as unknown as ReadonlyJsonObject );

        } catch (err) {
            LOG.error(`ERROR: `, err);
            return ResponseEntity.internalServerError<MatrixErrorDTO>().body(
                createMatrixErrorDTO(MatrixErrorCode.M_UNKNOWN, 'Internal Server Error')
            );
        }
    }

    /**
     *
     * @param accessHeader
     * @param roomAlias
     * @see https://github.com/heusalagroup/hghs/issues/4
     */
    @GetMapping("/_matrix/client/r0/directory/room/:roomAlias")
    public static async getDirectoryRoomByName (
        @RequestHeader(MATRIX_AUTHORIZATION_HEADER_NAME, {
            required: false,
            defaultValue: ''
        })
            accessHeader: string,
        @PathVariable('roomAlias', {required: true})
            roomAlias = ""
    ): Promise<ResponseEntity<ReadonlyJsonObject | MatrixErrorDTO>> {
        try {
            LOG.debug(`getDirectoryRoomByName: roomAlias = `, roomAlias);
            const response : GetDirectoryRoomAliasResponseDTO = createGetDirectoryRoomAliasResponseDTO(
                'room_id',
                ['server1']
            );
            return ResponseEntity.ok(
                response as unknown as ReadonlyJsonObject
            );
        } catch (err) {
            LOG.error(`ERROR: `, err);
            return ResponseEntity.internalServerError<MatrixErrorDTO>().body(
                createMatrixErrorDTO(MatrixErrorCode.M_UNKNOWN, 'Internal Server Error')
            );
        }
    }

    /**
     *
     * @param accessHeader
     * @param roomId
     * @see https://github.com/heusalagroup/hghs/issues/5
     */
    @GetMapping("/_matrix/client/r0/rooms/:roomId/joined_members")
    public static async getRoomJoinedMembers (
        @RequestHeader(MATRIX_AUTHORIZATION_HEADER_NAME, {
            required: false,
            defaultValue: ''
        })
            accessHeader: string,
        @PathVariable('roomId', {required: true})
            roomId = ""
    ): Promise<ResponseEntity<ReadonlyJsonObject | MatrixErrorDTO>> {
        try {

            LOG.debug(`getRoomJoinedMembers: roomId = `, roomId);

            const responseDto : MatrixRoomJoinedMembersDTO = createMatrixRoomJoinedMembersDTO(
                {
                    "user": createMatrixRoomJoinedMembersRoomMemberDTO("display_name", "avatar_url")
                }
            );

            return ResponseEntity.ok(
                responseDto as unknown as ReadonlyJsonObject
            );

        } catch (err) {
            LOG.error(`getRoomJoinedMembers: ERROR: `, err);
            return ResponseEntity.internalServerError<MatrixErrorDTO>().body(
                createMatrixErrorDTO(MatrixErrorCode.M_UNKNOWN, 'Internal Server Error')
            );
        }
    }

    /**
     *
     * @param accessHeader
     * @param kindString
     * @param body
     * @see https://github.com/heusalagroup/hghs/issues/6
     */
    @PostMapping("/_matrix/client/r0/register")
    public static async registerUser (
        @RequestHeader(MATRIX_AUTHORIZATION_HEADER_NAME, {
            required: false,
            defaultValue: ''
        })
            accessHeader: string,
        @RequestParam('kind', RequestParamValueType.STRING)
            kindString = "",
        @RequestBody
            body: ReadonlyJsonObject
    ): Promise<ResponseEntity<ReadonlyJsonObject | MatrixErrorDTO>> {
        try {

            const kind : string | undefined = parseMatrixRegisterKind(kindString);
            LOG.debug(`registerUser: kind = `, kind);

            if (!isMatrixMatrixRegisterRequestDTO(body)) {
                return ResponseEntity.badRequest<MatrixErrorDTO>().body(
                    createMatrixErrorDTO(MatrixErrorCode.M_UNKNOWN,`Body not MatrixMatrixRegisterRequestDTO`)
                ).status(400);
            }

            // @FIXME: Implement https://github.com/heusalagroup/hghs/issues/6
            const responseDto = createMatrixRegisterResponseDTO(
                'user_id',
                'access_token',
                'home_server',
                'device_id'
            );

            return ResponseEntity.ok(
                responseDto as unknown as ReadonlyJsonObject
            );

        } catch (err) {
            LOG.error(`registerUser: ERROR: `, err);
            return ResponseEntity.internalServerError<MatrixErrorDTO>().body(
                createMatrixErrorDTO(MatrixErrorCode.M_UNKNOWN, 'Internal Server Error')
            );
        }
    }

    /**
     *
     * @param accessHeader
     * @param roomId
     * @param eventType
     * @param stateKey
     * @see https://github.com/heusalagroup/hghs/issues/7
     */
    @GetMapping("/_matrix/client/r0/rooms/:roomId/state/:eventType/:stateKey")
    public static async getRoomStateByType (
        @RequestHeader(MATRIX_AUTHORIZATION_HEADER_NAME, {
            required: false,
            defaultValue: ''
        })
        accessHeader: string,
        @PathVariable('roomId', {required: true})
        roomId = "",
        @PathVariable('eventType', {required: true})
        eventType = "",
        @PathVariable('stateKey', {required: true})
        stateKey = ""
    ): Promise<ResponseEntity<ReadonlyJsonObject | MatrixErrorDTO>> {
        try {

            LOG.debug(`getRoomStateByType: roomId = `, roomId, eventType, stateKey);

            const responseDto = createGetRoomStateByTypeResponseDTO('roomName');

            return ResponseEntity.ok(
                responseDto as unknown as ReadonlyJsonObject
            );

        } catch (err) {
            LOG.error(`getRoomStateByType: ERROR: `, err);
            return ResponseEntity.internalServerError<MatrixErrorDTO>().body(
                createMatrixErrorDTO(MatrixErrorCode.M_UNKNOWN, 'Internal Server Error')
            );
        }
    }

    /**
     *
     * @param accessHeader
     * @param roomId
     * @param eventType
     * @param stateKey
     * @param body
     * @see https://github.com/heusalagroup/hghs/issues/8
     */
    @PutMapping("/_matrix/client/r0/rooms/:roomId/state/:eventType/:stateKey")
    public static async setRoomStateByType (
        @RequestHeader(MATRIX_AUTHORIZATION_HEADER_NAME, {
            required: false,
            defaultValue: ''
        })
        accessHeader: string,
        @PathVariable('roomId', {required: true})
        roomId = "",
        @PathVariable('eventType', {required: true})
        eventType = "",
        @PathVariable('stateKey', {required: true})
        stateKey = "",
        @RequestBody
        body: ReadonlyJsonObject
    ): Promise<ResponseEntity<ReadonlyJsonObject | MatrixErrorDTO>> {
        try {

            LOG.debug(`setRoomStateByType: roomId = `, roomId, eventType, stateKey);

            if (!isSetRoomStateByTypeRequestDTO(body)) {
                return ResponseEntity.badRequest<MatrixErrorDTO>().body(
                    createMatrixErrorDTO(MatrixErrorCode.M_UNKNOWN,`Body not SetRoomStateByTypeRequestDTO`)
                ).status(400);
            }

            // @todo: Implement https://github.com/heusalagroup/hghs/issues/8
            const responseDto : PutRoomStateWithEventTypeResponseDTO = createPutRoomStateWithEventTypeResponseDTO(
                eventType
            );

            return ResponseEntity.ok(
                responseDto as unknown as ReadonlyJsonObject
            );

        } catch (err) {
            LOG.error(`setRoomStateByType: ERROR: `, err);
            return ResponseEntity.internalServerError<MatrixErrorDTO>().body(
                createMatrixErrorDTO(MatrixErrorCode.M_UNKNOWN, 'Internal Server Error')
            );
        }
    }

    /**
     *
     * @param accessHeader
     * @param roomId
     * @see https://github.com/heusalagroup/hghs/issues/9
     */
    @PostMapping("/_matrix/client/r0/rooms/:roomId/forget")
    public static async forgetRoom (
        @RequestHeader(MATRIX_AUTHORIZATION_HEADER_NAME, {
            required: false,
            defaultValue: ''
        })
        accessHeader: string,
        @PathVariable('roomId', {required: true})
        roomId = ""
    ): Promise<ResponseEntity<ReadonlyJsonObject | MatrixErrorDTO>> {
        try {
            LOG.debug(`forgetRoom: roomId = `, roomId);
            // @FIXME: Implement https://github.com/heusalagroup/hghs/issues/9
            return ResponseEntity.ok(
                {} as unknown as ReadonlyJsonObject
            );
        } catch (err) {
            LOG.error(`forgetRoom: ERROR: `, err);
            return ResponseEntity.internalServerError<MatrixErrorDTO>().body(
                createMatrixErrorDTO(MatrixErrorCode.M_UNKNOWN, 'Internal Server Error')
            );
        }
    }

    /**
     *
     * @param accessHeader
     * @param roomId
     * @param body
     * @see https://github.com/heusalagroup/hghs/issues/10
     */
    @PostMapping("/_matrix/client/r0/rooms/:roomId/leave")
    public static async leaveRoom (
        @RequestHeader(MATRIX_AUTHORIZATION_HEADER_NAME, {
            required: false,
            defaultValue: ''
        })
        accessHeader: string,
        @PathVariable('roomId', {required: true})
        roomId = "",
        @RequestBody
        body: ReadonlyJsonObject
    ): Promise<ResponseEntity<ReadonlyJsonObject | MatrixErrorDTO>> {
        try {
            LOG.debug(`leaveRoom: roomId = `, roomId);
            if (!isMatrixLeaveRoomRequestDTO(body)) {
                return ResponseEntity.badRequest<MatrixErrorDTO>().body(
                    createMatrixErrorDTO(MatrixErrorCode.M_UNKNOWN,`Body not MatrixLeaveRoomRequestDTO`)
                ).status(400);
            }
            const responseDto = createMatrixLeaveRoomResponseDTO();
            return ResponseEntity.ok(
                responseDto as unknown as ReadonlyJsonObject
            );
        } catch (err) {
            LOG.error(`leaveRoom: ERROR: `, err);
            return ResponseEntity.internalServerError<MatrixErrorDTO>().body(
                createMatrixErrorDTO(MatrixErrorCode.M_UNKNOWN, 'Internal Server Error')
            );
        }
    }

    /**
     *
     * @param accessHeader
     * @param roomId
     * @param body
     * @see https://github.com/heusalagroup/hghs/issues/11
     */
    @PostMapping("/_matrix/client/r0/rooms/:roomId/invite")
    public static async inviteToRoom (
        @RequestHeader(MATRIX_AUTHORIZATION_HEADER_NAME, {
            required: false,
            defaultValue: ''
        })
        accessHeader: string,
        @PathVariable('roomId', {required: true})
        roomId = "",
        @RequestBody
        body: ReadonlyJsonObject
    ): Promise<ResponseEntity<ReadonlyJsonObject | MatrixErrorDTO>> {
        try {
            LOG.debug(`inviteToRoom: roomId = `, roomId);
            if (!isMatrixInviteToRoomRequestDTO(body)) {
                return ResponseEntity.badRequest<MatrixErrorDTO>().body(
                    createMatrixErrorDTO(MatrixErrorCode.M_UNKNOWN,`Body not MatrixInviteToRoomRequestDTO`)
                ).status(400);
            }
            // FIXME: Implement https://github.com/heusalagroup/hghs/issues/11
            const responseDto = createMatrixInviteToRoomResponseDTO();
            return ResponseEntity.ok(
                responseDto as unknown as ReadonlyJsonObject
            );
        } catch (err) {
            LOG.error(`inviteToRoom: ERROR: `, err);
            return ResponseEntity.internalServerError<MatrixErrorDTO>().body(
                createMatrixErrorDTO(MatrixErrorCode.M_UNKNOWN, 'Internal Server Error')
            );
        }
    }

    /**
     *
     * @param accessHeader
     * @param roomId
     * @param eventName
     * @param tnxId
     * @param body
     * @see https://github.com/heusalagroup/hghs/issues/12
     */
    @PutMapping("/_matrix/client/v3/rooms/:roomId/send/:eventName/:tnxId")
    public static async sendEventToRoomWithTnxId (
        @RequestHeader(MATRIX_AUTHORIZATION_HEADER_NAME, {
            required: false,
            defaultValue: ''
        })
        accessHeader: string,
        @PathVariable('roomId', {required: true})
        roomId = "",
        @PathVariable('eventName', {required: true})
        eventName = "",
        @PathVariable('tnxId', {required: true})
        tnxId = "",
        @RequestBody
        body: ReadonlyJsonObject
    ): Promise<ResponseEntity<ReadonlyJsonObject | MatrixErrorDTO>> {
        try {
            LOG.debug(`sendEventToRoomWithTnxId: roomId = `, roomId, eventName, tnxId);
            if (!isMatrixTextMessageDTO(body)) {
                return ResponseEntity.badRequest<MatrixErrorDTO>().body(
                    createMatrixErrorDTO(MatrixErrorCode.M_UNKNOWN,`Body not MatrixTextMessageDTO`)
                ).status(400);
            }
            // TODO: Implement https://github.com/heusalagroup/hghs/issues/12
            const responseDto = createSendEventToRoomWithTnxIdResponseDTO('event_id');
            return ResponseEntity.ok(
                responseDto as unknown as ReadonlyJsonObject
            );
        } catch (err) {
            LOG.error(`sendEventToRoomWithTnxId: ERROR: `, err);
            return ResponseEntity.internalServerError<MatrixErrorDTO>().body(
                createMatrixErrorDTO(MatrixErrorCode.M_UNKNOWN, 'Internal Server Error')
            );
        }
    }

    /**
     *
     * @param accessHeader
     * @param body
     * @see https://github.com/heusalagroup/hghs/issues/13
     */
    @PostMapping("/_matrix/client/r0/createRoom")
    public static async createRoom (
        @RequestHeader(MATRIX_AUTHORIZATION_HEADER_NAME, {
            required: false,
            defaultValue: ''
        })
            accessHeader: string,
        @RequestBody
            body: ReadonlyJsonObject
    ): Promise<ResponseEntity<ReadonlyJsonObject | MatrixErrorDTO>> {
        try {

            LOG.debug(`createRoom: body = `, body);
            if (!isMatrixCreateRoomDTO(body)) {
                LOG.debug(`Body invalid: ${explainMatrixCreateRoomDTO(body)}`);
                return ResponseEntity.badRequest<MatrixErrorDTO>().body(
                    createMatrixErrorDTO(MatrixErrorCode.M_UNKNOWN,`Body not MatrixCreateRoomDTO`)
                ).status(400);
            }

            LOG.debug(`createRoom: accessHeader = `, accessHeader);
            const accessToken = AuthorizationUtils.parseBearerToken(accessHeader);
            LOG.debug(`createRoom: accessToken = `, accessToken);

            LOG.debug(`createRoom: requestDto: `, body);
            const responseDto : MatrixCreateRoomResponseDTO = await this._matrixServer.createRoom(accessToken, body);
            LOG.debug(`createRoom: responseDto: `, body);
            return ResponseEntity.ok(
                responseDto as unknown as ReadonlyJsonObject
            );

        } catch (err) {
            LOG.error(`createRoom: ERROR: `, err);
            return ResponseEntity.internalServerError<MatrixErrorDTO>().body(
                createMatrixErrorDTO(MatrixErrorCode.M_UNKNOWN, 'Internal Server Error')
            );
        }
    }

    /**
     *
     * @param accessHeader
     * @param roomId
     * @param body
     * @see https://github.com/heusalagroup/hghs/issues/14
     */
    @PostMapping("/_matrix/client/r0/rooms/:roomId/join")
    public static async joinToRoom (
        @RequestHeader(MATRIX_AUTHORIZATION_HEADER_NAME, {
            required: false,
            defaultValue: ''
        })
            accessHeader: string,
        @PathVariable('roomId', {required: true})
            roomId = "",
        @RequestBody
            body: ReadonlyJsonObject
    ): Promise<ResponseEntity<ReadonlyJsonObject | MatrixErrorDTO>> {
        try {
            if (!isMatrixJoinRoomRequestDTO(body)) {
                return ResponseEntity.badRequest<MatrixErrorDTO>().body(
                    createMatrixErrorDTO(MatrixErrorCode.M_UNKNOWN,`Body not MatrixJoinRoomRequestDTO`)
                ).status(400);
            }
            LOG.debug(`joinToRoom: `, body);
            // FIXME: Implement https://github.com/heusalagroup/hghs/issues/14
            const responseDto = createMatrixJoinRoomResponseDTO('room_id');
            return ResponseEntity.ok(
                responseDto as unknown as ReadonlyJsonObject
            );
        } catch (err) {
            LOG.error(`joinToRoom: ERROR: `, err);
            return ResponseEntity.internalServerError<MatrixErrorDTO>().body(
                createMatrixErrorDTO(MatrixErrorCode.M_UNKNOWN, 'Internal Server Error')
            );
        }
    }

    /**
     *
     * @param accessHeader
     * @param filter
     * @param since
     * @param full_state
     * @param set_presence
     * @param timeout
     * @see https://github.com/heusalagroup/hghs/issues/15
     */
    @GetMapping("/_matrix/client/r0/sync")
    public static async sync (
        @RequestHeader(MATRIX_AUTHORIZATION_HEADER_NAME, {
            required: false,
            defaultValue: ''
        })
            accessHeader: string,
        @RequestParam('filter', RequestParamValueType.STRING)
            filter = "",
        @RequestParam('since', RequestParamValueType.STRING)
            since = "",
        @RequestParam('full_state', RequestParamValueType.STRING)
            full_state = "",
        @RequestParam('set_presence', RequestParamValueType.STRING)
            set_presence = "",
        @RequestParam('timeout', RequestParamValueType.STRING)
            timeout = ""
    ): Promise<ResponseEntity<ReadonlyJsonObject | MatrixErrorDTO>> {
        try {
            LOG.debug(`sync: `, filter, since, full_state, set_presence, timeout);
            const responseDto : MatrixSyncResponseDTO = createMatrixSyncResponseDTO(
                'next_batch'
            );
            return ResponseEntity.ok(
                responseDto as unknown as ReadonlyJsonObject
            );
        } catch (err) {
            LOG.error(`sync: ERROR: `, err);
            return ResponseEntity.internalServerError<MatrixErrorDTO>().body(
                createMatrixErrorDTO(MatrixErrorCode.M_UNKNOWN, 'Internal Server Error')
            );
        }
    }

}
