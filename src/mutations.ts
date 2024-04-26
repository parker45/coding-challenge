import { appData, skuBatchIdsFromAppDb, appSkuBatchData } from './db/data';
import {
    WMSWarehouseMeta,
    inventoryUpdate,
    RecordWithWMS,
    SkuBatchData,
    SkuBatchToSkuId,
    skuBatchUpdate,
  } from './interfaces.util';


export type CreateInventoryRequestParams = {
    skuBatchId: string;
    skuId: string;
    warehouseId: number;
    quantityPerUnitOfMeasure: number | null;
    isArchived: boolean | null;
    isDeleted: boolean | null;
  }
  
export type CreateInventoryAggregateRequestParams = {
    skuBatchId: string;
    skuId: string;
    warehouseId: number | null;
    quantityPerUnitOfMeasure: number | null;
    isArchived: boolean | null;
    isDeleted: boolean | null;
}

export type UpdateInventoryRequestParams = {
    skuBatchId: string;
    skuId: string;
    warehouseId: string;
    quantityPerUnitOfMeasure: number | null;
    isArchived: boolean | null;
    isDeleted: boolean | null;
  }
  
export type UpdateInventoryAggregateRequestParams = {
    skuBatchId: string;
    skuId: string;
    warehouseId: string | null;
    quantityPerUnitOfMeasure: number | null;
    isArchived: boolean | null;
    isDeleted: boolean | null;
}


export function insertToAppDatabase(params: CreateInventoryRequestParams | CreateInventoryAggregateRequestParams) : void {
    // check if the item exists in the app database and if so add it else throw an error
    if (!appData.find((d) => d.skuBatchId === params.skuBatchId)) {
        // Normally this would be handled by some sort of repository but for the
        // sake of this exercise we will just do it here.
        // insert the record into the app database 
        const newRecord: SkuBatchToSkuId = {
            skuBatchId: params.skuBatchId,
            skuId: params.skuId,
            quantityPerUnitOfMeasure: params.quantityPerUnitOfMeasure ?? 1,
            wmsId: params.warehouseId ?? 0, // not 100% sure what a sensible default should be here
            isArchived: params.isArchived ?? false,
            isDeleted: params.isDeleted   ?? false,
        }
        appData.push(newRecord)
        // also add this to the skuBatchIdsFromAppDb
        skuBatchIdsFromAppDb.push({id: params.skuBatchId});
    }
    else {
        throw new Error('Record already exists in the app database');
    }
}

export function updateAppDatabase(params: UpdateInventoryRequestParams | UpdateInventoryAggregateRequestParams) : void {
    // check if the item exists in the app database and if so update it else throw an error
    // Normally this would be handled by some sort of repository but for the sake of this exercise we will just do it here
    const recordIndex = appSkuBatchData.findIndex((d) => d.skuBatchId === params.skuBatchId);
    if (recordIndex !== -1) {
        appSkuBatchData[recordIndex].skuId = params.skuId;
        appSkuBatchData[recordIndex].quantityPerUnitOfMeasure = params.quantityPerUnitOfMeasure ?? appSkuBatchData[recordIndex].quantityPerUnitOfMeasure;
        appSkuBatchData[recordIndex].wmsId = params.warehouseId ?? appSkuBatchData[recordIndex].wmsId;
        appSkuBatchData[recordIndex].isArchived = params.isArchived ??  appSkuBatchData[recordIndex].isArchived;
        appSkuBatchData[recordIndex].isDeleted = params.isDeleted ?? appSkuBatchData[recordIndex].isDeleted;
    }
    else {
        throw new Error('Record does not exist in the app database');
    }
}