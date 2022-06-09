/*
 * Created: 2022-03-18 10:47:17
 * Author : fc
 * Description: 系统事件定义
 */


export enum SysEvent {
	// 有新的连接进入
	NET_NEW_CONNECTION,
	// 有连接关闭
	NET_CLOSE_CONNECTION,



	// 向某个连接发送消息
	SEND_MSG_TO_CONN,
	// 向所有以及登录的玩家发送消息
	SEND_MSG_TO_ALL_LOGIN,
	// 向所有连接的客户端发送消息
	SEND_MSG_TO_ALL,

	// 玩家上线
	PLAYER_ONLINE,
	// 玩家下线
	PLAYER_OFFLINE,
	// 玩家断线重连
	PLAYER_REUNION,
	// 玩家登录成功
	PLAYER_LOGIN_SUC,
}
