import {
  findChangesBetweenDatasets,
  findDeltas,
  getDeltas, makeUpdates,
  skuBatchToInserts,
} from './sync';
import {skuBatchUpdate} from "./interfaces.util";
import exp from 'constants';

describe('sync', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('.skuBatchToInserts', () => {
    it('should return a list of inserts', async () => {
      const data = [
        {
          skuBatchId: 'sku-batch-id-1',
          skuId: 'sku-id-1',
          quantityPerUnitOfMeasure: 25,
        },
        {
          skuBatchId: 'sku-batch-id-2',
          skuId: 'sku-id-1',
          quantityPerUnitOfMeasure: 25,
        },
        {
          skuBatchId: 'sku-batch-id-3',
          skuId: 'sku-id-2',
          quantityPerUnitOfMeasure: 1,
        },
      ];

      await expect(
        skuBatchToInserts(
          data.map((d) => d.skuBatchId),
        ),
      ).resolves.toStrictEqual([
        "insert into test_table (col_1, col_2) values (sku-id-1, sku-batch-id-1)",
        "insert into test_table (col_1, col_2) values (sku-id-1, sku-batch-id-1)",
        "insert into test_table (col_1, col_2) values (sku-id-1, sku-batch-id-1)",
        "insert into test_table (col_1, col_2) values (sku-id-1, sku-batch-id-1)",
        "insert into test_table (col_1, col_2) values (sku-id-1, sku-batch-id-2)",
        "insert into test_table (col_1, col_2) values (sku-id-1, sku-batch-id-2)",
        "insert into test_table (col_1, col_2) values (sku-id-1, sku-batch-id-2)",
        "insert into test_table (col_1, col_2) values (sku-id-1, sku-batch-id-2)",
        "insert into test_table (col_1, col_2) values (sku-id-1, sku-batch-id-3)",
        "insert into test_table (col_1, col_2) values (sku-id-1, sku-batch-id-3)",
        "insert into test_table (col_1, col_2) values (sku-id-1, sku-batch-id-3)",
        "insert into test_table (col_1, col_2) values (sku-id-1, sku-batch-id-3)"
      ]);
    });
  });

  describe('.getDeltas', () => {
    it('should find deltas', async () => {
      // example of the data below:
      // skuBatchIds = ['sku-batch-id-1', 'sku-batch-id-2', 'sku-batch-id-3', 'sku-batch-id-4'];
      // appSkuBatchIds = [...skuBatchIds, 'sku-batch-id-5', 'sku-batch-id-6']; // 5 and 6 are new
      await expect(getDeltas()).resolves.toStrictEqual(['sku-batch-id-5', 'sku-batch-id-6']);
    });
  });

  describe('.findDelta', () => {
    it('should pick up changes to quantityPerUnitOfMeasure', async () => {
      const appData = [{
        skuBatchId: '1',
        skuId: '1',
        wmsId: '1',
        quantityPerUnitOfMeasure: 5,
        isArchived: false,
        isDeleted: false,
      }];

      const inventoryData = [{
        skuBatchId: '1',
        skuId: '1',
        wmsId: '1',
        quantityPerUnitOfMeasure: 10,
        isArchived: false,
        isDeleted: false,
      }];

      const deltas: skuBatchUpdate[] = findDeltas(appData, inventoryData);
      expect(deltas.length).toBe(1);
      expect(deltas[0].updates.length).toBe(1);
      expect(deltas[0].updates[0].field).toBe('quantityPerUnitOfMeasure');
      expect(deltas[0].updates[0].newValue).toBe(5);
    });

    it('should not change the skuId if already set', async () => {
      const appData = [{
        skuBatchId: '1',
        skuId: '1',
        wmsId: '1',
        quantityPerUnitOfMeasure: 5,
        isArchived: false,
        isDeleted: false,
      }];

      const inventoryData = [{
        skuBatchId: '1',
        skuId: '2',
        wmsId: '1',
        quantityPerUnitOfMeasure: 5,
        isArchived: false,
        isDeleted: false,
      }];

      const deltas: skuBatchUpdate[] = findDeltas(appData, inventoryData);
      expect(deltas.length).toBe(0);
    });

    it('should pick up change to skuId if not set', async () => {
      const appData = [{ 
        skuBatchId: '1',
        skuId: '2',
        wmsId: '1',
        quantityPerUnitOfMeasure: 5,
        isArchived: false,
        isDeleted: false,
      }];
      const inventoryData = [{
        skuBatchId: '1',
        skuId: null,
        wmsId: '1',
        quantityPerUnitOfMeasure: 5,
        isArchived: false,
        isDeleted: false,
      }];
      const deltas: skuBatchUpdate[] = findDeltas(appData, inventoryData);
      expect(deltas.length).toBe(1);
      expect(deltas[0].updates.length).toBe(1);
      expect(deltas[0].updates[0].field).toBe('skuId');
      expect(deltas[0].updates[0].newValue).toBe('2');
    });

    it('should pick up change to wmsId', async () => {
      const appData = [{ 
        skuBatchId: '1',
        skuId: '1',
        wmsId: '2',
        quantityPerUnitOfMeasure: 5,
        isArchived: false,
        isDeleted: false,
      }];
      const inventoryData = [{
        skuBatchId: '1',
        skuId: '1',
        wmsId: '1',
        quantityPerUnitOfMeasure: 5,
        isArchived: false,
        isDeleted: false,
      }];
      const deltas: skuBatchUpdate[] = findDeltas(appData, inventoryData);
      expect(deltas.length).toBe(1);
      expect(deltas[0].updates.length).toBe(1);
      expect(deltas[0].updates[0].field).toBe('wmsId');
      expect(deltas[0].updates[0].newValue).toBe('2');
    });

    it('should find changes between datasets', async () => {
      await expect(
        findChangesBetweenDatasets(),
      ).resolves.toStrictEqual([
        "update inventory set is_deleted = true where sku_batch_id = 'sku-batch-id-5'",
        "update inventory_aggregate set is_deleted = true where sku_batch_id = 'sku-batch-id-5'",
        "update inventory set is_archived = true where sku_batch_id = 'sku-batch-id-6'",
        "update inventory_aggregate set is_archived = true where sku_batch_id = 'sku-batch-id-6'"
      ]);
    });
  });

  describe('.makeUpdates', () => {
    it('should create a list of string sql updates based on a update delta', async () => {
      const skuBatchUpdate: skuBatchUpdate = 
        {
          skuBatchId: '1',
          updates: [
            { field: 'isDeleted', newValue: true },
            { field: 'isArchived', newValue: true },
            { field: 'quantityPerUnitOfMeasure', newValue: 5 },
            { field: 'wmsId', newValue: null },
            { field: 'skuId', newValue: '1'}
          ],
        }

      const updates = makeUpdates(skuBatchUpdate);
      expect(updates.length).toBe(2);
      expect(updates[0]).toBe("update inventory set is_deleted = true, is_archived = true, quantity_per_unit_of_measure = 5, wms_id = null, sku_id = '1' where sku_batch_id = '1'");
      expect(updates[1]).toBe("update inventory_aggregate set is_deleted = true, is_archived = true, quantity_per_unit_of_measure = 5, wms_id = null, sku_id = '1' where sku_batch_id = '1'");
    })
  })
});
