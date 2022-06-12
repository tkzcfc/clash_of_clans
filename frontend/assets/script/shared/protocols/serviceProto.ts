import { ServiceProto } from 'tsrpc-proto';
import { MsgLoginGameFinish } from './msg/MsgLoginGameFinish';
import { MsgSelfOffline } from './msg/MsgSelfOffline';
import { ReqLogin, ResLogin } from './ptl/PtlLogin';
import { ReqLoginGame, ResLoginGame } from './ptl/PtlLoginGame';
import { ReqRegister, ResRegister } from './ptl/PtlRegister';
import { ReqSaveMapUnits, ResSaveMapUnits } from './ptl/PtlSaveMapUnits';

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
        "ptl/Register": {
            req: ReqRegister,
            res: ResRegister
        },
        "ptl/SaveMapUnits": {
            req: ReqSaveMapUnits,
            res: ResSaveMapUnits
        }
    },
    msg: {
        "msg/LoginGameFinish": MsgLoginGameFinish,
        "msg/SelfOffline": MsgSelfOffline
    }
}

export const serviceProto: ServiceProto<ServiceType> = {
    "version": 15,
    "services": [
        {
            "id": 14,
            "name": "msg/LoginGameFinish",
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
            "type": "api",
            "conf": {
                "anonymous": true
            }
        },
        {
            "id": 8,
            "name": "ptl/LoginGame",
            "type": "api",
            "conf": {
                "anonymous": true
            }
        },
        {
            "id": 5,
            "name": "ptl/Register",
            "type": "api",
            "conf": {
                "anonymous": true
            }
        },
        {
            "id": 13,
            "name": "ptl/SaveMapUnits",
            "type": "api"
        }
    ],
    "types": {
        "msg/MsgLoginGameFinish/MsgLoginGameFinish": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "cookie",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "msg/MsgSelfOffline/MsgSelfOffline": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "why",
                    "type": {
                        "type": "Reference",
                        "target": "../RpcErr/RpcErrCode"
                    }
                }
            ]
        },
        "../RpcErr/RpcErrCode": {
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
                },
                {
                    "id": 4,
                    "value": 4
                },
                {
                    "id": 5,
                    "value": 5
                },
                {
                    "id": 6,
                    "value": 6
                },
                {
                    "id": 7,
                    "value": 7
                },
                {
                    "id": 8,
                    "value": 8
                },
                {
                    "id": 9,
                    "value": 9
                },
                {
                    "id": 10,
                    "value": 10
                },
                {
                    "id": 11,
                    "value": 11
                },
                {
                    "id": 12,
                    "value": 12
                },
                {
                    "id": 13,
                    "value": 13
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
                    "id": 3,
                    "name": "cookie",
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
                        "target": "../db_structure/Player/DBPlayerInfo"
                    }
                }
            ]
        },
        "../db_structure/Player/DBPlayerInfo": {
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
                    "id": 8,
                    "name": "mapuuid",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 9,
                    "name": "baguuid",
                    "type": {
                        "type": "String"
                    }
                }
            ]
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
        },
        "ptl/PtlSaveMapUnits/ReqSaveMapUnits": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "units",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "ptl/PtlSaveMapUnits/SaveMapUnit"
                        }
                    }
                }
            ]
        },
        "ptl/PtlSaveMapUnits/SaveMapUnit": {
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
                    "name": "x",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 2,
                    "name": "y",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        },
        "ptl/PtlSaveMapUnits/ResSaveMapUnits": {
            "type": "Interface"
        }
    }
};