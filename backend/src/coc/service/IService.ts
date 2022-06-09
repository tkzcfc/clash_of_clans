/*
 * Created: 2022-03-18 10:58:48
 * Author : fc
 * Description: 服务基类接口
 */

export class IService {
	serviceName: string = "";

	async onLoad(){
		return new Promise<void>((resolve, reject)=>{
			if(this.onLoadSync())
				resolve();
			else
				reject();
		});
	}

	async onStart() {
		return new Promise<void>((resolve, reject)=>{
			if(this.onStartSync())
				resolve();
			else
				reject();
		});
	}

	async onStop() {
		this.onStopSync();
	}

	onUpdate() {
	}
	
	
	/**
	 * 同步加载
	 */
	 onLoadSync():boolean {
		return true;
	}

	/**
	 * 同步启动
	 */
	onStartSync():boolean {
		return true;
	}

	/**
	 * 同步停止
	 */
	 onStopSync() {
	}
}
