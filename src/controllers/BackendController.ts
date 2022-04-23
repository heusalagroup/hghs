// Copyright (c) 2022. Heusala Group <info@heusalagroup.fi>. All rights reserved.

import {
    GetMapping,
    RequestHeader,
    RequestMapping,
} from "../fi/hg/core/Request";
import { ReadonlyJsonObject } from "../fi/hg/core/Json";
import { ResponseEntity } from "../fi/hg/core/request/ResponseEntity";
import { LogService } from "../fi/hg/core/LogService";

const LOG = LogService.createLogger('BackendController');

@RequestMapping("/")
export class BackendController {

    @GetMapping("/")
    public static async getIndex (
        @RequestHeader('X-Authorization', {
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
