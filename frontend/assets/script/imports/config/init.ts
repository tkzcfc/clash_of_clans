import { BuildingItem, BuildingData } from './Building';
import { ItemsItem, ItemsData } from './Items';
import { RoleItem, RoleData } from './Role';
import { RpcErrorItem, RpcErrorData } from './RpcError';
import { ShopItem, ShopData } from './Shop';

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
