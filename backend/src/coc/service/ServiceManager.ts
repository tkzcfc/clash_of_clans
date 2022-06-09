/*
 * Created: 2022-03-18 10:52:51
 * Author : fc
 * Description: 服务管理
 */


import { IService } from "./IService";


const Logical_interval = 33;

class ServiceInfo {
	service : IService;

	constructor (service: IService) {
		this.service = service;

		let arr = service.constructor.toString().match(/\w+/g);
		if(arr) {
			service.serviceName = arr[1];
		}
	}
}

enum State {
	NONE,
	// 启动中
	STARTING,
	// 启动失败
	START_FAILED,
	// 运行中
	RUNNING,
	// 停止中
	STOPPING,
	// 已停止
	STOPPED
}

export class ServiceManager {
	loopTimer: any = null;
	serviceInfos : ServiceInfo[] = [];
	typeServiceMap: Map<{prototype: IService}, IService> = new Map<{prototype: IService}, IService>();
	// startSvIndex: number = 0;
	curState: State = State.NONE;
	
	public addService<T extends IService>(type: {new(): T}): T {
		if(this.typeServiceMap.get(type)) {
			throw new Error("注册失败，服务类型重复");
		}
		let value = new type();
		this.typeServiceMap.set(type, value);
		this.serviceInfos.push(new ServiceInfo(value));
		return value;
	}

	public getService<T extends IService>(type: {prototype: T}) : T {
		return this.typeServiceMap.get(type) as T;
	}

	public async start(): Promise<boolean> {
		console.assert(this.curState == State.NONE);
		this.curState = State.STARTING;

		let serviceNum = this.serviceInfos.length;

		// 加载服务
		for (let index = 0; index < serviceNum; index++) {
			if(!await this._loadService(this.serviceInfos[index].service))
				return false;
		}

		// 启动服务
		for (let index = 0; index < serviceNum; index++) {
			if(!await this._startService(this.serviceInfos[index].service)) {
				this.curState = State.START_FAILED;

				for(let i = index - 1; i >= 0; --i) {
					await this._stopService(this.serviceInfos[i].service);
				}
				return false;
			}
		}

		this.loopTimer = setInterval(()=>{
			this.loop();
		}, Logical_interval);
		
		this.curState = State.RUNNING;
		return true;
	}

	public async stop() : Promise<void> {
		this.curState = State.STOPPING;

		for (let index = this.serviceInfos.length - 1; index >= 0; --index) {
			await this._stopService(this.serviceInfos[index].service);
		}

		this.serviceInfos.length = 0;
		this.typeServiceMap.clear();
		this.curState = State.STOPPED;
		clearInterval(this.loopTimer);
	}

	private async _loadService(service: IService): Promise<boolean> {
		try {
			await service.onLoad()
			GLog.log(`Load service '${service.serviceName}' successfully.`);
			return true;
		} catch (error) {
			GLog.error(`Failed to load service '${service.serviceName}'，Error:${error}.`);
		}
		return false;
	}

	private async _startService(service: IService): Promise<boolean> {
		try {
			await service.onStart()
			GLog.log(`Service '${service.serviceName}' started successfully.`);
			return true;
		} catch (error) {
			GLog.error(`Failed to start service '${service.serviceName}'，Error:${error}.`);
		}
		return false;
	}
	
	private async _stopService(service: IService): Promise<void> {
		try {
			GLog.log(`Stopping service '${service.serviceName}'`);
			await service.onStop()
		}
		catch (error) {
			GLog.log(`Failed to stop service '${service.serviceName}'，Error:${error}.`);
		}
	}

	private loop() {
		if(this.curState === State.RUNNING) {
			let len = this.serviceInfos.length;
			for(let i = 0; i < len; ++i) {
				this.serviceInfos[i].service.onUpdate();
			}
		}
	}
}
