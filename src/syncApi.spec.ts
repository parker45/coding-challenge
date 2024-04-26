import axios from 'axios';
import {
    createInventory,
    updateInventory,
    createInventoryAggregate,
    updateInventoryAggregate,
    InventoryCommand,
    InventoryAgggregateCommand,
    API_ENDPOINT
} from './syncApi';

jest.mock('axios');

describe('syncApi', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createInventory', () => {
        it('should make a POST request to create inventory', async () => {
            const command: InventoryCommand = {
                skuBatchId: 'sku-batch-id-1',
                skuId: 'sku-id-1',
                warehouseId: 'warehouse-1',
            };

            await createInventory(command);

            expect(axios.post).toHaveBeenCalledWith(`${API_ENDPOINT}/inventory`, command);
        });
        it('should log an error if the request fails', async () => {
            const errorSpy = jest.spyOn(global.console, 'error');
            const command: InventoryCommand = {
                skuBatchId: 'sku-batch-id-1',
                skuId: 'sku-id-1',
                warehouseId: 'warehouse-1',
            };
            const error = new Error('500 bad request');
            (axios.post as jest.Mock).mockRejectedValue(error);

            await createInventory(command);

            expect(errorSpy).toHaveBeenCalledWith('Failed to create inventory', error);
            errorSpy.mockRestore();
        })
    });

    describe('updateInventory', () => {
        it('should make a PUT request to update inventory', async () => {
            const command: InventoryCommand = {
                skuBatchId: 'sku-batch-id-1',
                skuId: 'sku-id-1',
                warehouseId: 'warehouse-1',
            };

            await updateInventory(command);

            expect(axios.put).toHaveBeenCalledWith(`${API_ENDPOINT}/inventory/${command.skuBatchId}`, command);
        });
    });

    describe('createInventoryAggregate', () => {
        it('should make a POST request to create inventory aggregate', async () => {
            const command: InventoryAgggregateCommand = {
                skuBatchId: 'sku-batch-id-1',
                skuId: 'sku-id-1',
            };

            await createInventoryAggregate(command);

            expect(axios.post).toHaveBeenCalledWith(`${API_ENDPOINT}/inventory-aggregate`, command);
        });
    });

    describe('updateInventoryAggregate', () => {
        it('should make a PUT request to update inventory aggregate', async () => {
            const command: InventoryAgggregateCommand = {
                skuBatchId: 'sku-batch-id-1',
                skuId: 'sku-id-1',
            };

            await updateInventoryAggregate(command);

            expect(axios.put).toHaveBeenCalledWith(`${API_ENDPOINT}/inventory-aggregate/${command.skuBatchId}`, command);
        });
    });
});
