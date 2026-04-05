import QueryBuilder from "./db/builder";
import { getDB } from "./db/shard";
import { sqlId, sqlObj } from "./sql";

export function createModel<T extends Record<string, any>>(schema: {
    table: string;
    primaryKey: keyof T;
}) {
    return {
        findById(id: any) {
            const db = getDB(id, true);

            return new QueryBuilder<T>(schema.table)
                .where({ [schema.primaryKey]: id } as any)
                .limit(1)
                .execute(db)
                .then(r => r[0] || null);
        },

        insert(data: T) {
            const db = getDB(data[schema.primaryKey]);

            return db`
                INSERT INTO ${sqlId(schema.table)} ${sqlObj(data)}
                RETURNING *
            `;
        },

        query() {
            return new QueryBuilder<T>(schema.table);
        },
    };
}
