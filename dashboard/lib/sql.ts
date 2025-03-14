import { PrismaClient } from '@prisma/client';

interface PrismaWhereCondition {
  [key: string]: any;
}

/**
 * Converts a Prisma where condition to a PostgreSQL WHERE clause
 * @param where - The Prisma where condition object
 * @returns An object containing the SQL WHERE clause and parameter values
 */
function prismaWhereToSQL(
  where: PrismaWhereCondition,
  columnTypes?: { [key: string]: ColumnTypeInfo }
): {
  sql: string;
  params: any[];
} {
  const params: any[] = [];
  const sql = buildWhereClause(where, params, columnTypes);

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
function buildWhereClause(
  where: PrismaWhereCondition,
  params: any[],
  columnTypes?: { [key: string]: ColumnTypeInfo }
): string {
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
            .map((subWhere) => buildWhereClause(subWhere, params, columnTypes))
            .filter(Boolean);
          if (subConditions.length > 0) {
            conditions.push(`(${subConditions.join(` ${key} `)})`);
          }
        }
        continue;
      }

      if (key === 'NOT') {
        const notClause = buildWhereClause(value, params, columnTypes);
        if (notClause) {
          conditions.push(`NOT (${notClause})`);
        }
        continue;
      }

      // Find the actual column info, case-insensitive match
      let columnType;
      if (columnTypes) {
        const exactMatch = columnTypes[key];
        if (exactMatch) {
          columnType = exactMatch;
        } else {
          // Try case-insensitive match
          const columnName = Object.keys(columnTypes).find(
            (k) => k.toLowerCase() === key.toLowerCase()
          );
          if (columnName) {
            columnType = columnTypes[columnName];
          }
        }
      }

      // Handle field conditions
      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
      ) {
        const fieldConditions = processFieldConditions(
          key,
          value,
          params,
          columnType
        );
        if (fieldConditions) {
          conditions.push(fieldConditions);
        }
      } else {
        // Direct equality
        if (value === null) {
          conditions.push(`${escapeIdentifier(key)} IS NULL`);
        } else {
          params.push(value);

          // Apply type casting for enums
          if (columnType?.isEnum) {
            conditions.push(
              `${escapeIdentifier(key)} = ($${params.length}::"${columnType.schemaType}")`
            );
          } else {
            conditions.push(`${escapeIdentifier(key)} = $${params.length}`);
          }
        }
      }
    }
  }

  return conditions.join(' AND ');
}

function processFieldConditions(
  field: string,
  conditions: any,
  params: any[],
  columnType?: ColumnTypeInfo
): string {
  const fieldConditions: string[] = [];
  const escapedField = escapeIdentifier(field);
  const isEnum = columnType?.isEnum || false;
  const enumType = isEnum ? columnType?.schemaType : '';

  for (const op in conditions) {
    if (Object.prototype.hasOwnProperty.call(conditions, op)) {
      const value = conditions[op];

      switch (op) {
        case 'equals':
          if (value === null) {
            fieldConditions.push(`${escapedField} IS NULL`);
          } else {
            params.push(value);
            if (isEnum) {
              fieldConditions.push(
                `${escapedField} = ($${params.length}::"${enumType}")`
              );
            } else {
              fieldConditions.push(`${escapedField} = $${params.length}`);
            }
          }
          break;
        case 'not':
          if (value === null) {
            fieldConditions.push(`${escapedField} IS NOT NULL`);
          } else {
            params.push(value);
            if (isEnum) {
              fieldConditions.push(
                `${escapedField} <> ($${params.length}::"${enumType}")`
              );
            } else {
              fieldConditions.push(`${escapedField} <> $${params.length}`);
            }
          }
          break;
        case 'in':
          if (Array.isArray(value) && value.length > 0) {
            if (isEnum) {
              const placeholders = value.map((_, idx) => {
                params.push(value[idx]);
                return `($${params.length}::"${enumType}")`;
              });
              fieldConditions.push(
                `${escapedField} IN (${placeholders.join(', ')})`
              );
            } else {
              params.push(value);
              fieldConditions.push(`${escapedField} = ANY($${params.length})`);
            }
          }
          break;
        case 'notIn':
          if (Array.isArray(value) && value.length > 0) {
            if (isEnum) {
              const placeholders = value.map((_, idx) => {
                params.push(value[idx]);
                return `($${params.length}::"${enumType}")`;
              });
              fieldConditions.push(
                `${escapedField} NOT IN (${placeholders.join(', ')})`
              );
            } else {
              params.push(value);
              fieldConditions.push(
                `NOT (${escapedField} = ANY($${params.length}))`
              );
            }
          }
          break;
        case 'lt':
        case 'lte':
        case 'gt':
        case 'gte':
          params.push(value);
          const operator = { lt: '<', lte: '<=', gt: '>', gte: '>=' }[op];
          if (isEnum) {
            fieldConditions.push(
              `${escapedField} ${operator} ($${params.length}::"${enumType}")`
            );
          } else {
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
          fieldConditions.push(
            `${escapedField} ${value ? 'IS NULL' : 'IS NOT NULL'}`
          );
          break;
        default:
          params.push(value);
          if (isEnum) {
            fieldConditions.push(
              `${escapedField} = ($${params.length}::"${enumType}")`
            );
          } else {
            fieldConditions.push(`${escapedField} = $${params.length}`);
          }
          break;
      }
    }
  }

  return fieldConditions.length > 0 ? `(${fieldConditions.join(' AND ')})` : '';
}

interface ColumnTypeInfo {
  name: string; // 컬럼명
  type: string; // 컬럼의 데이터 타입 (예: "integer", "text", "USER-DEFINED" 등)
  isEnum: boolean; // Enum 여부 확인 (true이면 Enum 타입)
  schemaType: string; // PostgreSQL의 Enum 타입 이름 (예: "AuthType")
}

export async function getColumnTypesInfo(
  prisma: PrismaClient,
  tableName: string,
  schemaName: string = 'public'
): Promise<{ [key: string]: ColumnTypeInfo }> {
  // 문자열 리터럴을 사용하여 쿼리 작성
  const columnInfoQuery = `
    SELECT 
      c.column_name, 
      c.data_type,
      CASE 
        WHEN c.data_type = 'USER-DEFINED' THEN t.typname
        ELSE c.data_type 
      END AS type_name,
      (t.typtype = 'e') AS is_enum,
      t.typname AS schema_type
    FROM information_schema.columns c
    LEFT JOIN pg_catalog.pg_type t ON t.oid = (
      SELECT a.atttypid 
      FROM pg_catalog.pg_attribute a
      JOIN pg_catalog.pg_class cl ON cl.oid = a.attrelid
      JOIN pg_catalog.pg_namespace n ON n.oid = cl.relnamespace
      WHERE cl.relname = $1 
      AND n.nspname = $2
      AND a.attname = c.column_name
    )
    WHERE c.table_name = $1 
    AND c.table_schema = $2;
  `;

  try {
    // 쿼리 실행
    const columnInfo = await prisma.$queryRawUnsafe<
      {
        column_name: string;
        data_type: string;
        type_name: string;
        is_enum: boolean;
        schema_type: string;
      }[]
    >(columnInfoQuery, tableName, schemaName);

    const columnTypes: { [key: string]: ColumnTypeInfo } = {};

    // 결과 처리
    for (const column of columnInfo) {
      columnTypes[column.column_name] = {
        name: column.column_name,
        type: column.type_name,
        // 여기서 boolean 타입 확인
        isEnum: typeof column.is_enum === 'boolean' ? column.is_enum : false,
        schemaType: column.schema_type || '',
      };
    }

    return columnTypes;
  } catch (error) {
    console.error('Error fetching column types:', error);
    return {};
  }
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
  // 테이블의 컬럼 타입 정보 가져오기
  const columnTypes = await getColumnTypesInfo(prisma, tableName);

  const { sql: whereClause, params } = prismaWhereToSQL(where, columnTypes);
  const columns = select
    .map((col) => (col === '*' ? '*' : escapeIdentifier(col)))
    .join(', ');

  const query = `SELECT ${columns} FROM ${escapeIdentifier(tableName)} ${whereClause}`;

  if (debug) {
    console.log('SQL Query:', query);
    console.log('Parameters:', params);
    console.log('Column Types:', columnTypes);
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
  // 테이블의 컬럼 타입 정보 가져오기
  const columnTypes = await getColumnTypesInfo(prisma, tableName);
  const { sql: whereClause, params } = prismaWhereToSQL(where, columnTypes);
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
