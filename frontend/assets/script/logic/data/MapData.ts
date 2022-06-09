import { BaseData } from "./BaseData";

export class MapData implements BaseData {
    
    private data: any;

    constructor (data) {
        this.data = data;
    }

    getItems() {
        return this.data.items;
    }

    setItems(items) {
        this.data.items = items;
    }
    
    onDestroy() {

    }
}
