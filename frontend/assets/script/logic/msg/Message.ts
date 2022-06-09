/*
 * Created: 2022-03-18 15:55:34
 * Author : fc
 * Description: 网络消息定义
 */


export enum MessageID {

    // 匿名消息开始
    ANONYMOUS_BEGIN = 0,

    // 登录接口
    LOGIN_GAME_REQ,
    LOGIN_GAME_ACK,


    /** 登录成功-正常登录消息推送 */
    // 登录成功-推送消息开始
    LOGIN_SUC_PUSH_BEGIN,
    // 登录成功-推送消息结束
    LOGIN_SUC_PUSH_END,


    /** 登录成功-断线重连 */
    // 登录成功-断线重连开始
    REUNION_PUSH_BEGIN,
    // 登录成功-断线重连结束
    REUNION_PUSH_END,


    // 此玩家在其他地方登录
    LOGIN_IN_ELSEWHERE,

    // 注册接口
    REGISTER_REQ,
    REGISTER_ACK,

    // 匿名消息结束
    ANONYMOUS_END = 1000,

    // 修改 unimportant 字段数据
    MDF_UNIMPORTANT_REQ,
    MDF_UNIMPORTANT_ACK,

    // 获取可对战的玩家列表
    GET_PVP_LIST_REQ,
    GET_PVP_LIST_ACK,

    // 进攻某个玩家
    ATTACK_PLAYER_REQ,
    ATTACK_PLAYER_ACK,
}


