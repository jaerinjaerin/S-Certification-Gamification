import { PrismaClient } from '@prisma/client';

interface PrismaWhereCondition {
  [key: string]: any;
}

/**
 * Converts a Prisma where condition to a PostgreSQL WHERE clause
 * @param where - The Prisma where condition object
 * @returns An object containing the SQL WHERE clause and parameter values
 */
function prismaWhereToSQL(where: PrismaWhereCondition): {
  sql: string;
  params: any[];
} {
  const params: any[] = [];
  const sql = buildWhereClause(where, params);

  return {
    sql: sql ? `WHERE ${sql}` : '',
    params,
  };
}

/**
 * Recursively builds a SQL WHERE clause from a Prisma where condition
 * @param where - The Prisma where condition object
 * @param params - Array to collect parameter values
 * @returns The SQL WHERE clause string
 */
function buildWhereClause(where: PrismaWhereCondition, params: any[]): string {
  if (!where || Object.keys(where).length === 0) {
    return '';
  }

  const conditions: string[] = [];

  for (const key in where) {
    if (Object.prototype.hasOwnProperty.call(where, key)) {
      const value = where[key];

      // Handle logical operators (AND, OR, NOT)
      if (key === 'AND' || key === 'OR') {
        if (Array.isArray(value) && value.length > 0) {
          const subConditions = value
            .map((subWhere) => buildWhereClause(subWhere, params))
            .filter(Boolean);
          if (subConditions.length > 0) {
            conditions.push(`(${subConditions.join(` ${key} `)})`);
          }
        }
        continue;
      }

      if (key === 'NOT') {
        const notClause = buildWhereClause(value, params);
        if (notClause) {
          conditions.push(`NOT (${notClause})`);
        }
        continue;
      }

      // Handle field conditions
      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
      ) {
        const fieldConditions = processFieldConditions(key, value, params);
        if (fieldConditions) {
          conditions.push(fieldConditions);
        }
      } else {
        // Direct equality
        if (value === null) {
          conditions.push(`${escapeIdentifier(key)} IS NULL`);
        } else {
          params.push(value);
          conditions.push(`${escapeIdentifier(key)} = $${params.length}`);
        }
      }
    }
  }

  return conditions.join(' AND ');
}

/**
 * Processes field conditions for a specific field
 * @param field - The field name
 * @param conditions - The conditions object for the field
 * @param params - Array to collect parameter values
 * @returns The SQL condition string for the field
 */
function processFieldConditions(
  field: string,
  conditions: any,
  params: any[]
): string {
  const fieldConditions: string[] = [];
  const escapedField = escapeIdentifier(field);

  for (const op in conditions) {
    if (Object.prototype.hasOwnProperty.call(conditions, op)) {
      const value = conditions[op];

      switch (op) {
        case 'equals':
          if (value === null) {
            fieldConditions.push(`${escapedField} IS NULL`);
          } else {
            params.push(value);
            fieldConditions.push(`${escapedField} = $${params.length}`);
          }
          break;
        case 'not':
          if (value === null) {
            fieldConditions.push(`${escapedField} IS NOT NULL`);
          } else {
            params.push(value);
            fieldConditions.push(`${escapedField} <> $${params.length}`);
          }
          break;
        case 'in':
          if (Array.isArray(value) && value.length > 0) {
            // For PostgreSQL, we can use unnest for array parameters
            params.push(value);
            fieldConditions.push(`${escapedField} = ANY($${params.length})`);
          }
          break;
        case 'notIn':
          if (Array.isArray(value) && value.length > 0) {
            params.push(value);
            fieldConditions.push(
              `NOT (${escapedField} = ANY($${params.length}))`
            );
          }
          break;
        case 'lt':
        case 'lte':
        case 'gt':
        case 'gte':
          if (value instanceof Date || !isNaN(Date.parse(value))) {
            const dateValue =
              value instanceof Date
                ? value.toISOString()
                : new Date(value).toISOString();
            params.push(dateValue);
            const operator = { lt: '<', lte: '<=', gt: '>', gte: '>=' }[op];
            fieldConditions.push(
              `${escapedField} ${operator} $${params.length}::timestamptz`
            );
          } else {
            params.push(value);
            const operator = { lt: '<', lte: '<=', gt: '>', gte: '>=' }[op];
            fieldConditions.push(
              `${escapedField} ${operator} $${params.length}`
            );
          }
          break;
        case 'contains':
          params.push(`%${value}%`);
          fieldConditions.push(`${escapedField} ILIKE $${params.length}`);
          break;
        case 'startsWith':
          params.push(`${value}%`);
          fieldConditions.push(`${escapedField} ILIKE $${params.length}`);
          break;
        case 'endsWith':
          params.push(`%${value}`);
          fieldConditions.push(`${escapedField} ILIKE $${params.length}`);
          break;
        case 'search':
          params.push(`%${value}%`);
          fieldConditions.push(`${escapedField} ILIKE $${params.length}`);
          break;
        case 'isNull':
          if (value === true) {
            fieldConditions.push(`${escapedField} IS NULL`);
          } else {
            fieldConditions.push(`${escapedField} IS NOT NULL`);
          }
          break;
        default:
          // For unknown operators, try a direct comparison
          params.push(value);
          fieldConditions.push(`${escapedField} = $${params.length}`);
          break;
      }
    }
  }

  return fieldConditions.length > 0 ? `(${fieldConditions.join(' AND ')})` : '';
}

/**
 * Escapes PostgreSQL identifiers (table names, column names) to prevent SQL injection
 * @param identifier - The identifier to escape
 * @returns The escaped identifier
 */
function escapeIdentifier(identifier: string): string {
  // PostgreSQL uses double quotes for identifiers
  return `"${identifier.replace(/"/g, '""')}"`;
}

/**
 * Execute a raw SQL query using a Prisma where condition with PostgreSQL
 * @param prisma - The Prisma client instance
 * @param tableName - The name of the table to query
 * @param where - The Prisma where condition object
 * @param select - Optional columns to select (defaults to *)
 * @param debug - Whether to print debug info
 * @returns The query result
 */
export async function queryRawWithWhere<T>(
  prisma: PrismaClient,
  tableName: string,
  where: PrismaWhereCondition,
  select: string[] = ['*'],
  debug: boolean = false
): Promise<T[]> {
  const { sql: whereClause, params } = prismaWhereToSQL(where);
  const columns = select
    .map((col) => (col === '*' ? '*' : escapeIdentifier(col)))
    .join(', ');

  const query = `SELECT ${columns} FROM ${escapeIdentifier(tableName)} ${whereClause}`;

  if (debug) {
    console.log('SQL Query:', query);
    console.log('Parameters:', params);
  }

  try {
    // PostgreSQL uses $1, $2, etc. for parameters
    const result = await prisma.$queryRawUnsafe<T[]>(query, ...params);
    return result;
  } catch (error) {
    console.error('Error executing raw query:', error);
    console.error('Query was:', query);
    console.error('Parameters were:', params);
    throw error;
  }
}

// Example usage
// async function example() {
//   try {
//     const whereClause = {
//       AND: [{ name: { contains: 'John' } }, { age: { gte: 18 } }],
//       OR: [{ status: 'ACTIVE' }, { role: { in: ['ADMIN', 'MODERATOR'] } }],
//       NOT: {
//         email: { endsWith: '@example.com' },
//       },
//     };

//     // Query users with the given where condition
//     const users = await queryRawWithWhere(prisma, 'users', whereClause, [
//       'id',
//       'name',
//       'email',
//       'age',
//     ]);

//     console.log('Users:', users);
//   } catch (error) {
//     console.error('Error executing query:', error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// Extended example with order by, limit, offset
export async function extendedQuery<T>(
  prisma: PrismaClient,
  tableName: string,
  where: PrismaWhereCondition,
  options: {
    select?: string[];
    orderBy?: { [key: string]: 'asc' | 'desc' };
    limit?: number;
    offset?: number;
  } = {}
): Promise<T[]> {
  const { sql: whereClause, params } = prismaWhereToSQL(where);
  const columns = (options.select || ['*'])
    .map((col) => (col === '*' ? '*' : escapeIdentifier(col)))
    .join(', ');

  let query = `SELECT ${columns} FROM ${escapeIdentifier(tableName)} ${whereClause}`;

  // Add ORDER BY if specified
  if (options.orderBy && Object.keys(options.orderBy).length > 0) {
    const orderByClause = Object.entries(options.orderBy)
      .map(
        ([key, direction]) =>
          `${escapeIdentifier(key)} ${direction.toUpperCase()}`
      )
      .join(', ');
    query += ` ORDER BY ${orderByClause}`;
  }

  // Add LIMIT if specified
  if (options.limit !== undefined) {
    query += ` LIMIT ${options.limit}`;
  }

  // Add OFFSET if specified
  if (options.offset !== undefined) {
    query += ` OFFSET ${options.offset}`;
  }

  // Execute the query
  return await prisma.$queryRawUnsafe<T[]>(query, ...params);
}
