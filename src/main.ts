// Copyright (c) 2022. Heusala Group <info@heusalagroup.fi>. All rights reserved.

import { ProcessUtils } from "./fi/hg/core/ProcessUtils";

// Must be first import to define environment variables before anything else
ProcessUtils.initEnvFromDefaultFiles();

import {
    BACKEND_SCRIPT_NAME,
    BACKEND_LOG_LEVEL,
    BACKEND_URL,
    BACKEND_HOSTNAME,
    BACKEND_IO_SERVER,
    BACKEND_JWT_SECRET,
    BACKEND_JWT_ALG,
    BACKEND_DEFAULT_LANGUAGE,
    BACKEND_EMAIL_FROM,
    BACKEND_EMAIL_CONFIG,
    BACKEND_ACCESS_TOKEN_EXPIRATION_TIME,
    BACKEND_INITIAL_USERS
} from "./constants/runtime";

import { LogService } from "./fi/hg/core/LogService";
import { LogLevel } from "./fi/hg/core/types/LogLevel";

LogService.setLogLevel(BACKEND_LOG_LEVEL);

import { CommandExitStatus } from "./fi/hg/core/cmd/types/CommandExitStatus";
import { RequestClient } from "./fi/hg/core/RequestClient";
import { CommandArgumentUtils } from "./fi/hg/core/cmd/utils/CommandArgumentUtils";
import { ParsedCommandArgumentStatus } from "./fi/hg/core/cmd/types/ParsedCommandArgumentStatus";
import { RequestServer } from "./fi/hg/core/RequestServer";
import { HsBackendController } from "./controllers/HsBackendController";
import { RequestRouter } from "./fi/hg/core/requestServer/RequestRouter";
import { Headers } from "./fi/hg/core/request/Headers";
import { BUILD_USAGE_URL, BUILD_WITH_FULL_USAGE } from "./constants/build";
import { MatrixServerService } from "./fi/hg/matrix/server/MatrixServerService";
import { RepositoryType } from "./fi/hg/core/simpleRepository/types/RepositoryType";
import { parseInteger, startsWith } from "./fi/hg/core/modules/lodash";
import { MatrixSharedClientService } from "./fi/hg/matrix/MatrixSharedClientService";
import { MemorySharedClientService } from "./fi/hg/core/simpleRepository/MemorySharedClientService";
import { isStoredDeviceRepositoryItem, StoredDeviceRepositoryItem } from "./fi/hg/matrix/server/types/repository/device/StoredDeviceRepositoryItem";
import { DeviceRepositoryService } from "./fi/hg/matrix/server/types/repository/device/DeviceRepositoryService";
import { IO_DEVICE_ROOM_TYPE, IO_EVENT_ROOM_TYPE, IO_ROOM_ROOM_TYPE, IO_USER_ROOM_TYPE } from "./constants/io";
import { StoredRepositoryItem, StoredRepositoryItemTestCallback } from "./fi/hg/core/simpleRepository/types/StoredRepositoryItem";
import { MatrixRepositoryInitializer } from "./fi/hg/matrix/MatrixRepositoryInitializer";
import { MemoryRepositoryInitializer } from "./fi/hg/core/simpleRepository/MemoryRepositoryInitializer";
import { isStoredUserRepositoryItem, StoredUserRepositoryItem } from "./fi/hg/matrix/server/types/repository/user/StoredUserRepositoryItem";
import { UserRepositoryService } from "./fi/hg/matrix/server/types/repository/user/UserRepositoryService";
import { RoomRepositoryService } from "./fi/hg/matrix/server/types/repository/room/RoomRepositoryService";
import { isStoredRoomRepositoryItem, StoredRoomRepositoryItem } from "./fi/hg/matrix/server/types/repository/room/StoredRoomRepositoryItem";
import { isStoredEventRepositoryItem, StoredEventRepositoryItem } from "./fi/hg/matrix/server/types/repository/event/StoredEventRepositoryItem";
import { EventRepositoryService } from "./fi/hg/matrix/server/types/repository/event/EventRepositoryService";
import { JwtService } from "./fi/hg/backend/JwtService";
import { BackendTranslationService } from "./fi/hg/backend/BackendTranslationService";
import { Language, parseLanguage } from "./fi/hg/core/types/Language";
import { TRANSLATIONS } from "./fi/hg/core/translations";
import { EmailService } from "./fi/hg/backend/EmailService";

const LOG = LogService.createLogger('main');

export async function main (
    args: string[] = []
) : Promise<CommandExitStatus> {

    try {

        Headers.setLogLevel(LogLevel.INFO);
        RequestRouter.setLogLevel(LogLevel.INFO);
        RequestClient.setLogLevel(LogLevel.INFO);
        RequestServer.setLogLevel(LogLevel.INFO);

        LOG.debug(`Loglevel as ${LogService.getLogLevelString()}`);

        const {scriptName, parseStatus, exitStatus, errorString} = CommandArgumentUtils.parseArguments(BACKEND_SCRIPT_NAME, args);

        if ( parseStatus === ParsedCommandArgumentStatus.HELP || parseStatus === ParsedCommandArgumentStatus.VERSION ) {
            console.log(getMainUsage(scriptName));
            return exitStatus;
        }

        if (errorString) {
            console.error(`ERROR: ${errorString}`);
            return exitStatus;
        }

        const jwtService = new JwtService();
        const jwtEngine = jwtService.createJwtEngine(BACKEND_JWT_SECRET, BACKEND_JWT_ALG);

        const emailService = new EmailService(BACKEND_EMAIL_FROM);

        const defaultLanguage : Language = parseLanguage(BACKEND_DEFAULT_LANGUAGE) ?? Language.ENGLISH;

        const repositoryType : RepositoryType = startsWith(BACKEND_IO_SERVER, 'memory:') ? RepositoryType.MEMORY : RepositoryType.MATRIX;

        const matrixSharedClientService = new MatrixSharedClientService();
        const memorySharedClientService = new MemorySharedClientService();

        // Device repository
        const deviceRepositoryService = await constructRepository<StoredDeviceRepositoryItem>(
            repositoryType,
            isStoredDeviceRepositoryItem,
            IO_DEVICE_ROOM_TYPE,
            matrixSharedClientService,
            memorySharedClientService,
            DeviceRepositoryService
        );

        // User repository
        const userRepositoryService = await constructRepository<StoredUserRepositoryItem>(
            repositoryType,
            isStoredUserRepositoryItem,
            IO_USER_ROOM_TYPE,
            matrixSharedClientService,
            memorySharedClientService,
            UserRepositoryService
        );

        // Room repository
        const roomRepositoryService = await constructRepository<StoredRoomRepositoryItem>(
            repositoryType,
            isStoredRoomRepositoryItem,
            IO_ROOM_ROOM_TYPE,
            matrixSharedClientService,
            memorySharedClientService,
            RoomRepositoryService
        );

        // Event repository
        const eventRepositoryService = await constructRepository<StoredEventRepositoryItem>(
            repositoryType,
            isStoredEventRepositoryItem,
            IO_EVENT_ROOM_TYPE,
            matrixSharedClientService,
            memorySharedClientService,
            EventRepositoryService
        );

        const matrixServer : MatrixServerService = new MatrixServerService(
            BACKEND_HOSTNAME,
            deviceRepositoryService,
            userRepositoryService,
            roomRepositoryService,
            eventRepositoryService,
            jwtEngine,
            parseInteger(BACKEND_ACCESS_TOKEN_EXPIRATION_TIME)
        );

        // Start initializing

        await BackendTranslationService.initialize(defaultLanguage, TRANSLATIONS);

        emailService.initialize(BACKEND_EMAIL_CONFIG);

        // Initialize repositories
        if (repositoryType === RepositoryType.MATRIX) {
            await matrixSharedClientService.initialize(BACKEND_IO_SERVER);
        } else if (repositoryType === RepositoryType.MEMORY) {
            await memorySharedClientService.initialize(BACKEND_IO_SERVER);
        }
        await deviceRepositoryService.initialize();
        await userRepositoryService.initialize();
        await roomRepositoryService.initialize();
        await eventRepositoryService.initialize();

        await matrixServer.initialize();

        if ( BACKEND_INITIAL_USERS ) {
            const users = BACKEND_INITIAL_USERS.split(';');
            LOG.debug(`Creating initial users from "${BACKEND_INITIAL_USERS}": `, users);
            let i = 0;
            for (; i<users.length; i+=1) {
                const parts = users[i].split(':');
                const username = parts.shift();
                const password = parts.join(':');
                if (username && password) {
                    LOG.debug(`Creating initial user: "${username}"`);
                    const user = await matrixServer.createUser(
                        username,
                        password
                    );
                    LOG.info(`Created initial user: "${username}" as ID "${user.id}"`);
                }
            }
        } else {
            LOG.debug(`No initial users defined. Will not create users.`);
        }

        HsBackendController.setMatrixServer(matrixServer);

        const server = new RequestServer(BACKEND_URL);
        server.attachController(HsBackendController);
        server.start();

        let serverListener : any = undefined;

        const stopPromise = new Promise<void>((resolve, reject) => {
            try {
                LOG.debug('Stopping server from RequestServer stop event');
                serverListener = server.on(RequestServer.Event.STOPPED, () => {
                    serverListener = undefined;
                    resolve();
                });
            } catch(err) {
                reject(err);
            }
        });

        ProcessUtils.setupDestroyHandler( () => {

            LOG.debug('Stopping server from process utils event');

            server.stop();

            if (serverListener) {
                serverListener();
                serverListener = undefined;
            }

        }, (err : any) => {
            LOG.error('Error while shutting down the service: ', err);
        });

        await stopPromise;

        return CommandExitStatus.OK;

    } catch (err) {
        LOG.error(`Fatal error: `, err);
        return CommandExitStatus.FATAL_ERROR;
    }

}

/**
 *
 * @param scriptName
 * @nosideeffects
 * @__PURE__
 */
export function getMainUsage (
    scriptName: string
): string {

    /* @__PURE__ */if ( /* @__PURE__ */BUILD_WITH_FULL_USAGE ) {

        return `USAGE: ${/* @__PURE__ */scriptName} [OPT(s)] ARG(1) [...ARG(N)]

  HG Oy backend.
  
...and OPT is one of:

    -h --help          Print help
    -v --version       Print version
    --                 Disables option parsing

  Environment variables:

    BACKEND_LOG_LEVEL as one of:
    
      ALL
      DEBUG
      INFO
      WARN
      ERROR
      NONE
`;
    } else {
        return `USAGE: ${/* @__PURE__ */scriptName} ARG(1) [...ARG(N)]
See ${/* @__PURE__ */BUILD_USAGE_URL}
`;
    }
}

async function constructRepository<T extends StoredRepositoryItem> (
    repositoryType      : RepositoryType,
    isT                 : StoredRepositoryItemTestCallback,
    matrixRoomType      : string,
    matrixClientService : MatrixSharedClientService,
    memoryClientService : MemorySharedClientService,
    ItemRepositoryService : any
) : Promise<any> {

    if (repositoryType === RepositoryType.MATRIX) {
        const matrixRepositoryInitializer = new MatrixRepositoryInitializer<T>( matrixRoomType, isT );
        return new ItemRepositoryService(matrixClientService, matrixRepositoryInitializer);
    }

    if (repositoryType === RepositoryType.MEMORY) {
        const memoryRepositoryInitializer = new MemoryRepositoryInitializer<T>( isT );
        return new ItemRepositoryService(memoryClientService, memoryRepositoryInitializer);
    }

    throw new TypeError(`Repository type not supported: ${repositoryType}`);
}
