import { ServiceProto } from 'tsrpc-proto';
import { MsgLoginPushB } from './msg/MsgLoginPushB';
import { MsgLoginPushE } from './msg/MsgLoginPushE';
import { MsgReconBegin } from './msg/MsgReconBegin';
import { MsgReconEnd } from './msg/MsgReconEnd';
import { MsgSelfOffline } from './msg/MsgSelfOffline';
import { ReqLogin, ResLogin } from './ptl/PtlLogin';
import { ReqLoginGame, ResLoginGame } from './ptl/PtlLoginGame';
import { ReqModifyMap, ResModifyMap } from './ptl/PtlModifyMap';
import { ReqRegister, ResRegister } from './ptl/PtlRegister';

export interface ServiceType {
    api: {
        "ptl/Login": {
            req: ReqLogin,
            res: ResLogin
        },
        "ptl/LoginGame": {
            req: ReqLoginGame,
            res: ResLoginGame
        },
        "ptl/ModifyMap": {
            req: ReqModifyMap,
            res: ResModifyMap
        },
        "ptl/Register": {
            req: ReqRegister,
            res: ResRegister
        }
    },
    msg: {
        "msg/LoginPushB": MsgLoginPushB,
        "msg/LoginPushE": MsgLoginPushE,
        "msg/ReconBegin": MsgReconBegin,
        "msg/ReconEnd": MsgReconEnd,
        "msg/SelfOffline": MsgSelfOffline
    }
}

export const serviceProto: ServiceProto<ServiceType> = {
    "version": 8,
    "services": [
        {
            "id": 6,
            "name": "msg/LoginPushB",
            "type": "msg"
        },
        {
            "id": 7,
            "name": "msg/LoginPushE",
            "type": "msg"
        },
        {
            "id": 10,
            "name": "msg/ReconBegin",
            "type": "msg"
        },
        {
            "id": 11,
            "name": "msg/ReconEnd",
            "type": "msg"
        },
        {
            "id": 9,
            "name": "msg/SelfOffline",
            "type": "msg"
        },
        {
            "id": 4,
            "name": "ptl/Login",
            "type": "api"
        },
        {
            "id": 8,
            "name": "ptl/LoginGame",
            "type": "api"
        },
        {
            "id": 12,
            "name": "ptl/ModifyMap",
            "type": "api"
        },
        {
            "id": 5,
            "name": "ptl/Register",
            "type": "api"
        }
    ],
    "types": {
        "msg/MsgLoginPushB/MsgLoginPushB": {
            "type": "Interface"
        },
        "msg/MsgLoginPushE/MsgLoginPushE": {
            "type": "Interface"
        },
        "msg/MsgReconBegin/MsgReconBegin": {
            "type": "Interface"
        },
        "msg/MsgReconEnd/MsgReconEnd": {
            "type": "Interface"
        },
        "msg/MsgSelfOffline/MsgSelfOffline": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "why",
                    "type": {
                        "type": "Reference",
                        "target": "msg/MsgSelfOffline/OfflineCode"
                    }
                }
            ]
        },
        "msg/MsgSelfOffline/OfflineCode": {
            "type": "Enum",
            "members": [
                {
                    "id": 0,
                    "value": 0
                },
                {
                    "id": 1,
                    "value": 1
                },
                {
                    "id": 2,
                    "value": 2
                },
                {
                    "id": 3,
                    "value": 3
                }
            ]
        },
        "ptl/PtlLogin/ReqLogin": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "account",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "password",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "ptl/PtlLogin/ResLogin": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "token",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 3,
                    "name": "players",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "String"
                        }
                    }
                }
            ]
        },
        "ptl/PtlLoginGame/ReqLoginGame": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "pid",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "token",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 2,
                    "name": "voucher",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "ptl/PtlLoginGame/ResLoginGame": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "pdata",
                    "type": {
                        "type": "Reference",
                        "target": "../../coc/const/dbConfig/DBPlayerInfo"
                    }
                },
                {
                    "id": 1,
                    "name": "voucher",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "../../coc/const/dbConfig/DBPlayerInfo": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "pid",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "name",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 2,
                    "name": "lv",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 3,
                    "name": "exp",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 4,
                    "name": "coins",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 5,
                    "name": "diamonds",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 6,
                    "name": "map",
                    "type": {
                        "type": "Reference",
                        "target": "../../coc/const/dbConfig/MapData"
                    }
                },
                {
                    "id": 7,
                    "name": "bag",
                    "type": {
                        "type": "Reference",
                        "target": "../../coc/const/dbConfig/BagData"
                    }
                }
            ]
        },
        "../../coc/const/dbConfig/MapData": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "units",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../../coc/const/dbConfig/UnitData"
                        }
                    }
                }
            ]
        },
        "../../coc/const/dbConfig/UnitData": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "uuid",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 1,
                    "name": "id",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 2,
                    "name": "x",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 3,
                    "name": "y",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 4,
                    "name": "lv",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 5,
                    "name": "type",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        },
        "../../coc/const/dbConfig/BagData": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "build",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../../coc/const/dbConfig/BagBuildItem"
                        }
                    }
                }
            ]
        },
        "../../coc/const/dbConfig/BagBuildItem": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "uuid",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "id",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 2,
                    "name": "count",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        },
        "ptl/PtlModifyMap/ReqModifyMap": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "units",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../../coc/const/dbConfig/UnitData"
                        }
                    }
                }
            ]
        },
        "ptl/PtlModifyMap/ResModifyMap": {
            "type": "Interface"
        },
        "ptl/PtlRegister/ReqRegister": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "account",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "password",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 2,
                    "name": "platform",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 3,
                    "name": "deviceid",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "ptl/PtlRegister/ResRegister": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "err",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        }
    }
};