import axios from 'axios';

export const API_ENDPOINT = 'https://local-inventory.nabis.dev/v1/';

/**
 * Command to create/update inventory
 */
export interface InventoryCommand {
    skuBatchId: string;
    skuId: string;
    warehouseId: string;
}

/**
 * Command to create/update inventory aggregate
 */
export interface InventoryAgggregateCommand {
    skuBatchId: string;
    skuId: string;
}

/**
 * Create new inventory via a POST request to the specified endpoint
 * @param command 
 */
export const createInventory = async(command: InventoryCommand): Promise<void> => {
    try {
        // Make a POST request to create/update inventory
        await axios.post(`${API_ENDPOINT}/inventory`, command);
        console.log('Inventory created/updated successfully');
    } catch (error: Error | any) {
        handleError('create', 'inventory', error);
    }
}

/**
 * Update inventory via a PUT request to the specified endpoint
 * @param command 
 */
export const updateInventory = async(command: InventoryCommand): Promise<void> => {
    try {
        // Make a PUT request to update inventory
        await axios.put(`${API_ENDPOINT}/inventory/${command.skuBatchId}`, command);
        console.log('Inventory updated successfully');
    } catch (error: Error | any) {
        handleError('update', 'inventory', error);
    }
}

/**
 * Create new inventory aggregate via a POST request to the specified endpoint
 * @param command
 */
export const createInventoryAggregate = async(command: InventoryAgggregateCommand): Promise<void>  => {
    try {
        // Make a POST request to create inventory aggregate
        await axios.post(`${API_ENDPOINT}/inventory-aggregate`, command);
        console.log('Inventory aggregate created successfully');
    } catch (error: Error | any) {
        handleError('create', 'inventory aggregate', error);
    }
}

/**
 * Update inventory aggregate via a PUT request to the specified endpoint
 * @param command 
 */
export const updateInventoryAggregate = async(command: InventoryAgggregateCommand): Promise<void> => {
    try {
        // Make a PUT request to update inventory aggregate
        await axios.put(`${API_ENDPOINT}/inventory-aggregate/${command.skuBatchId}`, command);
        console.log('Inventory aggregate updated successfully');
    } catch (error: Error | any) {
        handleError('update', 'inventory aggregate', error);
    }
}

const handleError = (action: string, object: string, error: Error | any) => {
    console.error(`Failed to ${action} ${object}`, error);
}