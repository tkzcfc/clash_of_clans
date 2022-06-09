/*
 * Created: 2022-03-20 11:46:35
 * Author : fc
 * Description: 网络错误码
 */

export enum NetError {

    OK = 0,


    // 账号不存在
    Account_Not_Exist,
    // 密码错误
    Password_Error,
    // token过期
    Token_Expiration,
    // 此玩家已在游戏中
    Player_In_The_Game,


    // 账号已存在
    Account_Already_Exists,
    // 密码不合法
    Illegal_Password,

    // 找不到攻击对象
    No_Attack_Object_Found,



    
    DataTooLong,
}

