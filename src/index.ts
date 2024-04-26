import express, {Request} from 'express';

import {copyMissingInventoryRecordsFromSkuBatch, updateInventoryDeltasFromSkuBatch} from './sync';
import { 
    insertToAppDatabase,updateAppDatabase,
    CreateInventoryAggregateRequestParams,
    CreateInventoryRequestParams,
    UpdateInventoryAggregateRequestParams,
    UpdateInventoryRequestParams
} from './mutations';


const app = express();
app.use(express.json());

const fakeURL = "https://local-inventory.nabis.dev/v1/"


type RequestBody<T> = Request<{}, {}, T>;


app.post(`${fakeURL}/inventory`, async (req: RequestBody<CreateInventoryRequestParams>, res) => {
    
    // Check if required fields are present
    if (!req.body.skuBatchId || !req.body.skuId || !req.body.warehouseId) {
        res.status(400).json({ error: 'skuBatchId, skuId, and warehouseId are required' });
    }
    try {
        // insert the record into the app database if possible
        // then sync the two databases
        insertToAppDatabase(req.body);
        await copyMissingInventoryRecordsFromSkuBatch();
    }
    catch(err: Error | any)  {   
        return res.status(400).json({ error: err?.message ?? "A record with this ID already exists" });
    }
    res.status(200).json({ message: 'Inventory record created successfully' });
});

app.put(`${fakeURL}/inventory`, async (req: RequestBody<UpdateInventoryRequestParams>, res) => {
        
        // Check if required fields are present
        if (!req.body.skuBatchId || !req.body.skuId || !req.body.warehouseId) {
            res.status(400).json({ error: 'skuBatchId, skuId, and warehouseId are required' });
        }
        
        // update the record in the database if neccessary
        try {
            updateAppDatabase(req.body);
            await updateInventoryDeltasFromSkuBatch()
        }
        catch(err: Error | any) {
            res.status(400).json({ error: err?.message ?? "Record not found" });
        }
        
        res.json({ message: 'Inventory updated successfully' });
});


app.post(`${fakeURL}/inventory-aggregate`, async(req: RequestBody<CreateInventoryAggregateRequestParams>, res) => {
    
    // Check if required fields are present
    if (!req.body.skuBatchId || !req.body.skuId) {
        res.status(400).json({ error: 'skuBatchId and skuId are required' });
    }
    try {
        // insert the record into the app database if possible
        // then sync the two databases
        insertToAppDatabase(req.body);
        await copyMissingInventoryRecordsFromSkuBatch();
    }
    catch (err: Error | any) {
        res.status(400).json({ error: err?.message ?? "A record with this ID already exists" });
    }
    
    res.json({ message: 'Inventory aggregate record created successfully' });
});

app.put(`${fakeURL}/inventory-aggregate`, async(req: RequestBody<UpdateInventoryAggregateRequestParams>, res) => {

    // Check if required fields are present
    if (!req.body.skuBatchId || !req.body.skuId) {
        res.status(400).json({ error: 'skuBatchId and skuId are required' });
    }
    try {
        // update the record in the database if neccessary
        updateAppDatabase(req.body);
        await updateInventoryDeltasFromSkuBatch();
    }
    catch(err: Error | any) {
        res.status(400).json({ error: err?.message ?? "Record not found" });
    }
    
    res.json({ message: 'Inventory aggregate updated successfully' });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});