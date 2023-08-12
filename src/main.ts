// Copyright (c) 2022-2023. Heusala Group <info@heusalagroup.fi>. All rights reserved.

import { BackendTranslationServiceImpl } from "./fi/hg/backend/BackendTranslationServiceImpl";
import { EmailServiceImpl } from "./fi/hg/backend/EmailServiceImpl";
import { JwtEncodeServiceImpl } from "./fi/hg/backend/JwtEncodeServiceImpl";
import { EmailService } from "./fi/hg/core/email/EmailService";
import { JwtEncodeService } from "./fi/hg/core/jwt/JwtEncodeService";
import { JwtEngine } from "./fi/hg/core/jwt/JwtEngine";
import { ProcessUtils } from "./fi/hg/core/ProcessUtils";

// Must be first import to define environment variables before anything else
ProcessUtils.initEnvFromDefaultFiles();

import {
    BACKEND_SCRIPT_NAME,
    BACKEND_LOG_LEVEL,
    BACKEND_URL,
    BACKEND_HOSTNAME,
    BACKEND_JWT_SECRET,
    BACKEND_JWT_ALG,
    BACKEND_DEFAULT_LANGUAGE,
    BACKEND_EMAIL_FROM,
    BACKEND_EMAIL_CONFIG,
    BACKEND_ACCESS_TOKEN_EXPIRATION_TIME,
    BACKEND_INITIAL_USERS, BACKEND_PUBLIC_URL, FEDERATION_URL
} from "./constants/runtime";
import {
    BUILD_USAGE_URL,
    BUILD_WITH_FULL_USAGE
} from "./constants/build";

import { LogService } from "./fi/hg/core/LogService";
import { RequestClientImpl } from "./fi/hg/core/RequestClientImpl";
import { RequestServer } from "./fi/hg/core/RequestServer";
import { RequestRouterImpl } from "./fi/hg/core/requestServer/RequestRouterImpl";
import { LogLevel } from "./fi/hg/core/types/LogLevel";

LogService.setLogLevel(BACKEND_LOG_LEVEL);

import { TRANSLATIONS } from "./fi/hg/core/translations";

import { Headers } from "./fi/hg/core/request/types/Headers";
Headers.setLogLevel(LogLevel.INFO);

import { CommandExitStatus } from "./fi/hg/core/cmd/types/CommandExitStatus";
import { CommandArgumentUtils } from "./fi/hg/core/cmd/utils/CommandArgumentUtils";
import { ParsedCommandArgumentStatus } from "./fi/hg/core/cmd/types/ParsedCommandArgumentStatus";
import { Language, parseLanguage } from "./fi/hg/core/types/Language";
import { StaticRoutes } from "./fi/hg/core/requestServer/types/StaticRoutes";
import { parseInteger } from "./fi/hg/core/types/Number";
import { MatrixServerService } from "./fi/hg/matrix/server/MatrixServerService";
import { HsBackendController } from "./controllers/HsBackendController";
import { ServerServiceImpl } from "./fi/hg/node/requestServer/ServerServiceImpl";
import { RequestServerImpl } from "./fi/hg/node/RequestServerImpl";

const LOG = LogService.createLogger('main');

export async function main (
    args: string[] = []
) : Promise<CommandExitStatus> {

    try {

        RequestRouterImpl.setLogLevel(LogLevel.INFO);
        RequestClientImpl.setLogLevel(LogLevel.INFO);
        // RequestServer.setLogLevel(LogLevel.INFO);
        StaticRoutes.setLogLevel(LogLevel.INFO);
        HsBackendController.setLogLevel(LogLevel.DEBUG);
        MatrixServerService.setLogLevel(LogLevel.DEBUG);

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

        const jwtService : JwtEncodeService = JwtEncodeServiceImpl.create();
        const jwtEngine : JwtEngine = jwtService.createJwtEngine(BACKEND_JWT_SECRET, BACKEND_JWT_ALG);

        const emailService : EmailService = EmailServiceImpl.create(BACKEND_EMAIL_FROM);

        const defaultLanguage : Language = parseLanguage(BACKEND_DEFAULT_LANGUAGE) ?? Language.ENGLISH;

        const matrixServer : MatrixServerService = new MatrixServerService(
            BACKEND_PUBLIC_URL,
            BACKEND_HOSTNAME,
            jwtEngine,
            parseInteger(BACKEND_ACCESS_TOKEN_EXPIRATION_TIME)
        );

        // Start initializing

        await BackendTranslationServiceImpl.initialize(defaultLanguage, TRANSLATIONS);

        emailService.initialize(BACKEND_EMAIL_CONFIG);

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

        const server: RequestServer = RequestServerImpl.create(
            ServerServiceImpl.create(BACKEND_URL),
            RequestRouterImpl.create(),
        );

        const fedServer: RequestServer = RequestServerImpl.create(
            ServerServiceImpl.create(FEDERATION_URL),
            RequestRouterImpl.create(),
        );

        server.attachController(HsBackendController);
        fedServer.attachController(HsBackendController);

        server.start();
        fedServer.start();

        let serverListener : any = undefined;
        const stopPromise = new Promise<void>((resolve, reject) => {
            try {
                serverListener = server.on(RequestServerImpl.Event.STOPPED, () => {
                    LOG.debug('Stopping backend server from RequestServer stop event');
                    serverListener = undefined;
                    fedServer.stop();
                    resolve();
                });
            } catch(err) {
                reject(err);
            }
        });

        let fedServerListener : any = undefined;
        const fedStopPromise= new Promise<void>((resolve, reject) => {
            try {
                fedServerListener = fedServer.on(RequestServerImpl.Event.STOPPED, () => {
                    LOG.debug('Stopping federation server from RequestServer stop event');
                    fedServerListener = undefined;
                    server.stop();
                    resolve();
                });
            } catch(err) {
                reject(err);
            }
        });

        ProcessUtils.setupDestroyHandler( () => {
            LOG.debug('Stopping server from process utils event');
            server.stop();
            fedServer.stop();
            if (serverListener) {
                serverListener();
                serverListener = undefined;
            }
            if (fedServerListener) {
                fedServerListener();
                fedServerListener = undefined;
            }
        }, (err : any) => {
            LOG.error('Error while shutting down the service: ', err);
        });

        await stopPromise;
        await fedStopPromise;

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

  HG HomeServer.
  
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
