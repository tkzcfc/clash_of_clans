import { BuildingItem, BuildingData } from './Cfg_Building';
import { ItemsItem, ItemsData } from './Cfg_Items';
import { RoleItem, RoleData } from './Cfg_Role';
import { RpcErrorItem, RpcErrorData } from './Cfg_RpcError';
import { ShopItem, ShopData } from './Cfg_Shop';

export interface ConfigItemType {
    Building: BuildingItem,
    Items: ItemsItem,
    Role: RoleItem,
    RpcError: RpcErrorItem,
    Shop: ShopItem
}

export const ConfigData = {
  Building: BuildingData,
  Items: ItemsData,
  Role: RoleData,
  RpcError: RpcErrorData,
  Shop: ShopData
}
