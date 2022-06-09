
export namespace Check {

    export function opt_str(value: any, defaultVal: string) : string {
        if(typeof(value) == 'string' && value.constructor==String) {
            return value;
        }
        return defaultVal;
    }

    export function opt_number(value: any, defaultVal: number): number {
        if(typeof(value) !== 'number'){
            return defaultVal;
        }
        if(isNaN(value)) {
            return defaultVal;
        }
        return value;
    }
    
    export function opt_int(value: any, defaultVal: number): number {
        value = opt_number(value, defaultVal);
        
        if(Math.floor(value) === value) {
            return value;
        }

        return defaultVal;
    }
}