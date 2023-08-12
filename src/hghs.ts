// Copyright (c) 2022-2023. Heusala Group <info@heusalagroup.fi>. All rights reserved.

import { main } from "./main";
main(process.argv).then((status : number) => {
    process.exit(status);
}).catch((err : any) => {
    console.error(`Error: `, err);
    process.exit(1);
});
