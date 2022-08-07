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
import { createMatrixWhoAmIResponseDTO } from "../fi/hg/matrix/types/response/whoami/MatrixWhoAmIResponseDTO";
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
import { explainMatrixCreateRoomDTO, isMatrixCreateRoomDTO, MatrixCreateRoomDTO } from "../fi/hg/matrix/types/request/createRoom/MatrixCreateRoomDTO";
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
import { UserRepositoryItem } from "../fi/hg/matrix/server/types/repository/user/UserRepositoryItem";
import { DeviceRepositoryItem } from "../fi/hg/matrix/server/types/repository/device/DeviceRepositoryItem";
import { MatrixRoomId } from "../fi/hg/matrix/types/core/MatrixRoomId";
import { parseMatrixRoomVersion } from "../fi/hg/matrix/types/MatrixRoomVersion";
import { MatrixVisibility, parseMatrixVisibility } from "../fi/hg/matrix/types/request/createRoom/types/MatrixVisibility";
import { MatrixRoomCreateEventDTO } from "../fi/hg/matrix/types/event/roomCreate/MatrixRoomCreateEventDTO";

const LOG = LogService.createLogger('HsBackendController');

export interface WhoAmIResult {
    readonly accessToken: string;
    readonly userId: string;
    readonly deviceId: string;
    readonly device: DeviceRepositoryItem;
}

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
            return this._handleException('getIndex', err);
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
            return this._handleException('getSynapseAdminRegister', err);
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
            return this._handleException('postSynapseAdminRegister', err);
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

            const {userId, deviceId, device} = await this._whoAmIFromAccessHeader(accessHeader);

            const user : UserRepositoryItem | undefined = await this._matrixServer.findUserById(userId);
            LOG.debug(`whoAmI: user = `, user);
            if (!user) {
                LOG.warn(`whoAmI: User not found: `, user, userId, deviceId);
                return ResponseEntity.badRequest<MatrixErrorDTO>().body(
                    createMatrixErrorDTO(MatrixErrorCode.M_UNKNOWN_TOKEN,'Unrecognised access token.')
                ).status(401);
            }

            const username = user?.username;
            LOG.debug(`whoAmI: username = `, username);

            const deviceIdentifier = device?.deviceId ?? device?.id;

            const dto = createMatrixWhoAmIResponseDTO(
                MatrixUtils.getUserId(username, this._matrixServer.getHostName()),
                deviceIdentifier ? deviceIdentifier : undefined,
                false
            );

            LOG.debug(`accountWhoAmI: response = `, dto);
            return ResponseEntity.ok( dto as unknown as ReadonlyJsonObject );

        } catch (err) {
            return this._handleException('accountWhoAmI', err);
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
            return this._handleException('login', err);
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
            return this._handleException('getDirectoryRoomByName', err);
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
            return this._handleException('getRoomJoinedMembers', err);
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
            return this._handleException('registerUser', err);
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
            return this._handleException('getRoomStateByType', err);
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
            return this._handleException('setRoomStateByType', err);
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
            return this._handleException('forgetRoom', err);
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
            return this._handleException('leaveRoom', err);
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
            return this._handleException('inviteToRoom', err);
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
            return this._handleException('sendEventToRoomWithTnxId', err);
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
            body: MatrixCreateRoomDTO
    ): Promise<ResponseEntity<MatrixCreateRoomResponseDTO | MatrixErrorDTO>> {
        try {

            LOG.debug(`createRoom: body = `, body);
            if (!isMatrixCreateRoomDTO(body)) {
                LOG.debug(`Body invalid: ${explainMatrixCreateRoomDTO(body)}`);
                return ResponseEntity.badRequest<MatrixErrorDTO>().body(
                    createMatrixErrorDTO(MatrixErrorCode.M_UNKNOWN,`Body not MatrixCreateRoomDTO`)
                ).status(400);
            }

            LOG.debug(`createRoom: accessHeader = `, accessHeader);
            const { userId, deviceId } = await this._whoAmIFromAccessHeader(accessHeader);

            const creationContent : Partial<MatrixRoomCreateEventDTO> | undefined = body?.creation_content;

            const visibility : MatrixVisibility = parseMatrixVisibility(body?.visibility) ?? MatrixVisibility.PRIVATE;
            const roomVersion = parseMatrixRoomVersion(body?.room_version) ?? this._matrixServer.getDefaultRoomVersion();

            LOG.debug(`createRoom: whoAmI: `, userId, deviceId);
            const {roomId} = await this._matrixServer.createRoom(userId, deviceId, roomVersion, visibility);

            await this._matrixServer.createRoomCreateEvent(
                userId,
                roomId,
                roomVersion,
                userId,
                creationContent
            );

            const matrixRoomId : MatrixRoomId = MatrixUtils.getRoomId(roomId, this._matrixServer.getHostName());
            LOG.debug(`createRoom: matrixRoomId: `, matrixRoomId);

            const responseDto : MatrixCreateRoomResponseDTO =  createMatrixCreateRoomResponseDTO(
                matrixRoomId,
                undefined
            );

            LOG.debug(`createRoom: responseDto: `, responseDto);
            return ResponseEntity.ok<MatrixCreateRoomResponseDTO>(responseDto);

        } catch (err) {
            return this._handleException('createRoom', err);
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
            return this._handleException('joinToRoom', err);
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
            return this._handleException('sync', err);
        }
    }

    /**
     * Verifies who is the requester using access token
     *
     * @param accessToken
     * @private
     */
    private static async _whoAmIFromAccessToken (accessToken: string) : Promise<WhoAmIResult> {

        LOG.debug(`whoAmI: accessToken = `, accessToken);
        if ( !accessToken ) {
            LOG.warn(`Warning! No authentication token provided.`);
            throw createMatrixErrorDTO(MatrixErrorCode.M_UNKNOWN_TOKEN, 'Unrecognised access token.');
        }

        const deviceId: string | undefined = await this._matrixServer.verifyAccessToken(accessToken);
        if (!deviceId) {
            throw createMatrixErrorDTO(MatrixErrorCode.M_UNKNOWN_TOKEN,'Unrecognised access token.') ;
        }

        const device = await this._matrixServer.findDeviceById(deviceId);
        if (!device) {
            LOG.warn(`whoAmI: Device not found: `, deviceId, accessToken);
            throw createMatrixErrorDTO(MatrixErrorCode.M_UNKNOWN_TOKEN,'Unrecognised access token.');
        }

        const userId = device?.userId;
        LOG.debug(`whoAmI: userId = `, userId);
        if (!userId) {
            LOG.warn(`whoAmI: User ID invalid: `, userId, deviceId, accessToken);
            throw createMatrixErrorDTO(MatrixErrorCode.M_UNKNOWN_TOKEN,'Unrecognised access token.');
        }

        return {
            accessToken,
            deviceId,
            device,
            userId
        };

    }

    /**
     * Verifies who is the requester using Bearer auth access header value
     *
     * @param accessHeader
     * @private
     */
    private static async _whoAmIFromAccessHeader (accessHeader: string) : Promise<WhoAmIResult> {
        LOG.debug(`_whoAmIFromAccessHeader: accessHeader = `, accessHeader);
        const accessToken = AuthorizationUtils.parseBearerToken(accessHeader);
        LOG.debug(`_whoAmIFromAccessHeader: accessToken = `, accessToken);
        return this._whoAmIFromAccessToken(accessToken);
    }

    /**
     * Handle exceptions
     *
     * @param callName
     * @param err
     * @private
     */
    private static _handleException (callName: string, err: any) : ResponseEntity<MatrixErrorDTO> {
        LOG.error(`${callName}: ERROR: `, err);
        if (isMatrixErrorDTO(err)) {
            return ResponseEntity.badRequest<MatrixErrorDTO>().body(err).status(401);
        }
        return ResponseEntity.internalServerError<MatrixErrorDTO>().body(
            createMatrixErrorDTO(MatrixErrorCode.M_UNKNOWN, 'Internal Server Error')
        );
    }

}
