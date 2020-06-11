import sqlite3 from 'sqlite3'
import {Database, open} from 'sqlite'

sqlite3.verbose()

export const SQL_CREATE_ITEM_TABLE = `CREATE TABLE PRODUCT(
        sku CHAR(8) PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        price DECIMAL(5,2) NOT NULL,
        qty UNSIGNED BIG INT NOT NULL CHECK (qty >= 0))`

export const initDb = async (): Promise<Database> => {
    const db: Database = await openDb();

    await db.exec(SQL_CREATE_ITEM_TABLE);

    const insertItem = await db.prepare("INSERT INTO PRODUCT VALUES (?, ?, ?, ?)");
    await Promise.all([
        insertItem.run("120P90", "Google Home", 49.99, 10),
        insertItem.run("43N23P", "MacBook Pro", 5399.99, 5),
        insertItem.run("A304SD", "Alexa Speaker", 109.50, 10),
        insertItem.run("234234", "Raspberry Pi", 30.00, 2)
    ])
    await insertItem.finalize();
    return db
}

export async function openDb(): Promise<Database> {
    return open({
        filename: ':memory:',
        driver: sqlite3.Database
    })
}


