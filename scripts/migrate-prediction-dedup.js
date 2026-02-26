const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting migration...');

    // 1. Add dateKey column if not exists
    try {
        await prisma.$executeRawUnsafe(`ALTER TABLE PredictionHistory ADD COLUMN dateKey VARCHAR(191) NULL`);
        console.log('1. Added dateKey column');
    } catch (e) {
        console.log('1. dateKey column already exists, skipping');
    }

    // 2. Fill dateKey from date field
    const updated = await prisma.$executeRawUnsafe(`UPDATE PredictionHistory SET dateKey = DATE_FORMAT(date, '%Y-%m-%d') WHERE dateKey IS NULL`);
    console.log('2. Filled dateKey for', Number(updated), 'rows');

    // 3. Delete duplicates — keep only the LATEST record per symbol+dateKey
    const deleted = await prisma.$executeRawUnsafe(`DELETE p1 FROM PredictionHistory p1 INNER JOIN PredictionHistory p2 ON p1.symbol = p2.symbol AND p1.dateKey = p2.dateKey AND p1.id < p2.id`);
    console.log('3. Deleted', Number(deleted), 'duplicate rows');

    // 4. Make dateKey NOT NULL
    await prisma.$executeRawUnsafe(`ALTER TABLE PredictionHistory MODIFY COLUMN dateKey VARCHAR(191) NOT NULL`);
    console.log('4. Made dateKey NOT NULL');

    // 5. Add unique constraint
    try {
        await prisma.$executeRawUnsafe(`ALTER TABLE PredictionHistory ADD UNIQUE INDEX PredictionHistory_symbol_dateKey_key (symbol, dateKey)`);
        console.log('5. Added unique constraint');
    } catch (e) {
        console.log('5. Unique constraint already exists, skipping');
    }

    console.log('Migration complete!');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
