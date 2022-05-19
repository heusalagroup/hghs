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
import { createErrorDTO, ErrorDTO } from "../fi/hg/core/types/ErrorDTO";
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
import { isMatrixCreateRoomDTO } from "../fi/hg/matrix/types/request/createRoom/MatrixCreateRoomDTO";
import { createMatrixCreateRoomResponseDTO } from "../fi/hg/matrix/types/response/createRoom/MatrixCreateRoomResponseDTO";
import { isMatrixJoinRoomRequestDTO } from "../fi/hg/matrix/types/request/joinRoom/MatrixJoinRoomRequestDTO";
import { createMatrixJoinRoomResponseDTO } from "../fi/hg/matrix/types/response/joinRoom/MatrixJoinRoomResponseDTO";
import { createMatrixSyncResponseDTO, MatrixSyncResponseDTO } from "../fi/hg/matrix/types/response/sync/MatrixSyncResponseDTO";
import { MatrixServerService } from "../fi/hg/matrix/server/MatrixServerService";

import { MemoryMatrixUserRepositoryService } from "../fi/hg/matrix/server/repository/memory/MemoryMatrixUserReposityService"
import { isMatrixUserId } from "../fi/hg/matrix/types/core/MatrixUserId";
import { DeviceModel } from "../fi/hg/matrix/server/types/DeviceModel";

const LOG = LogService.createLogger('HgHsBackendController');

@RequestMapping("/")
export class HgHsBackendController {

    private static _matrixServer : MatrixServerService | undefined;

    public static setMatrixServer (value: MatrixServerService) {
        this._matrixServer = value;
    }

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
            // @FIXME: Fix to use correct error DTO from Matrix Spec
            return ResponseEntity.internalServerError<{readonly error: string}>().body(
                createErrorDTO('Internal Server Error', 500)
            );
        }
    }

    /**
     * @param token
     * @see https://github.com/heusalagroup/hghs/issues/1
     */
    @GetMapping("/_fi.hg.hs/admin/v1/register")
    public static async getSynapseAdminRegister (
        @RequestHeader(MATRIX_AUTHORIZATION_HEADER_NAME, {
            required: false,
            defaultValue: ''
        })
            token: string
    ): Promise<ResponseEntity<ReadonlyJsonObject | {readonly error: string}>> {
        try {

            const nonce = await this._matrixServer.createAdminRegisterNonce();

            const response = createSynapsePreRegisterResponseDTO( nonce );

            return ResponseEntity.ok( response as unknown as ReadonlyJsonObject );

        } catch (err) {
            LOG.error(`ERROR: `, err);
            // @FIXME: Fix to use correct error DTO from Matrix Spec
            return ResponseEntity.internalServerError<{readonly error: string}>().body(
                createErrorDTO('Internal Server Error', 500)
            );
        }
    }

    /**
     *
     * @param token
     * @param body
     * @see https://github.com/heusalagroup/hghs/issues/1
     */
    @PostMapping("/_fi.hg.hs/admin/v1/register")
    public static async postSynapseAdminRegister (
        @RequestHeader(MATRIX_AUTHORIZATION_HEADER_NAME, {
            required: false,
            defaultValue: ''
        })
            token: string,
        @RequestBody
            body: ReadonlyJsonObject
    ): Promise<ResponseEntity<ReadonlyJsonObject | {readonly error: string}>> {
        try {

            // CLIENT:
            /*
            conts nonce = body.nonse;
            const admin = body.admin;
            const username = body.username;
            const displayname = body.displayname;
            const password = body.password;
            const mac = body.mac;
                const home_server = body.home_server; // URL:ista ?
                const device_id= body.device_id; // get where?
                const shared_secred = body.shared_secred; //pem ?
            */

            // clientilta tulevat tiedot VAIHDA OIKEIKSI ____________
            const nonce = process.env.NONCE;
            const admin = true;
            const home_server = process.env.HOME_SERVER;
            const device_id = process.env.DEVICE_ID;
            const shared_secret = process.env.SHARED_SECRET;

            // tarvitaan alla olevaan macin luontiin
            let isAdmin = body.admin ? "admin" : "noadmin";

            // sama koodi kuin simpleMatrixClient -helpottamaan oikean mac luontia jos tarvitaan johonkin
            let mac = await this._matrixServer.generateMac(shared_secret, nonce, body.username.toString(), body.password.toString(), isAdmin, 'None');
            // _________________________________________________________

            // crypt password 
            let salt = await this._matrixServer.createSalt();
            let hash = 64;
            let key = await this._matrixServer.createCryptoPassword(body.password, salt, hash);

            // username is like matrixUserId
            let matrixUserId: string = '@' + body.username.toString() + ':' + home_server.toString();
            if (!isMatrixUserId(matrixUserId)) {
                return ResponseEntity.badRequest<ErrorDTO>().body(
                    createErrorDTO(`userId not MatrixUserId`, 400)
                ).status(400);
            }

            // if Username exists allready
            let userExists = await MemoryMatrixUserRepositoryService.IfUsernameExist(matrixUserId);

            if (userExists) {
                return ResponseEntity.badRequest<ErrorDTO>().body(
                    createErrorDTO(`Username allready exist`, 400)
                ).status(400);
            }

            const registerAdmin = {
                "nonce": nonce, // body.nonce OIKEASTI
                "username": matrixUserId,
                "displayname": body.displayname,
                "password": key,
                "admin": body.admin,
                "mac": mac // body.mac
            }

            console.log(JSON.stringify(registerAdmin));

            if (!isSynapseRegisterRequestDTO(registerAdmin)) {
                // @FIXME: Fix to use correct error DTO from Matrix Spec
                return ResponseEntity.badRequest<ErrorDTO>().body(
                    createErrorDTO(`Body not AuthenticateEmailDTO`, 400)
                ).status(400);
            }

            let usersDevices: DeviceModel[] = [];

            usersDevices.push({ id: device_id });

            let newUserItem = {
                username: registerAdmin.username,
                password: registerAdmin.password,
                displayname: registerAdmin.displayname,
                homeserver: home_server,
                devices: usersDevices
            }

            // add User
            let user = await MemoryMatrixUserRepositoryService.createItem(newUserItem);
            console.log("USER: ", JSON.stringify(user));

            // TOKEN
            let access_token = await this._matrixServer.createToken(matrixUserId, device_id, shared_secret);

            // @FIXME: Implement the end point
            const response : SynapseRegisterResponseDTO = createSynapseRegisterResponseDTO(
                access_token,
                matrixUserId,
                home_server,
                device_id
            );

            return ResponseEntity.ok( response as unknown as ReadonlyJsonObject );

        } catch (err) {
            LOG.error(`ERROR: `, err);
            // @FIXME: Fix to use correct error DTO from Matrix Spec
            return ResponseEntity.internalServerError<{readonly error: string}>().body(
                createErrorDTO('Internal Server Error', 500)
            );
        }
    }

    /**
     *
     * @param token
     * @see https://github.com/heusalagroup/hghs/issues/2
     */
    @GetMapping("/_matrix/client/r0/account/whoami")
    public static async accountWhoAmI (
        @RequestHeader(MATRIX_AUTHORIZATION_HEADER_NAME, {
            required: false,
            defaultValue: ''
        })
            token: string
    ): Promise<ResponseEntity<ReadonlyJsonObject | {readonly error: string}>> {
        try {

            let thistoken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NTI5NjM2MTAsInVzZXJfaWQiOiJAa29pcnV1czpsb2NhbGhvc3QiLCJkZXZpY2VfaWQiOiJqMTJoeXQzNCIsImlhdCI6MTY1Mjk2MDAxMH0.GMhvO-n_frB3O7XdetiXZO37OvcX5tl1Tni45lfAnQE";

            let whoami = await this._matrixServer.whoami(thistoken);
            console.log("WHOAMI", JSON.stringify(whoami));


            // @FIXME: Implement https://github.com/heusalagroup/hghs/issues/2
            const response = createMatrixWhoAmIResponseDTO(
                whoami.user_id.toString(),
                whoami.device_id.toString(),
                false
            );

            return ResponseEntity.ok( response as unknown as ReadonlyJsonObject );

        } catch (err) {
            LOG.error(`ERROR: `, err);
            // @FIXME: Fix to use correct error DTO from Matrix Spec
            return ResponseEntity.internalServerError<{readonly error: string}>().body(
                createErrorDTO('Internal Server Error', 500)
            );
        }
    }

    /**
     *
     * @param token
     * @param body
     * @see https://github.com/heusalagroup/hghs/issues/3
     */
    @PostMapping("/_matrix/client/r0/login")
    public static async login (
        @RequestHeader(MATRIX_AUTHORIZATION_HEADER_NAME, {
            required: false,
            defaultValue: ''
        })
            token: string,
        @RequestBody
            body: ReadonlyJsonObject
    ): Promise<ResponseEntity<ReadonlyJsonObject | {readonly error: string}>> {
        try {

            // CLIENT:
            /*
                const home_server = body.home_server; // URL:ista ?
                const device_id= body.device_id; // get where?
                const shared_secred = body.shared_secred; //pem ?
            */
            //

            // clientilta tulevat tiedot VAIHDA OIKEIKSI ____________
            const home_server = process.env.HOME_SERVER;
            const device_id = body.device_id;
            const shared_secret = process.env.SHARED_SECRET;
            //------------------------------------------------


            /*
            {
                "identifier": {"type": "m.id.user","user":"@koiruus:localhost"},
                "initial_device_display_name": "Jungle Phone",
                "device_id": "testi",
                "address":"testi",
                "token": "45trhyy",
                "medium":"email",
                "password": "kissankuppi",
                "type": "m.login.password"
            }
             */

            if (!isMatrixLoginRequestDTO(body)) {
                // @FIXME: Fix to use correct error DTO from Matrix Spec
                return ResponseEntity.badRequest<ErrorDTO>().body(
                    createErrorDTO(`Body not AuthenticateEmailDTO`, 400)
                ).status(400);
            }

            // find user
            let loginUser = await MemoryMatrixUserRepositoryService.findByUsername(body.identifier.user);

            if (loginUser) {

                let hash = 64;
                let isPasswordValid: boolean = await this._matrixServer.isValidPassword(body.password, loginUser.password, hash);

                if (isPasswordValid === false) {
                    return ResponseEntity.badRequest<ErrorDTO>().body(
                        createErrorDTO(`Unauthorized, Wrong password`, 401)
                    ).status(400);
                }
                if (isPasswordValid === true) { //jos password validi

                    // if initial_device_display_name
                    if (body.initial_device_display_name) {

                        const newDevice = { id: device_id, name: body.initial_device_display_name };

                        // add new device
                        loginUser = await MemoryMatrixUserRepositoryService.createNewDevice(loginUser, newDevice);
                        // pitää lisätä arvo joka kertoo mikä device_id käytössä nyt ?

                    }
                    await MemoryMatrixUserRepositoryService.getAll();

                    //luodaan token
                    let access_token = await this._matrixServer.createToken(body.identifier.user, body.device_id, shared_secret);




            // @FIXME: Implement https://github.com/heusalagroup/hghs/issues/3
            const responseDto : MatrixLoginResponseDTO = createMatrixLoginResponseDTO(
                body.identifier.user,
                access_token,
                home_server,
                body.device_id, // mistä tulee ?
                createMatrixDiscoveryInformationDTO(
                    createMatrixHomeServerDTO('base_url'),
                    createMatrixIdentityServerInformationDTO('base_url')
                )
            );

            return ResponseEntity.ok( responseDto as unknown as ReadonlyJsonObject );

                } //jos kaikki meni ok
            } //jos kirjautunut käyttäjä
            else {
                return ResponseEntity.badRequest<ErrorDTO>().body(
                    createErrorDTO(`Unauthorized, Wrong user`, 401)
                ).status(400);
            }

        } catch (err) {
            LOG.error(`ERROR: `, err);
            // @FIXME: Fix to use correct error DTO from Matrix Spec
            return ResponseEntity.internalServerError<{readonly error: string}>().body(
                createErrorDTO('Internal Server Error', 500)
            );
        }
    }

    /**
     *
     * @param token
     * @param roomAlias
     * @see https://github.com/heusalagroup/hghs/issues/4
     */
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

            const response : GetDirectoryRoomAliasResponseDTO = createGetDirectoryRoomAliasResponseDTO(
                'room_id',
                ['server1']
            );

            return ResponseEntity.ok(
                response as unknown as ReadonlyJsonObject
            );

        } catch (err) {
            LOG.error(`ERROR: `, err);
            // @FIXME: Fix to use correct error DTO from Matrix Spec
            return ResponseEntity.internalServerError<{readonly error: string}>().body(
                createErrorDTO('Internal Server Error', 500)
            );
        }
    }

    /**
     *
     * @param token
     * @param roomId
     * @see https://github.com/heusalagroup/hghs/issues/5
     */
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

            const responseDto : MatrixRoomJoinedMembersDTO = createMatrixRoomJoinedMembersDTO(
                {
                    "user": createMatrixRoomJoinedMembersRoomMemberDTO("display_name", "avatar_url")
                }
            );

            return ResponseEntity.ok(
                responseDto as unknown as ReadonlyJsonObject
            );

        } catch (err) {
            LOG.error(`ERROR: `, err);
            // @FIXME: Fix to use correct error DTO from Matrix Spec
            return ResponseEntity.internalServerError<{readonly error: string}>().body(
                createErrorDTO('Internal Server Error', 500)
            );
        }
    }

    /**
     *
     * @param token
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
            token: string,
        @RequestParam('kind', RequestParamValueType.STRING)
            kindString = "",
        @RequestBody
            body: ReadonlyJsonObject
    ): Promise<ResponseEntity<ReadonlyJsonObject | {readonly error: string}>> {
        try {

            const kind : string | undefined = parseMatrixRegisterKind(kindString);
            LOG.debug(`kind = `, kind);

            if (!isMatrixMatrixRegisterRequestDTO(body)) {
                // @FIXME: Fix to use correct error DTO from Matrix Spec
                return ResponseEntity.badRequest<ErrorDTO>().body(
                    createErrorDTO(`Body not MatrixMatrixRegisterRequestDTO`, 400)
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
            LOG.error(`ERROR: `, err);
            // @FIXME: Fix to use correct error DTO from Matrix Spec
            return ResponseEntity.internalServerError<{readonly error: string}>().body(
                createErrorDTO('Internal Server Error', 500)
            );
        }
    }

    /**
     *
     * @param token
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

            const responseDto = createGetRoomStateByTypeResponseDTO('roomName');

            return ResponseEntity.ok(
                responseDto as unknown as ReadonlyJsonObject
            );

        } catch (err) {
            LOG.error(`ERROR: `, err);
            // @FIXME: Fix to use correct error DTO from Matrix Spec
            return ResponseEntity.internalServerError<{readonly error: string}>().body(
                createErrorDTO('Internal Server Error', 500)
            );
        }
    }

    /**
     *
     * @param token
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
        token: string,
        @PathVariable('roomId', {required: true})
        roomId = "",
        @PathVariable('eventType', {required: true})
        eventType = "",
        @PathVariable('stateKey', {required: true})
        stateKey = "",
        @RequestBody
        body: ReadonlyJsonObject
    ): Promise<ResponseEntity<ReadonlyJsonObject | {readonly error: string}>> {
        try {

            LOG.debug(`set: roomId = `, roomId, eventType, stateKey);

            if (!isSetRoomStateByTypeRequestDTO(body)) {
                // @FIXME: Fix to use correct error DTO from Matrix Spec
                return ResponseEntity.badRequest<ErrorDTO>().body(
                    createErrorDTO(`Body not SetRoomStateByTypeRequestDTO`, 400)
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
            LOG.error(`ERROR: `, err);
            // @FIXME: Fix to use correct error DTO from Matrix Spec
            return ResponseEntity.internalServerError<{readonly error: string}>().body(
                createErrorDTO('Internal Server Error', 500)
            );
        }
    }

    /**
     *
     * @param token
     * @param roomId
     * @see https://github.com/heusalagroup/hghs/issues/9
     */
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

            // @FIXME: Implement https://github.com/heusalagroup/hghs/issues/9
            return ResponseEntity.ok(
                {} as unknown as ReadonlyJsonObject
            );

        } catch (err) {
            LOG.error(`ERROR: `, err);
            // @FIXME: Fix to use correct error DTO from Matrix Spec
            return ResponseEntity.internalServerError<{readonly error: string}>().body(
                createErrorDTO('Internal Server Error', 500)
            );
        }
    }

    /**
     *
     * @param token
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
        token: string,
        @PathVariable('roomId', {required: true})
        roomId = "",
        @RequestBody
        body: ReadonlyJsonObject
    ): Promise<ResponseEntity<ReadonlyJsonObject | {readonly error: string}>> {
        try {

            LOG.debug(`leaveRoom: roomId = `, roomId);

            if (!isMatrixLeaveRoomRequestDTO(body)) {
                // @FIXME: Fix to use correct error DTO from Matrix Spec
                return ResponseEntity.badRequest<ErrorDTO>().body(
                    createErrorDTO(`Body not MatrixLeaveRoomRequestDTO`, 400)
                ).status(400);
            }

            const responseDto = createMatrixLeaveRoomResponseDTO();

            return ResponseEntity.ok(
                responseDto as unknown as ReadonlyJsonObject
            );

        } catch (err) {
            LOG.error(`ERROR: `, err);
            // @FIXME: Fix to use correct error DTO from Matrix Spec
            return ResponseEntity.internalServerError<{readonly error: string}>().body(
                createErrorDTO('Internal Server Error', 500)
            );
        }
    }

    /**
     *
     * @param token
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
        token: string,
        @PathVariable('roomId', {required: true})
        roomId = "",
        @RequestBody
        body: ReadonlyJsonObject
    ): Promise<ResponseEntity<ReadonlyJsonObject | {readonly error: string}>> {
        try {

            LOG.debug(`inviteToRoom: roomId = `, roomId);

            if (!isMatrixInviteToRoomRequestDTO(body)) {
                // @FIXME: Fix to use correct error DTO from Matrix Spec
                return ResponseEntity.badRequest<ErrorDTO>().body(
                    createErrorDTO(`Body not MatrixInviteToRoomRequestDTO`, 400)
                ).status(400);
            }

            // FIXME: Implement https://github.com/heusalagroup/hghs/issues/11
            const responseDto = createMatrixInviteToRoomResponseDTO();

            return ResponseEntity.ok(
                responseDto as unknown as ReadonlyJsonObject
            );

        } catch (err) {
            LOG.error(`ERROR: `, err);
            // @FIXME: Fix to use correct error DTO from Matrix Spec
            return ResponseEntity.internalServerError<{readonly error: string}>().body(
                createErrorDTO('Internal Server Error', 500)
            );
        }
    }

    /**
     *
     * @param token
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
        token: string,
        @PathVariable('roomId', {required: true})
        roomId = "",
        @PathVariable('eventName', {required: true})
        eventName = "",
        @PathVariable('tnxId', {required: true})
        tnxId = "",
        @RequestBody
        body: ReadonlyJsonObject
    ): Promise<ResponseEntity<ReadonlyJsonObject | {readonly error: string}>> {
        try {

            LOG.debug(`sendEventToRoomWithTnxId: roomId = `, roomId, eventName, tnxId);

            if (!isMatrixTextMessageDTO(body)) {
                // @FIXME: Fix to use correct error DTO from Matrix Spec
                return ResponseEntity.badRequest<ErrorDTO>().body(
                    createErrorDTO(`Body not MatrixTextMessageDTO`, 400)
                ).status(400);
            }

            // TODO: Implement https://github.com/heusalagroup/hghs/issues/12
            const responseDto = createSendEventToRoomWithTnxIdResponseDTO('event_id');

            return ResponseEntity.ok(
                responseDto as unknown as ReadonlyJsonObject
            );

        } catch (err) {
            LOG.error(`ERROR: `, err);
            // @FIXME: Fix to use correct error DTO from Matrix Spec
            return ResponseEntity.internalServerError<{readonly error: string}>().body(
                createErrorDTO('Internal Server Error', 500)
            );
        }
    }

    /**
     *
     * @param token
     * @param body
     * @see https://github.com/heusalagroup/hghs/issues/13
     */
    @PostMapping("/_matrix/client/r0/createRoom")
    public static async createRoom (
        @RequestHeader(MATRIX_AUTHORIZATION_HEADER_NAME, {
            required: false,
            defaultValue: ''
        })
            token: string,
        @RequestBody
            body: ReadonlyJsonObject
    ): Promise<ResponseEntity<ReadonlyJsonObject | {readonly error: string}>> {
        try {

            if (!isMatrixCreateRoomDTO(body)) {
                // @FIXME: Fix to use correct error DTO from Matrix Spec
                return ResponseEntity.badRequest<ErrorDTO>().body(
                    createErrorDTO(`Body not MatrixCreateRoomDTO`, 400)
                ).status(400);
            }

            LOG.debug(`createRoom:`, body);

            // FIXME: Implement https://github.com/heusalagroup/hghs/issues/13
            const responseDto = createMatrixCreateRoomResponseDTO(
                'room_id',
                undefined
            );

            return ResponseEntity.ok(
                responseDto as unknown as ReadonlyJsonObject
            );

        } catch (err) {
            LOG.error(`ERROR: `, err);
            // @FIXME: Fix to use correct error DTO from Matrix Spec
            return ResponseEntity.internalServerError<{readonly error: string}>().body(
                createErrorDTO('Internal Server Error', 500)
            );
        }
    }

    /**
     *
     * @param token
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
            token: string,
        @PathVariable('roomId', {required: true})
            roomId = "",
        @RequestBody
            body: ReadonlyJsonObject
    ): Promise<ResponseEntity<ReadonlyJsonObject | {readonly error: string}>> {
        try {

            if (!isMatrixJoinRoomRequestDTO(body)) {
                // @FIXME: Fix to use correct error DTO from Matrix Spec
                return ResponseEntity.badRequest<ErrorDTO>().body(
                    createErrorDTO(`Body not MatrixJoinRoomRequestDTO`, 400)
                ).status(400);
            }

            LOG.debug(`joinToRoom: `, body);

            // FIXME: Implement https://github.com/heusalagroup/hghs/issues/14
            const responseDto = createMatrixJoinRoomResponseDTO('room_id');

            return ResponseEntity.ok(
                responseDto as unknown as ReadonlyJsonObject
            );

        } catch (err) {
            LOG.error(`ERROR: `, err);
            // @FIXME: Fix to use correct error DTO from Matrix Spec
            return ResponseEntity.internalServerError<{readonly error: string}>().body(
                createErrorDTO('Internal Server Error', 500)
            );
        }
    }

    /**
     *
     * @param token
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
            token: string,
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
    ): Promise<ResponseEntity<ReadonlyJsonObject | {readonly error: string}>> {
        try {

            LOG.debug(`sync: `, filter, since, full_state, set_presence, timeout);

            const responseDto : MatrixSyncResponseDTO = createMatrixSyncResponseDTO(
                'next_batch'
            );

            return ResponseEntity.ok(
                responseDto as unknown as ReadonlyJsonObject
            );

        } catch (err) {
            LOG.error(`ERROR: `, err);
            // @FIXME: Fix to use correct error DTO from Matrix Spec
            return ResponseEntity.internalServerError<{readonly error: string}>().body(
                createErrorDTO('Internal Server Error', 500)
            );
        }
    }

}
