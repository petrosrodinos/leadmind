
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Filter
 * 
 */
export type Filter = $Result.DefaultSelection<Prisma.$FilterPayload>
/**
 * Model RawLead
 * 
 */
export type RawLead = $Result.DefaultSelection<Prisma.$RawLeadPayload>
/**
 * Model Lead
 * 
 */
export type Lead = $Result.DefaultSelection<Prisma.$LeadPayload>
/**
 * Model Contact
 * 
 */
export type Contact = $Result.DefaultSelection<Prisma.$ContactPayload>
/**
 * Model ContactTag
 * 
 */
export type ContactTag = $Result.DefaultSelection<Prisma.$ContactTagPayload>
/**
 * Model Interaction
 * 
 */
export type Interaction = $Result.DefaultSelection<Prisma.$InteractionPayload>
/**
 * Model OutreachMessage
 * 
 */
export type OutreachMessage = $Result.DefaultSelection<Prisma.$OutreachMessagePayload>
/**
 * Model OutreachSequence
 * 
 */
export type OutreachSequence = $Result.DefaultSelection<Prisma.$OutreachSequencePayload>
/**
 * Model FilterJob
 * 
 */
export type FilterJob = $Result.DefaultSelection<Prisma.$FilterJobPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const AuthRole: {
  USER: 'USER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
  SUPPORT: 'SUPPORT'
};

export type AuthRole = (typeof AuthRole)[keyof typeof AuthRole]


export const SourceType: {
  LINKEDIN: 'LINKEDIN',
  GOOGLE_MAPS: 'GOOGLE_MAPS',
  GOOGLE_SEARCH: 'GOOGLE_SEARCH',
  GENERIC_LEAD: 'GENERIC_LEAD',
  WEBSITE_CRAWLER: 'WEBSITE_CRAWLER',
  GEMI: 'GEMI',
  MANUAL: 'MANUAL'
};

export type SourceType = (typeof SourceType)[keyof typeof SourceType]


export const Channel: {
  EMAIL: 'EMAIL',
  SMS: 'SMS',
  LINKEDIN: 'LINKEDIN'
};

export type Channel = (typeof Channel)[keyof typeof Channel]


export const LeadStatus: {
  NEW: 'NEW',
  CONTACTED: 'CONTACTED',
  CONVERTED: 'CONVERTED',
  ARCHIVED: 'ARCHIVED'
};

export type LeadStatus = (typeof LeadStatus)[keyof typeof LeadStatus]


export const JobStatus: {
  PENDING: 'PENDING',
  RUNNING: 'RUNNING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
};

export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus]


export const MsgStatus: {
  PENDING: 'PENDING',
  SENT: 'SENT',
  FAILED: 'FAILED'
};

export type MsgStatus = (typeof MsgStatus)[keyof typeof MsgStatus]


export const InteractionType: {
  NOTE: 'NOTE',
  CALL: 'CALL',
  EMAIL: 'EMAIL'
};

export type InteractionType = (typeof InteractionType)[keyof typeof InteractionType]

}

export type AuthRole = $Enums.AuthRole

export const AuthRole: typeof $Enums.AuthRole

export type SourceType = $Enums.SourceType

export const SourceType: typeof $Enums.SourceType

export type Channel = $Enums.Channel

export const Channel: typeof $Enums.Channel

export type LeadStatus = $Enums.LeadStatus

export const LeadStatus: typeof $Enums.LeadStatus

export type JobStatus = $Enums.JobStatus

export const JobStatus: typeof $Enums.JobStatus

export type MsgStatus = $Enums.MsgStatus

export const MsgStatus: typeof $Enums.MsgStatus

export type InteractionType = $Enums.InteractionType

export const InteractionType: typeof $Enums.InteractionType

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.filter`: Exposes CRUD operations for the **Filter** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Filters
    * const filters = await prisma.filter.findMany()
    * ```
    */
  get filter(): Prisma.FilterDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.rawLead`: Exposes CRUD operations for the **RawLead** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RawLeads
    * const rawLeads = await prisma.rawLead.findMany()
    * ```
    */
  get rawLead(): Prisma.RawLeadDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.lead`: Exposes CRUD operations for the **Lead** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Leads
    * const leads = await prisma.lead.findMany()
    * ```
    */
  get lead(): Prisma.LeadDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.contact`: Exposes CRUD operations for the **Contact** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Contacts
    * const contacts = await prisma.contact.findMany()
    * ```
    */
  get contact(): Prisma.ContactDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.contactTag`: Exposes CRUD operations for the **ContactTag** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ContactTags
    * const contactTags = await prisma.contactTag.findMany()
    * ```
    */
  get contactTag(): Prisma.ContactTagDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.interaction`: Exposes CRUD operations for the **Interaction** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Interactions
    * const interactions = await prisma.interaction.findMany()
    * ```
    */
  get interaction(): Prisma.InteractionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.outreachMessage`: Exposes CRUD operations for the **OutreachMessage** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OutreachMessages
    * const outreachMessages = await prisma.outreachMessage.findMany()
    * ```
    */
  get outreachMessage(): Prisma.OutreachMessageDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.outreachSequence`: Exposes CRUD operations for the **OutreachSequence** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OutreachSequences
    * const outreachSequences = await prisma.outreachSequence.findMany()
    * ```
    */
  get outreachSequence(): Prisma.OutreachSequenceDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.filterJob`: Exposes CRUD operations for the **FilterJob** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more FilterJobs
    * const filterJobs = await prisma.filterJob.findMany()
    * ```
    */
  get filterJob(): Prisma.FilterJobDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.2.0
   * Query Engine version: 0c8ef2ce45c83248ab3df073180d5eda9e8be7a3
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    Filter: 'Filter',
    RawLead: 'RawLead',
    Lead: 'Lead',
    Contact: 'Contact',
    ContactTag: 'ContactTag',
    Interaction: 'Interaction',
    OutreachMessage: 'OutreachMessage',
    OutreachSequence: 'OutreachSequence',
    FilterJob: 'FilterJob'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "filter" | "rawLead" | "lead" | "contact" | "contactTag" | "interaction" | "outreachMessage" | "outreachSequence" | "filterJob"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Filter: {
        payload: Prisma.$FilterPayload<ExtArgs>
        fields: Prisma.FilterFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FilterFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilterPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FilterFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilterPayload>
          }
          findFirst: {
            args: Prisma.FilterFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilterPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FilterFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilterPayload>
          }
          findMany: {
            args: Prisma.FilterFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilterPayload>[]
          }
          create: {
            args: Prisma.FilterCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilterPayload>
          }
          createMany: {
            args: Prisma.FilterCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FilterCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilterPayload>[]
          }
          delete: {
            args: Prisma.FilterDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilterPayload>
          }
          update: {
            args: Prisma.FilterUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilterPayload>
          }
          deleteMany: {
            args: Prisma.FilterDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FilterUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.FilterUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilterPayload>[]
          }
          upsert: {
            args: Prisma.FilterUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilterPayload>
          }
          aggregate: {
            args: Prisma.FilterAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFilter>
          }
          groupBy: {
            args: Prisma.FilterGroupByArgs<ExtArgs>
            result: $Utils.Optional<FilterGroupByOutputType>[]
          }
          count: {
            args: Prisma.FilterCountArgs<ExtArgs>
            result: $Utils.Optional<FilterCountAggregateOutputType> | number
          }
        }
      }
      RawLead: {
        payload: Prisma.$RawLeadPayload<ExtArgs>
        fields: Prisma.RawLeadFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RawLeadFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RawLeadPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RawLeadFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RawLeadPayload>
          }
          findFirst: {
            args: Prisma.RawLeadFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RawLeadPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RawLeadFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RawLeadPayload>
          }
          findMany: {
            args: Prisma.RawLeadFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RawLeadPayload>[]
          }
          create: {
            args: Prisma.RawLeadCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RawLeadPayload>
          }
          createMany: {
            args: Prisma.RawLeadCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RawLeadCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RawLeadPayload>[]
          }
          delete: {
            args: Prisma.RawLeadDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RawLeadPayload>
          }
          update: {
            args: Prisma.RawLeadUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RawLeadPayload>
          }
          deleteMany: {
            args: Prisma.RawLeadDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RawLeadUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RawLeadUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RawLeadPayload>[]
          }
          upsert: {
            args: Prisma.RawLeadUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RawLeadPayload>
          }
          aggregate: {
            args: Prisma.RawLeadAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRawLead>
          }
          groupBy: {
            args: Prisma.RawLeadGroupByArgs<ExtArgs>
            result: $Utils.Optional<RawLeadGroupByOutputType>[]
          }
          count: {
            args: Prisma.RawLeadCountArgs<ExtArgs>
            result: $Utils.Optional<RawLeadCountAggregateOutputType> | number
          }
        }
      }
      Lead: {
        payload: Prisma.$LeadPayload<ExtArgs>
        fields: Prisma.LeadFieldRefs
        operations: {
          findUnique: {
            args: Prisma.LeadFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.LeadFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadPayload>
          }
          findFirst: {
            args: Prisma.LeadFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.LeadFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadPayload>
          }
          findMany: {
            args: Prisma.LeadFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadPayload>[]
          }
          create: {
            args: Prisma.LeadCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadPayload>
          }
          createMany: {
            args: Prisma.LeadCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.LeadCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadPayload>[]
          }
          delete: {
            args: Prisma.LeadDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadPayload>
          }
          update: {
            args: Prisma.LeadUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadPayload>
          }
          deleteMany: {
            args: Prisma.LeadDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.LeadUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.LeadUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadPayload>[]
          }
          upsert: {
            args: Prisma.LeadUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeadPayload>
          }
          aggregate: {
            args: Prisma.LeadAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLead>
          }
          groupBy: {
            args: Prisma.LeadGroupByArgs<ExtArgs>
            result: $Utils.Optional<LeadGroupByOutputType>[]
          }
          count: {
            args: Prisma.LeadCountArgs<ExtArgs>
            result: $Utils.Optional<LeadCountAggregateOutputType> | number
          }
        }
      }
      Contact: {
        payload: Prisma.$ContactPayload<ExtArgs>
        fields: Prisma.ContactFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ContactFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ContactFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactPayload>
          }
          findFirst: {
            args: Prisma.ContactFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ContactFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactPayload>
          }
          findMany: {
            args: Prisma.ContactFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactPayload>[]
          }
          create: {
            args: Prisma.ContactCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactPayload>
          }
          createMany: {
            args: Prisma.ContactCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ContactCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactPayload>[]
          }
          delete: {
            args: Prisma.ContactDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactPayload>
          }
          update: {
            args: Prisma.ContactUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactPayload>
          }
          deleteMany: {
            args: Prisma.ContactDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ContactUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ContactUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactPayload>[]
          }
          upsert: {
            args: Prisma.ContactUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactPayload>
          }
          aggregate: {
            args: Prisma.ContactAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateContact>
          }
          groupBy: {
            args: Prisma.ContactGroupByArgs<ExtArgs>
            result: $Utils.Optional<ContactGroupByOutputType>[]
          }
          count: {
            args: Prisma.ContactCountArgs<ExtArgs>
            result: $Utils.Optional<ContactCountAggregateOutputType> | number
          }
        }
      }
      ContactTag: {
        payload: Prisma.$ContactTagPayload<ExtArgs>
        fields: Prisma.ContactTagFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ContactTagFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactTagPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ContactTagFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactTagPayload>
          }
          findFirst: {
            args: Prisma.ContactTagFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactTagPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ContactTagFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactTagPayload>
          }
          findMany: {
            args: Prisma.ContactTagFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactTagPayload>[]
          }
          create: {
            args: Prisma.ContactTagCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactTagPayload>
          }
          createMany: {
            args: Prisma.ContactTagCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ContactTagCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactTagPayload>[]
          }
          delete: {
            args: Prisma.ContactTagDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactTagPayload>
          }
          update: {
            args: Prisma.ContactTagUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactTagPayload>
          }
          deleteMany: {
            args: Prisma.ContactTagDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ContactTagUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ContactTagUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactTagPayload>[]
          }
          upsert: {
            args: Prisma.ContactTagUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactTagPayload>
          }
          aggregate: {
            args: Prisma.ContactTagAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateContactTag>
          }
          groupBy: {
            args: Prisma.ContactTagGroupByArgs<ExtArgs>
            result: $Utils.Optional<ContactTagGroupByOutputType>[]
          }
          count: {
            args: Prisma.ContactTagCountArgs<ExtArgs>
            result: $Utils.Optional<ContactTagCountAggregateOutputType> | number
          }
        }
      }
      Interaction: {
        payload: Prisma.$InteractionPayload<ExtArgs>
        fields: Prisma.InteractionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.InteractionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InteractionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.InteractionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InteractionPayload>
          }
          findFirst: {
            args: Prisma.InteractionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InteractionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.InteractionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InteractionPayload>
          }
          findMany: {
            args: Prisma.InteractionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InteractionPayload>[]
          }
          create: {
            args: Prisma.InteractionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InteractionPayload>
          }
          createMany: {
            args: Prisma.InteractionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.InteractionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InteractionPayload>[]
          }
          delete: {
            args: Prisma.InteractionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InteractionPayload>
          }
          update: {
            args: Prisma.InteractionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InteractionPayload>
          }
          deleteMany: {
            args: Prisma.InteractionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.InteractionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.InteractionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InteractionPayload>[]
          }
          upsert: {
            args: Prisma.InteractionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InteractionPayload>
          }
          aggregate: {
            args: Prisma.InteractionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateInteraction>
          }
          groupBy: {
            args: Prisma.InteractionGroupByArgs<ExtArgs>
            result: $Utils.Optional<InteractionGroupByOutputType>[]
          }
          count: {
            args: Prisma.InteractionCountArgs<ExtArgs>
            result: $Utils.Optional<InteractionCountAggregateOutputType> | number
          }
        }
      }
      OutreachMessage: {
        payload: Prisma.$OutreachMessagePayload<ExtArgs>
        fields: Prisma.OutreachMessageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OutreachMessageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutreachMessagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OutreachMessageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutreachMessagePayload>
          }
          findFirst: {
            args: Prisma.OutreachMessageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutreachMessagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OutreachMessageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutreachMessagePayload>
          }
          findMany: {
            args: Prisma.OutreachMessageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutreachMessagePayload>[]
          }
          create: {
            args: Prisma.OutreachMessageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutreachMessagePayload>
          }
          createMany: {
            args: Prisma.OutreachMessageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OutreachMessageCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutreachMessagePayload>[]
          }
          delete: {
            args: Prisma.OutreachMessageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutreachMessagePayload>
          }
          update: {
            args: Prisma.OutreachMessageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutreachMessagePayload>
          }
          deleteMany: {
            args: Prisma.OutreachMessageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OutreachMessageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OutreachMessageUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutreachMessagePayload>[]
          }
          upsert: {
            args: Prisma.OutreachMessageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutreachMessagePayload>
          }
          aggregate: {
            args: Prisma.OutreachMessageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOutreachMessage>
          }
          groupBy: {
            args: Prisma.OutreachMessageGroupByArgs<ExtArgs>
            result: $Utils.Optional<OutreachMessageGroupByOutputType>[]
          }
          count: {
            args: Prisma.OutreachMessageCountArgs<ExtArgs>
            result: $Utils.Optional<OutreachMessageCountAggregateOutputType> | number
          }
        }
      }
      OutreachSequence: {
        payload: Prisma.$OutreachSequencePayload<ExtArgs>
        fields: Prisma.OutreachSequenceFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OutreachSequenceFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutreachSequencePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OutreachSequenceFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutreachSequencePayload>
          }
          findFirst: {
            args: Prisma.OutreachSequenceFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutreachSequencePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OutreachSequenceFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutreachSequencePayload>
          }
          findMany: {
            args: Prisma.OutreachSequenceFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutreachSequencePayload>[]
          }
          create: {
            args: Prisma.OutreachSequenceCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutreachSequencePayload>
          }
          createMany: {
            args: Prisma.OutreachSequenceCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OutreachSequenceCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutreachSequencePayload>[]
          }
          delete: {
            args: Prisma.OutreachSequenceDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutreachSequencePayload>
          }
          update: {
            args: Prisma.OutreachSequenceUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutreachSequencePayload>
          }
          deleteMany: {
            args: Prisma.OutreachSequenceDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OutreachSequenceUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OutreachSequenceUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutreachSequencePayload>[]
          }
          upsert: {
            args: Prisma.OutreachSequenceUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutreachSequencePayload>
          }
          aggregate: {
            args: Prisma.OutreachSequenceAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOutreachSequence>
          }
          groupBy: {
            args: Prisma.OutreachSequenceGroupByArgs<ExtArgs>
            result: $Utils.Optional<OutreachSequenceGroupByOutputType>[]
          }
          count: {
            args: Prisma.OutreachSequenceCountArgs<ExtArgs>
            result: $Utils.Optional<OutreachSequenceCountAggregateOutputType> | number
          }
        }
      }
      FilterJob: {
        payload: Prisma.$FilterJobPayload<ExtArgs>
        fields: Prisma.FilterJobFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FilterJobFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilterJobPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FilterJobFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilterJobPayload>
          }
          findFirst: {
            args: Prisma.FilterJobFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilterJobPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FilterJobFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilterJobPayload>
          }
          findMany: {
            args: Prisma.FilterJobFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilterJobPayload>[]
          }
          create: {
            args: Prisma.FilterJobCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilterJobPayload>
          }
          createMany: {
            args: Prisma.FilterJobCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FilterJobCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilterJobPayload>[]
          }
          delete: {
            args: Prisma.FilterJobDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilterJobPayload>
          }
          update: {
            args: Prisma.FilterJobUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilterJobPayload>
          }
          deleteMany: {
            args: Prisma.FilterJobDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FilterJobUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.FilterJobUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilterJobPayload>[]
          }
          upsert: {
            args: Prisma.FilterJobUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FilterJobPayload>
          }
          aggregate: {
            args: Prisma.FilterJobAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFilterJob>
          }
          groupBy: {
            args: Prisma.FilterJobGroupByArgs<ExtArgs>
            result: $Utils.Optional<FilterJobGroupByOutputType>[]
          }
          count: {
            args: Prisma.FilterJobCountArgs<ExtArgs>
            result: $Utils.Optional<FilterJobCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    filter?: FilterOmit
    rawLead?: RawLeadOmit
    lead?: LeadOmit
    contact?: ContactOmit
    contactTag?: ContactTagOmit
    interaction?: InteractionOmit
    outreachMessage?: OutreachMessageOmit
    outreachSequence?: OutreachSequenceOmit
    filterJob?: FilterJobOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    filters: number
    contacts: number
    outreach_messages: number
    outreach_sequences: number
    interactions: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    filters?: boolean | UserCountOutputTypeCountFiltersArgs
    contacts?: boolean | UserCountOutputTypeCountContactsArgs
    outreach_messages?: boolean | UserCountOutputTypeCountOutreach_messagesArgs
    outreach_sequences?: boolean | UserCountOutputTypeCountOutreach_sequencesArgs
    interactions?: boolean | UserCountOutputTypeCountInteractionsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountFiltersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FilterWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountContactsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ContactWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountOutreach_messagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OutreachMessageWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountOutreach_sequencesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OutreachSequenceWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountInteractionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InteractionWhereInput
  }


  /**
   * Count Type FilterCountOutputType
   */

  export type FilterCountOutputType = {
    raw_leads: number
    contacts: number
    jobs: number
  }

  export type FilterCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    raw_leads?: boolean | FilterCountOutputTypeCountRaw_leadsArgs
    contacts?: boolean | FilterCountOutputTypeCountContactsArgs
    jobs?: boolean | FilterCountOutputTypeCountJobsArgs
  }

  // Custom InputTypes
  /**
   * FilterCountOutputType without action
   */
  export type FilterCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FilterCountOutputType
     */
    select?: FilterCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * FilterCountOutputType without action
   */
  export type FilterCountOutputTypeCountRaw_leadsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RawLeadWhereInput
  }

  /**
   * FilterCountOutputType without action
   */
  export type FilterCountOutputTypeCountContactsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ContactWhereInput
  }

  /**
   * FilterCountOutputType without action
   */
  export type FilterCountOutputTypeCountJobsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FilterJobWhereInput
  }


  /**
   * Count Type LeadCountOutputType
   */

  export type LeadCountOutputType = {
    contacts: number
  }

  export type LeadCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    contacts?: boolean | LeadCountOutputTypeCountContactsArgs
  }

  // Custom InputTypes
  /**
   * LeadCountOutputType without action
   */
  export type LeadCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeadCountOutputType
     */
    select?: LeadCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * LeadCountOutputType without action
   */
  export type LeadCountOutputTypeCountContactsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ContactWhereInput
  }


  /**
   * Count Type ContactCountOutputType
   */

  export type ContactCountOutputType = {
    tags: number
    interactions: number
    outreach_messages: number
  }

  export type ContactCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tags?: boolean | ContactCountOutputTypeCountTagsArgs
    interactions?: boolean | ContactCountOutputTypeCountInteractionsArgs
    outreach_messages?: boolean | ContactCountOutputTypeCountOutreach_messagesArgs
  }

  // Custom InputTypes
  /**
   * ContactCountOutputType without action
   */
  export type ContactCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactCountOutputType
     */
    select?: ContactCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ContactCountOutputType without action
   */
  export type ContactCountOutputTypeCountTagsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ContactTagWhereInput
  }

  /**
   * ContactCountOutputType without action
   */
  export type ContactCountOutputTypeCountInteractionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InteractionWhereInput
  }

  /**
   * ContactCountOutputType without action
   */
  export type ContactCountOutputTypeCountOutreach_messagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OutreachMessageWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserAvgAggregateOutputType = {
    id: number | null
  }

  export type UserSumAggregateOutputType = {
    id: number | null
  }

  export type UserMinAggregateOutputType = {
    id: number | null
    uuid: string | null
    email: string | null
    phone: string | null
    password: string | null
    role: $Enums.AuthRole | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: number | null
    uuid: string | null
    email: string | null
    phone: string | null
    password: string | null
    role: $Enums.AuthRole | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    uuid: number
    email: number
    phone: number
    password: number
    role: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type UserAvgAggregateInputType = {
    id?: true
  }

  export type UserSumAggregateInputType = {
    id?: true
  }

  export type UserMinAggregateInputType = {
    id?: true
    uuid?: true
    email?: true
    phone?: true
    password?: true
    role?: true
    created_at?: true
    updated_at?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    uuid?: true
    email?: true
    phone?: true
    password?: true
    role?: true
    created_at?: true
    updated_at?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    uuid?: true
    email?: true
    phone?: true
    password?: true
    role?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _avg?: UserAvgAggregateInputType
    _sum?: UserSumAggregateInputType
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: number
    uuid: string
    email: string
    phone: string | null
    password: string
    role: $Enums.AuthRole
    created_at: Date
    updated_at: Date
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    uuid?: boolean
    email?: boolean
    phone?: boolean
    password?: boolean
    role?: boolean
    created_at?: boolean
    updated_at?: boolean
    filters?: boolean | User$filtersArgs<ExtArgs>
    contacts?: boolean | User$contactsArgs<ExtArgs>
    outreach_messages?: boolean | User$outreach_messagesArgs<ExtArgs>
    outreach_sequences?: boolean | User$outreach_sequencesArgs<ExtArgs>
    interactions?: boolean | User$interactionsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    uuid?: boolean
    email?: boolean
    phone?: boolean
    password?: boolean
    role?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    uuid?: boolean
    email?: boolean
    phone?: boolean
    password?: boolean
    role?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    uuid?: boolean
    email?: boolean
    phone?: boolean
    password?: boolean
    role?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "uuid" | "email" | "phone" | "password" | "role" | "created_at" | "updated_at", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    filters?: boolean | User$filtersArgs<ExtArgs>
    contacts?: boolean | User$contactsArgs<ExtArgs>
    outreach_messages?: boolean | User$outreach_messagesArgs<ExtArgs>
    outreach_sequences?: boolean | User$outreach_sequencesArgs<ExtArgs>
    interactions?: boolean | User$interactionsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      filters: Prisma.$FilterPayload<ExtArgs>[]
      contacts: Prisma.$ContactPayload<ExtArgs>[]
      outreach_messages: Prisma.$OutreachMessagePayload<ExtArgs>[]
      outreach_sequences: Prisma.$OutreachSequencePayload<ExtArgs>[]
      interactions: Prisma.$InteractionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      uuid: string
      email: string
      phone: string | null
      password: string
      role: $Enums.AuthRole
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    filters<T extends User$filtersArgs<ExtArgs> = {}>(args?: Subset<T, User$filtersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FilterPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    contacts<T extends User$contactsArgs<ExtArgs> = {}>(args?: Subset<T, User$contactsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ContactPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    outreach_messages<T extends User$outreach_messagesArgs<ExtArgs> = {}>(args?: Subset<T, User$outreach_messagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OutreachMessagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    outreach_sequences<T extends User$outreach_sequencesArgs<ExtArgs> = {}>(args?: Subset<T, User$outreach_sequencesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OutreachSequencePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    interactions<T extends User$interactionsArgs<ExtArgs> = {}>(args?: Subset<T, User$interactionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InteractionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'Int'>
    readonly uuid: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly phone: FieldRef<"User", 'String'>
    readonly password: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'AuthRole'>
    readonly created_at: FieldRef<"User", 'DateTime'>
    readonly updated_at: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.filters
   */
  export type User$filtersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Filter
     */
    select?: FilterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Filter
     */
    omit?: FilterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FilterInclude<ExtArgs> | null
    where?: FilterWhereInput
    orderBy?: FilterOrderByWithRelationInput | FilterOrderByWithRelationInput[]
    cursor?: FilterWhereUniqueInput
    take?: number
    skip?: number
    distinct?: FilterScalarFieldEnum | FilterScalarFieldEnum[]
  }

  /**
   * User.contacts
   */
  export type User$contactsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Contact
     */
    select?: ContactSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Contact
     */
    omit?: ContactOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactInclude<ExtArgs> | null
    where?: ContactWhereInput
    orderBy?: ContactOrderByWithRelationInput | ContactOrderByWithRelationInput[]
    cursor?: ContactWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ContactScalarFieldEnum | ContactScalarFieldEnum[]
  }

  /**
   * User.outreach_messages
   */
  export type User$outreach_messagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutreachMessage
     */
    select?: OutreachMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutreachMessage
     */
    omit?: OutreachMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutreachMessageInclude<ExtArgs> | null
    where?: OutreachMessageWhereInput
    orderBy?: OutreachMessageOrderByWithRelationInput | OutreachMessageOrderByWithRelationInput[]
    cursor?: OutreachMessageWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OutreachMessageScalarFieldEnum | OutreachMessageScalarFieldEnum[]
  }

  /**
   * User.outreach_sequences
   */
  export type User$outreach_sequencesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutreachSequence
     */
    select?: OutreachSequenceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutreachSequence
     */
    omit?: OutreachSequenceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutreachSequenceInclude<ExtArgs> | null
    where?: OutreachSequenceWhereInput
    orderBy?: OutreachSequenceOrderByWithRelationInput | OutreachSequenceOrderByWithRelationInput[]
    cursor?: OutreachSequenceWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OutreachSequenceScalarFieldEnum | OutreachSequenceScalarFieldEnum[]
  }

  /**
   * User.interactions
   */
  export type User$interactionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Interaction
     */
    select?: InteractionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Interaction
     */
    omit?: InteractionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InteractionInclude<ExtArgs> | null
    where?: InteractionWhereInput
    orderBy?: InteractionOrderByWithRelationInput | InteractionOrderByWithRelationInput[]
    cursor?: InteractionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: InteractionScalarFieldEnum | InteractionScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Filter
   */

  export type AggregateFilter = {
    _count: FilterCountAggregateOutputType | null
    _avg: FilterAvgAggregateOutputType | null
    _sum: FilterSumAggregateOutputType | null
    _min: FilterMinAggregateOutputType | null
    _max: FilterMaxAggregateOutputType | null
  }

  export type FilterAvgAggregateOutputType = {
    id: number | null
  }

  export type FilterSumAggregateOutputType = {
    id: number | null
  }

  export type FilterMinAggregateOutputType = {
    id: number | null
    uuid: string | null
    user_uuid: string | null
    name: string | null
    source_type: $Enums.SourceType | null
    enabled: boolean | null
    cron_schedule: string | null
    ai_instructions: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type FilterMaxAggregateOutputType = {
    id: number | null
    uuid: string | null
    user_uuid: string | null
    name: string | null
    source_type: $Enums.SourceType | null
    enabled: boolean | null
    cron_schedule: string | null
    ai_instructions: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type FilterCountAggregateOutputType = {
    id: number
    uuid: number
    user_uuid: number
    name: number
    source_type: number
    query_config: number
    enabled: number
    cron_schedule: number
    channels: number
    ai_instructions: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type FilterAvgAggregateInputType = {
    id?: true
  }

  export type FilterSumAggregateInputType = {
    id?: true
  }

  export type FilterMinAggregateInputType = {
    id?: true
    uuid?: true
    user_uuid?: true
    name?: true
    source_type?: true
    enabled?: true
    cron_schedule?: true
    ai_instructions?: true
    created_at?: true
    updated_at?: true
  }

  export type FilterMaxAggregateInputType = {
    id?: true
    uuid?: true
    user_uuid?: true
    name?: true
    source_type?: true
    enabled?: true
    cron_schedule?: true
    ai_instructions?: true
    created_at?: true
    updated_at?: true
  }

  export type FilterCountAggregateInputType = {
    id?: true
    uuid?: true
    user_uuid?: true
    name?: true
    source_type?: true
    query_config?: true
    enabled?: true
    cron_schedule?: true
    channels?: true
    ai_instructions?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type FilterAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Filter to aggregate.
     */
    where?: FilterWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Filters to fetch.
     */
    orderBy?: FilterOrderByWithRelationInput | FilterOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FilterWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Filters from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Filters.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Filters
    **/
    _count?: true | FilterCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: FilterAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: FilterSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FilterMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FilterMaxAggregateInputType
  }

  export type GetFilterAggregateType<T extends FilterAggregateArgs> = {
        [P in keyof T & keyof AggregateFilter]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFilter[P]>
      : GetScalarType<T[P], AggregateFilter[P]>
  }




  export type FilterGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FilterWhereInput
    orderBy?: FilterOrderByWithAggregationInput | FilterOrderByWithAggregationInput[]
    by: FilterScalarFieldEnum[] | FilterScalarFieldEnum
    having?: FilterScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FilterCountAggregateInputType | true
    _avg?: FilterAvgAggregateInputType
    _sum?: FilterSumAggregateInputType
    _min?: FilterMinAggregateInputType
    _max?: FilterMaxAggregateInputType
  }

  export type FilterGroupByOutputType = {
    id: number
    uuid: string
    user_uuid: string
    name: string
    source_type: $Enums.SourceType
    query_config: JsonValue
    enabled: boolean
    cron_schedule: string | null
    channels: $Enums.Channel[]
    ai_instructions: string | null
    created_at: Date
    updated_at: Date
    _count: FilterCountAggregateOutputType | null
    _avg: FilterAvgAggregateOutputType | null
    _sum: FilterSumAggregateOutputType | null
    _min: FilterMinAggregateOutputType | null
    _max: FilterMaxAggregateOutputType | null
  }

  type GetFilterGroupByPayload<T extends FilterGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FilterGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FilterGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FilterGroupByOutputType[P]>
            : GetScalarType<T[P], FilterGroupByOutputType[P]>
        }
      >
    >


  export type FilterSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    uuid?: boolean
    user_uuid?: boolean
    name?: boolean
    source_type?: boolean
    query_config?: boolean
    enabled?: boolean
    cron_schedule?: boolean
    channels?: boolean
    ai_instructions?: boolean
    created_at?: boolean
    updated_at?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    raw_leads?: boolean | Filter$raw_leadsArgs<ExtArgs>
    contacts?: boolean | Filter$contactsArgs<ExtArgs>
    jobs?: boolean | Filter$jobsArgs<ExtArgs>
    _count?: boolean | FilterCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["filter"]>

  export type FilterSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    uuid?: boolean
    user_uuid?: boolean
    name?: boolean
    source_type?: boolean
    query_config?: boolean
    enabled?: boolean
    cron_schedule?: boolean
    channels?: boolean
    ai_instructions?: boolean
    created_at?: boolean
    updated_at?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["filter"]>

  export type FilterSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    uuid?: boolean
    user_uuid?: boolean
    name?: boolean
    source_type?: boolean
    query_config?: boolean
    enabled?: boolean
    cron_schedule?: boolean
    channels?: boolean
    ai_instructions?: boolean
    created_at?: boolean
    updated_at?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["filter"]>

  export type FilterSelectScalar = {
    id?: boolean
    uuid?: boolean
    user_uuid?: boolean
    name?: boolean
    source_type?: boolean
    query_config?: boolean
    enabled?: boolean
    cron_schedule?: boolean
    channels?: boolean
    ai_instructions?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type FilterOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "uuid" | "user_uuid" | "name" | "source_type" | "query_config" | "enabled" | "cron_schedule" | "channels" | "ai_instructions" | "created_at" | "updated_at", ExtArgs["result"]["filter"]>
  export type FilterInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    raw_leads?: boolean | Filter$raw_leadsArgs<ExtArgs>
    contacts?: boolean | Filter$contactsArgs<ExtArgs>
    jobs?: boolean | Filter$jobsArgs<ExtArgs>
    _count?: boolean | FilterCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type FilterIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type FilterIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $FilterPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Filter"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      raw_leads: Prisma.$RawLeadPayload<ExtArgs>[]
      contacts: Prisma.$ContactPayload<ExtArgs>[]
      jobs: Prisma.$FilterJobPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      uuid: string
      user_uuid: string
      name: string
      source_type: $Enums.SourceType
      query_config: Prisma.JsonValue
      enabled: boolean
      cron_schedule: string | null
      channels: $Enums.Channel[]
      ai_instructions: string | null
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["filter"]>
    composites: {}
  }

  type FilterGetPayload<S extends boolean | null | undefined | FilterDefaultArgs> = $Result.GetResult<Prisma.$FilterPayload, S>

  type FilterCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<FilterFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: FilterCountAggregateInputType | true
    }

  export interface FilterDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Filter'], meta: { name: 'Filter' } }
    /**
     * Find zero or one Filter that matches the filter.
     * @param {FilterFindUniqueArgs} args - Arguments to find a Filter
     * @example
     * // Get one Filter
     * const filter = await prisma.filter.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FilterFindUniqueArgs>(args: SelectSubset<T, FilterFindUniqueArgs<ExtArgs>>): Prisma__FilterClient<$Result.GetResult<Prisma.$FilterPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Filter that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {FilterFindUniqueOrThrowArgs} args - Arguments to find a Filter
     * @example
     * // Get one Filter
     * const filter = await prisma.filter.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FilterFindUniqueOrThrowArgs>(args: SelectSubset<T, FilterFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FilterClient<$Result.GetResult<Prisma.$FilterPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Filter that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FilterFindFirstArgs} args - Arguments to find a Filter
     * @example
     * // Get one Filter
     * const filter = await prisma.filter.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FilterFindFirstArgs>(args?: SelectSubset<T, FilterFindFirstArgs<ExtArgs>>): Prisma__FilterClient<$Result.GetResult<Prisma.$FilterPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Filter that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FilterFindFirstOrThrowArgs} args - Arguments to find a Filter
     * @example
     * // Get one Filter
     * const filter = await prisma.filter.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FilterFindFirstOrThrowArgs>(args?: SelectSubset<T, FilterFindFirstOrThrowArgs<ExtArgs>>): Prisma__FilterClient<$Result.GetResult<Prisma.$FilterPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Filters that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FilterFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Filters
     * const filters = await prisma.filter.findMany()
     * 
     * // Get first 10 Filters
     * const filters = await prisma.filter.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const filterWithIdOnly = await prisma.filter.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends FilterFindManyArgs>(args?: SelectSubset<T, FilterFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FilterPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Filter.
     * @param {FilterCreateArgs} args - Arguments to create a Filter.
     * @example
     * // Create one Filter
     * const Filter = await prisma.filter.create({
     *   data: {
     *     // ... data to create a Filter
     *   }
     * })
     * 
     */
    create<T extends FilterCreateArgs>(args: SelectSubset<T, FilterCreateArgs<ExtArgs>>): Prisma__FilterClient<$Result.GetResult<Prisma.$FilterPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Filters.
     * @param {FilterCreateManyArgs} args - Arguments to create many Filters.
     * @example
     * // Create many Filters
     * const filter = await prisma.filter.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FilterCreateManyArgs>(args?: SelectSubset<T, FilterCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Filters and returns the data saved in the database.
     * @param {FilterCreateManyAndReturnArgs} args - Arguments to create many Filters.
     * @example
     * // Create many Filters
     * const filter = await prisma.filter.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Filters and only return the `id`
     * const filterWithIdOnly = await prisma.filter.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FilterCreateManyAndReturnArgs>(args?: SelectSubset<T, FilterCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FilterPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Filter.
     * @param {FilterDeleteArgs} args - Arguments to delete one Filter.
     * @example
     * // Delete one Filter
     * const Filter = await prisma.filter.delete({
     *   where: {
     *     // ... filter to delete one Filter
     *   }
     * })
     * 
     */
    delete<T extends FilterDeleteArgs>(args: SelectSubset<T, FilterDeleteArgs<ExtArgs>>): Prisma__FilterClient<$Result.GetResult<Prisma.$FilterPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Filter.
     * @param {FilterUpdateArgs} args - Arguments to update one Filter.
     * @example
     * // Update one Filter
     * const filter = await prisma.filter.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FilterUpdateArgs>(args: SelectSubset<T, FilterUpdateArgs<ExtArgs>>): Prisma__FilterClient<$Result.GetResult<Prisma.$FilterPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Filters.
     * @param {FilterDeleteManyArgs} args - Arguments to filter Filters to delete.
     * @example
     * // Delete a few Filters
     * const { count } = await prisma.filter.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FilterDeleteManyArgs>(args?: SelectSubset<T, FilterDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Filters.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FilterUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Filters
     * const filter = await prisma.filter.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FilterUpdateManyArgs>(args: SelectSubset<T, FilterUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Filters and returns the data updated in the database.
     * @param {FilterUpdateManyAndReturnArgs} args - Arguments to update many Filters.
     * @example
     * // Update many Filters
     * const filter = await prisma.filter.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Filters and only return the `id`
     * const filterWithIdOnly = await prisma.filter.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends FilterUpdateManyAndReturnArgs>(args: SelectSubset<T, FilterUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FilterPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Filter.
     * @param {FilterUpsertArgs} args - Arguments to update or create a Filter.
     * @example
     * // Update or create a Filter
     * const filter = await prisma.filter.upsert({
     *   create: {
     *     // ... data to create a Filter
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Filter we want to update
     *   }
     * })
     */
    upsert<T extends FilterUpsertArgs>(args: SelectSubset<T, FilterUpsertArgs<ExtArgs>>): Prisma__FilterClient<$Result.GetResult<Prisma.$FilterPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Filters.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FilterCountArgs} args - Arguments to filter Filters to count.
     * @example
     * // Count the number of Filters
     * const count = await prisma.filter.count({
     *   where: {
     *     // ... the filter for the Filters we want to count
     *   }
     * })
    **/
    count<T extends FilterCountArgs>(
      args?: Subset<T, FilterCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FilterCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FilterAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends FilterAggregateArgs>(args: Subset<T, FilterAggregateArgs>): Prisma.PrismaPromise<GetFilterAggregateType<T>>

    /**
     * Group by Filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FilterGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends FilterGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FilterGroupByArgs['orderBy'] }
        : { orderBy?: FilterGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, FilterGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFilterGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Filter model
   */
  readonly fields: FilterFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Filter.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FilterClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    raw_leads<T extends Filter$raw_leadsArgs<ExtArgs> = {}>(args?: Subset<T, Filter$raw_leadsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RawLeadPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    contacts<T extends Filter$contactsArgs<ExtArgs> = {}>(args?: Subset<T, Filter$contactsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ContactPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    jobs<T extends Filter$jobsArgs<ExtArgs> = {}>(args?: Subset<T, Filter$jobsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FilterJobPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Filter model
   */
  interface FilterFieldRefs {
    readonly id: FieldRef<"Filter", 'Int'>
    readonly uuid: FieldRef<"Filter", 'String'>
    readonly user_uuid: FieldRef<"Filter", 'String'>
    readonly name: FieldRef<"Filter", 'String'>
    readonly source_type: FieldRef<"Filter", 'SourceType'>
    readonly query_config: FieldRef<"Filter", 'Json'>
    readonly enabled: FieldRef<"Filter", 'Boolean'>
    readonly cron_schedule: FieldRef<"Filter", 'String'>
    readonly channels: FieldRef<"Filter", 'Channel[]'>
    readonly ai_instructions: FieldRef<"Filter", 'String'>
    readonly created_at: FieldRef<"Filter", 'DateTime'>
    readonly updated_at: FieldRef<"Filter", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Filter findUnique
   */
  export type FilterFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Filter
     */
    select?: FilterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Filter
     */
    omit?: FilterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FilterInclude<ExtArgs> | null
    /**
     * Filter, which Filter to fetch.
     */
    where: FilterWhereUniqueInput
  }

  /**
   * Filter findUniqueOrThrow
   */
  export type FilterFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Filter
     */
    select?: FilterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Filter
     */
    omit?: FilterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FilterInclude<ExtArgs> | null
    /**
     * Filter, which Filter to fetch.
     */
    where: FilterWhereUniqueInput
  }

  /**
   * Filter findFirst
   */
  export type FilterFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Filter
     */
    select?: FilterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Filter
     */
    omit?: FilterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FilterInclude<ExtArgs> | null
    /**
     * Filter, which Filter to fetch.
     */
    where?: FilterWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Filters to fetch.
     */
    orderBy?: FilterOrderByWithRelationInput | FilterOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Filters.
     */
    cursor?: FilterWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Filters from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Filters.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Filters.
     */
    distinct?: FilterScalarFieldEnum | FilterScalarFieldEnum[]
  }

  /**
   * Filter findFirstOrThrow
   */
  export type FilterFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Filter
     */
    select?: FilterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Filter
     */
    omit?: FilterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FilterInclude<ExtArgs> | null
    /**
     * Filter, which Filter to fetch.
     */
    where?: FilterWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Filters to fetch.
     */
    orderBy?: FilterOrderByWithRelationInput | FilterOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Filters.
     */
    cursor?: FilterWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Filters from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Filters.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Filters.
     */
    distinct?: FilterScalarFieldEnum | FilterScalarFieldEnum[]
  }

  /**
   * Filter findMany
   */
  export type FilterFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Filter
     */
    select?: FilterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Filter
     */
    omit?: FilterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FilterInclude<ExtArgs> | null
    /**
     * Filter, which Filters to fetch.
     */
    where?: FilterWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Filters to fetch.
     */
    orderBy?: FilterOrderByWithRelationInput | FilterOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Filters.
     */
    cursor?: FilterWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Filters from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Filters.
     */
    skip?: number
    distinct?: FilterScalarFieldEnum | FilterScalarFieldEnum[]
  }

  /**
   * Filter create
   */
  export type FilterCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Filter
     */
    select?: FilterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Filter
     */
    omit?: FilterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FilterInclude<ExtArgs> | null
    /**
     * The data needed to create a Filter.
     */
    data: XOR<FilterCreateInput, FilterUncheckedCreateInput>
  }

  /**
   * Filter createMany
   */
  export type FilterCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Filters.
     */
    data: FilterCreateManyInput | FilterCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Filter createManyAndReturn
   */
  export type FilterCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Filter
     */
    select?: FilterSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Filter
     */
    omit?: FilterOmit<ExtArgs> | null
    /**
     * The data used to create many Filters.
     */
    data: FilterCreateManyInput | FilterCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FilterIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Filter update
   */
  export type FilterUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Filter
     */
    select?: FilterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Filter
     */
    omit?: FilterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FilterInclude<ExtArgs> | null
    /**
     * The data needed to update a Filter.
     */
    data: XOR<FilterUpdateInput, FilterUncheckedUpdateInput>
    /**
     * Choose, which Filter to update.
     */
    where: FilterWhereUniqueInput
  }

  /**
   * Filter updateMany
   */
  export type FilterUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Filters.
     */
    data: XOR<FilterUpdateManyMutationInput, FilterUncheckedUpdateManyInput>
    /**
     * Filter which Filters to update
     */
    where?: FilterWhereInput
    /**
     * Limit how many Filters to update.
     */
    limit?: number
  }

  /**
   * Filter updateManyAndReturn
   */
  export type FilterUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Filter
     */
    select?: FilterSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Filter
     */
    omit?: FilterOmit<ExtArgs> | null
    /**
     * The data used to update Filters.
     */
    data: XOR<FilterUpdateManyMutationInput, FilterUncheckedUpdateManyInput>
    /**
     * Filter which Filters to update
     */
    where?: FilterWhereInput
    /**
     * Limit how many Filters to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FilterIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Filter upsert
   */
  export type FilterUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Filter
     */
    select?: FilterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Filter
     */
    omit?: FilterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FilterInclude<ExtArgs> | null
    /**
     * The filter to search for the Filter to update in case it exists.
     */
    where: FilterWhereUniqueInput
    /**
     * In case the Filter found by the `where` argument doesn't exist, create a new Filter with this data.
     */
    create: XOR<FilterCreateInput, FilterUncheckedCreateInput>
    /**
     * In case the Filter was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FilterUpdateInput, FilterUncheckedUpdateInput>
  }

  /**
   * Filter delete
   */
  export type FilterDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Filter
     */
    select?: FilterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Filter
     */
    omit?: FilterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FilterInclude<ExtArgs> | null
    /**
     * Filter which Filter to delete.
     */
    where: FilterWhereUniqueInput
  }

  /**
   * Filter deleteMany
   */
  export type FilterDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Filters to delete
     */
    where?: FilterWhereInput
    /**
     * Limit how many Filters to delete.
     */
    limit?: number
  }

  /**
   * Filter.raw_leads
   */
  export type Filter$raw_leadsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RawLead
     */
    select?: RawLeadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RawLead
     */
    omit?: RawLeadOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RawLeadInclude<ExtArgs> | null
    where?: RawLeadWhereInput
    orderBy?: RawLeadOrderByWithRelationInput | RawLeadOrderByWithRelationInput[]
    cursor?: RawLeadWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RawLeadScalarFieldEnum | RawLeadScalarFieldEnum[]
  }

  /**
   * Filter.contacts
   */
  export type Filter$contactsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Contact
     */
    select?: ContactSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Contact
     */
    omit?: ContactOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactInclude<ExtArgs> | null
    where?: ContactWhereInput
    orderBy?: ContactOrderByWithRelationInput | ContactOrderByWithRelationInput[]
    cursor?: ContactWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ContactScalarFieldEnum | ContactScalarFieldEnum[]
  }

  /**
   * Filter.jobs
   */
  export type Filter$jobsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FilterJob
     */
    select?: FilterJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FilterJob
     */
    omit?: FilterJobOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FilterJobInclude<ExtArgs> | null
    where?: FilterJobWhereInput
    orderBy?: FilterJobOrderByWithRelationInput | FilterJobOrderByWithRelationInput[]
    cursor?: FilterJobWhereUniqueInput
    take?: number
    skip?: number
    distinct?: FilterJobScalarFieldEnum | FilterJobScalarFieldEnum[]
  }

  /**
   * Filter without action
   */
  export type FilterDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Filter
     */
    select?: FilterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Filter
     */
    omit?: FilterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FilterInclude<ExtArgs> | null
  }


  /**
   * Model RawLead
   */

  export type AggregateRawLead = {
    _count: RawLeadCountAggregateOutputType | null
    _avg: RawLeadAvgAggregateOutputType | null
    _sum: RawLeadSumAggregateOutputType | null
    _min: RawLeadMinAggregateOutputType | null
    _max: RawLeadMaxAggregateOutputType | null
  }

  export type RawLeadAvgAggregateOutputType = {
    id: number | null
  }

  export type RawLeadSumAggregateOutputType = {
    id: number | null
  }

  export type RawLeadMinAggregateOutputType = {
    id: number | null
    uuid: string | null
    filter_uuid: string | null
    source_type: $Enums.SourceType | null
    processed_at: Date | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type RawLeadMaxAggregateOutputType = {
    id: number | null
    uuid: string | null
    filter_uuid: string | null
    source_type: $Enums.SourceType | null
    processed_at: Date | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type RawLeadCountAggregateOutputType = {
    id: number
    uuid: number
    filter_uuid: number
    source_type: number
    raw_data: number
    processed_at: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type RawLeadAvgAggregateInputType = {
    id?: true
  }

  export type RawLeadSumAggregateInputType = {
    id?: true
  }

  export type RawLeadMinAggregateInputType = {
    id?: true
    uuid?: true
    filter_uuid?: true
    source_type?: true
    processed_at?: true
    created_at?: true
    updated_at?: true
  }

  export type RawLeadMaxAggregateInputType = {
    id?: true
    uuid?: true
    filter_uuid?: true
    source_type?: true
    processed_at?: true
    created_at?: true
    updated_at?: true
  }

  export type RawLeadCountAggregateInputType = {
    id?: true
    uuid?: true
    filter_uuid?: true
    source_type?: true
    raw_data?: true
    processed_at?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type RawLeadAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RawLead to aggregate.
     */
    where?: RawLeadWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RawLeads to fetch.
     */
    orderBy?: RawLeadOrderByWithRelationInput | RawLeadOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RawLeadWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RawLeads from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RawLeads.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RawLeads
    **/
    _count?: true | RawLeadCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RawLeadAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RawLeadSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RawLeadMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RawLeadMaxAggregateInputType
  }

  export type GetRawLeadAggregateType<T extends RawLeadAggregateArgs> = {
        [P in keyof T & keyof AggregateRawLead]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRawLead[P]>
      : GetScalarType<T[P], AggregateRawLead[P]>
  }




  export type RawLeadGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RawLeadWhereInput
    orderBy?: RawLeadOrderByWithAggregationInput | RawLeadOrderByWithAggregationInput[]
    by: RawLeadScalarFieldEnum[] | RawLeadScalarFieldEnum
    having?: RawLeadScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RawLeadCountAggregateInputType | true
    _avg?: RawLeadAvgAggregateInputType
    _sum?: RawLeadSumAggregateInputType
    _min?: RawLeadMinAggregateInputType
    _max?: RawLeadMaxAggregateInputType
  }

  export type RawLeadGroupByOutputType = {
    id: number
    uuid: string
    filter_uuid: string
    source_type: $Enums.SourceType
    raw_data: JsonValue
    processed_at: Date | null
    created_at: Date
    updated_at: Date
    _count: RawLeadCountAggregateOutputType | null
    _avg: RawLeadAvgAggregateOutputType | null
    _sum: RawLeadSumAggregateOutputType | null
    _min: RawLeadMinAggregateOutputType | null
    _max: RawLeadMaxAggregateOutputType | null
  }

  type GetRawLeadGroupByPayload<T extends RawLeadGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RawLeadGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RawLeadGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RawLeadGroupByOutputType[P]>
            : GetScalarType<T[P], RawLeadGroupByOutputType[P]>
        }
      >
    >


  export type RawLeadSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    uuid?: boolean
    filter_uuid?: boolean
    source_type?: boolean
    raw_data?: boolean
    processed_at?: boolean
    created_at?: boolean
    updated_at?: boolean
    filter?: boolean | FilterDefaultArgs<ExtArgs>
    lead?: boolean | RawLead$leadArgs<ExtArgs>
  }, ExtArgs["result"]["rawLead"]>

  export type RawLeadSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    uuid?: boolean
    filter_uuid?: boolean
    source_type?: boolean
    raw_data?: boolean
    processed_at?: boolean
    created_at?: boolean
    updated_at?: boolean
    filter?: boolean | FilterDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["rawLead"]>

  export type RawLeadSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    uuid?: boolean
    filter_uuid?: boolean
    source_type?: boolean
    raw_data?: boolean
    processed_at?: boolean
    created_at?: boolean
    updated_at?: boolean
    filter?: boolean | FilterDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["rawLead"]>

  export type RawLeadSelectScalar = {
    id?: boolean
    uuid?: boolean
    filter_uuid?: boolean
    source_type?: boolean
    raw_data?: boolean
    processed_at?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type RawLeadOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "uuid" | "filter_uuid" | "source_type" | "raw_data" | "processed_at" | "created_at" | "updated_at", ExtArgs["result"]["rawLead"]>
  export type RawLeadInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    filter?: boolean | FilterDefaultArgs<ExtArgs>
    lead?: boolean | RawLead$leadArgs<ExtArgs>
  }
  export type RawLeadIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    filter?: boolean | FilterDefaultArgs<ExtArgs>
  }
  export type RawLeadIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    filter?: boolean | FilterDefaultArgs<ExtArgs>
  }

  export type $RawLeadPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RawLead"
    objects: {
      filter: Prisma.$FilterPayload<ExtArgs>
      lead: Prisma.$LeadPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      uuid: string
      filter_uuid: string
      source_type: $Enums.SourceType
      raw_data: Prisma.JsonValue
      processed_at: Date | null
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["rawLead"]>
    composites: {}
  }

  type RawLeadGetPayload<S extends boolean | null | undefined | RawLeadDefaultArgs> = $Result.GetResult<Prisma.$RawLeadPayload, S>

  type RawLeadCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RawLeadFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RawLeadCountAggregateInputType | true
    }

  export interface RawLeadDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RawLead'], meta: { name: 'RawLead' } }
    /**
     * Find zero or one RawLead that matches the filter.
     * @param {RawLeadFindUniqueArgs} args - Arguments to find a RawLead
     * @example
     * // Get one RawLead
     * const rawLead = await prisma.rawLead.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RawLeadFindUniqueArgs>(args: SelectSubset<T, RawLeadFindUniqueArgs<ExtArgs>>): Prisma__RawLeadClient<$Result.GetResult<Prisma.$RawLeadPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one RawLead that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RawLeadFindUniqueOrThrowArgs} args - Arguments to find a RawLead
     * @example
     * // Get one RawLead
     * const rawLead = await prisma.rawLead.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RawLeadFindUniqueOrThrowArgs>(args: SelectSubset<T, RawLeadFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RawLeadClient<$Result.GetResult<Prisma.$RawLeadPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RawLead that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RawLeadFindFirstArgs} args - Arguments to find a RawLead
     * @example
     * // Get one RawLead
     * const rawLead = await prisma.rawLead.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RawLeadFindFirstArgs>(args?: SelectSubset<T, RawLeadFindFirstArgs<ExtArgs>>): Prisma__RawLeadClient<$Result.GetResult<Prisma.$RawLeadPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RawLead that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RawLeadFindFirstOrThrowArgs} args - Arguments to find a RawLead
     * @example
     * // Get one RawLead
     * const rawLead = await prisma.rawLead.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RawLeadFindFirstOrThrowArgs>(args?: SelectSubset<T, RawLeadFindFirstOrThrowArgs<ExtArgs>>): Prisma__RawLeadClient<$Result.GetResult<Prisma.$RawLeadPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more RawLeads that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RawLeadFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RawLeads
     * const rawLeads = await prisma.rawLead.findMany()
     * 
     * // Get first 10 RawLeads
     * const rawLeads = await prisma.rawLead.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const rawLeadWithIdOnly = await prisma.rawLead.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RawLeadFindManyArgs>(args?: SelectSubset<T, RawLeadFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RawLeadPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a RawLead.
     * @param {RawLeadCreateArgs} args - Arguments to create a RawLead.
     * @example
     * // Create one RawLead
     * const RawLead = await prisma.rawLead.create({
     *   data: {
     *     // ... data to create a RawLead
     *   }
     * })
     * 
     */
    create<T extends RawLeadCreateArgs>(args: SelectSubset<T, RawLeadCreateArgs<ExtArgs>>): Prisma__RawLeadClient<$Result.GetResult<Prisma.$RawLeadPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many RawLeads.
     * @param {RawLeadCreateManyArgs} args - Arguments to create many RawLeads.
     * @example
     * // Create many RawLeads
     * const rawLead = await prisma.rawLead.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RawLeadCreateManyArgs>(args?: SelectSubset<T, RawLeadCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many RawLeads and returns the data saved in the database.
     * @param {RawLeadCreateManyAndReturnArgs} args - Arguments to create many RawLeads.
     * @example
     * // Create many RawLeads
     * const rawLead = await prisma.rawLead.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many RawLeads and only return the `id`
     * const rawLeadWithIdOnly = await prisma.rawLead.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RawLeadCreateManyAndReturnArgs>(args?: SelectSubset<T, RawLeadCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RawLeadPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a RawLead.
     * @param {RawLeadDeleteArgs} args - Arguments to delete one RawLead.
     * @example
     * // Delete one RawLead
     * const RawLead = await prisma.rawLead.delete({
     *   where: {
     *     // ... filter to delete one RawLead
     *   }
     * })
     * 
     */
    delete<T extends RawLeadDeleteArgs>(args: SelectSubset<T, RawLeadDeleteArgs<ExtArgs>>): Prisma__RawLeadClient<$Result.GetResult<Prisma.$RawLeadPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one RawLead.
     * @param {RawLeadUpdateArgs} args - Arguments to update one RawLead.
     * @example
     * // Update one RawLead
     * const rawLead = await prisma.rawLead.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RawLeadUpdateArgs>(args: SelectSubset<T, RawLeadUpdateArgs<ExtArgs>>): Prisma__RawLeadClient<$Result.GetResult<Prisma.$RawLeadPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more RawLeads.
     * @param {RawLeadDeleteManyArgs} args - Arguments to filter RawLeads to delete.
     * @example
     * // Delete a few RawLeads
     * const { count } = await prisma.rawLead.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RawLeadDeleteManyArgs>(args?: SelectSubset<T, RawLeadDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RawLeads.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RawLeadUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RawLeads
     * const rawLead = await prisma.rawLead.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RawLeadUpdateManyArgs>(args: SelectSubset<T, RawLeadUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RawLeads and returns the data updated in the database.
     * @param {RawLeadUpdateManyAndReturnArgs} args - Arguments to update many RawLeads.
     * @example
     * // Update many RawLeads
     * const rawLead = await prisma.rawLead.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more RawLeads and only return the `id`
     * const rawLeadWithIdOnly = await prisma.rawLead.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RawLeadUpdateManyAndReturnArgs>(args: SelectSubset<T, RawLeadUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RawLeadPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one RawLead.
     * @param {RawLeadUpsertArgs} args - Arguments to update or create a RawLead.
     * @example
     * // Update or create a RawLead
     * const rawLead = await prisma.rawLead.upsert({
     *   create: {
     *     // ... data to create a RawLead
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RawLead we want to update
     *   }
     * })
     */
    upsert<T extends RawLeadUpsertArgs>(args: SelectSubset<T, RawLeadUpsertArgs<ExtArgs>>): Prisma__RawLeadClient<$Result.GetResult<Prisma.$RawLeadPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of RawLeads.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RawLeadCountArgs} args - Arguments to filter RawLeads to count.
     * @example
     * // Count the number of RawLeads
     * const count = await prisma.rawLead.count({
     *   where: {
     *     // ... the filter for the RawLeads we want to count
     *   }
     * })
    **/
    count<T extends RawLeadCountArgs>(
      args?: Subset<T, RawLeadCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RawLeadCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RawLead.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RawLeadAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RawLeadAggregateArgs>(args: Subset<T, RawLeadAggregateArgs>): Prisma.PrismaPromise<GetRawLeadAggregateType<T>>

    /**
     * Group by RawLead.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RawLeadGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RawLeadGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RawLeadGroupByArgs['orderBy'] }
        : { orderBy?: RawLeadGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RawLeadGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRawLeadGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RawLead model
   */
  readonly fields: RawLeadFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RawLead.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RawLeadClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    filter<T extends FilterDefaultArgs<ExtArgs> = {}>(args?: Subset<T, FilterDefaultArgs<ExtArgs>>): Prisma__FilterClient<$Result.GetResult<Prisma.$FilterPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    lead<T extends RawLead$leadArgs<ExtArgs> = {}>(args?: Subset<T, RawLead$leadArgs<ExtArgs>>): Prisma__LeadClient<$Result.GetResult<Prisma.$LeadPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the RawLead model
   */
  interface RawLeadFieldRefs {
    readonly id: FieldRef<"RawLead", 'Int'>
    readonly uuid: FieldRef<"RawLead", 'String'>
    readonly filter_uuid: FieldRef<"RawLead", 'String'>
    readonly source_type: FieldRef<"RawLead", 'SourceType'>
    readonly raw_data: FieldRef<"RawLead", 'Json'>
    readonly processed_at: FieldRef<"RawLead", 'DateTime'>
    readonly created_at: FieldRef<"RawLead", 'DateTime'>
    readonly updated_at: FieldRef<"RawLead", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * RawLead findUnique
   */
  export type RawLeadFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RawLead
     */
    select?: RawLeadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RawLead
     */
    omit?: RawLeadOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RawLeadInclude<ExtArgs> | null
    /**
     * Filter, which RawLead to fetch.
     */
    where: RawLeadWhereUniqueInput
  }

  /**
   * RawLead findUniqueOrThrow
   */
  export type RawLeadFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RawLead
     */
    select?: RawLeadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RawLead
     */
    omit?: RawLeadOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RawLeadInclude<ExtArgs> | null
    /**
     * Filter, which RawLead to fetch.
     */
    where: RawLeadWhereUniqueInput
  }

  /**
   * RawLead findFirst
   */
  export type RawLeadFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RawLead
     */
    select?: RawLeadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RawLead
     */
    omit?: RawLeadOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RawLeadInclude<ExtArgs> | null
    /**
     * Filter, which RawLead to fetch.
     */
    where?: RawLeadWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RawLeads to fetch.
     */
    orderBy?: RawLeadOrderByWithRelationInput | RawLeadOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RawLeads.
     */
    cursor?: RawLeadWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RawLeads from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RawLeads.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RawLeads.
     */
    distinct?: RawLeadScalarFieldEnum | RawLeadScalarFieldEnum[]
  }

  /**
   * RawLead findFirstOrThrow
   */
  export type RawLeadFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RawLead
     */
    select?: RawLeadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RawLead
     */
    omit?: RawLeadOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RawLeadInclude<ExtArgs> | null
    /**
     * Filter, which RawLead to fetch.
     */
    where?: RawLeadWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RawLeads to fetch.
     */
    orderBy?: RawLeadOrderByWithRelationInput | RawLeadOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RawLeads.
     */
    cursor?: RawLeadWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RawLeads from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RawLeads.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RawLeads.
     */
    distinct?: RawLeadScalarFieldEnum | RawLeadScalarFieldEnum[]
  }

  /**
   * RawLead findMany
   */
  export type RawLeadFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RawLead
     */
    select?: RawLeadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RawLead
     */
    omit?: RawLeadOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RawLeadInclude<ExtArgs> | null
    /**
     * Filter, which RawLeads to fetch.
     */
    where?: RawLeadWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RawLeads to fetch.
     */
    orderBy?: RawLeadOrderByWithRelationInput | RawLeadOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RawLeads.
     */
    cursor?: RawLeadWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RawLeads from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RawLeads.
     */
    skip?: number
    distinct?: RawLeadScalarFieldEnum | RawLeadScalarFieldEnum[]
  }

  /**
   * RawLead create
   */
  export type RawLeadCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RawLead
     */
    select?: RawLeadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RawLead
     */
    omit?: RawLeadOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RawLeadInclude<ExtArgs> | null
    /**
     * The data needed to create a RawLead.
     */
    data: XOR<RawLeadCreateInput, RawLeadUncheckedCreateInput>
  }

  /**
   * RawLead createMany
   */
  export type RawLeadCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RawLeads.
     */
    data: RawLeadCreateManyInput | RawLeadCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RawLead createManyAndReturn
   */
  export type RawLeadCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RawLead
     */
    select?: RawLeadSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RawLead
     */
    omit?: RawLeadOmit<ExtArgs> | null
    /**
     * The data used to create many RawLeads.
     */
    data: RawLeadCreateManyInput | RawLeadCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RawLeadIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * RawLead update
   */
  export type RawLeadUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RawLead
     */
    select?: RawLeadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RawLead
     */
    omit?: RawLeadOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RawLeadInclude<ExtArgs> | null
    /**
     * The data needed to update a RawLead.
     */
    data: XOR<RawLeadUpdateInput, RawLeadUncheckedUpdateInput>
    /**
     * Choose, which RawLead to update.
     */
    where: RawLeadWhereUniqueInput
  }

  /**
   * RawLead updateMany
   */
  export type RawLeadUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RawLeads.
     */
    data: XOR<RawLeadUpdateManyMutationInput, RawLeadUncheckedUpdateManyInput>
    /**
     * Filter which RawLeads to update
     */
    where?: RawLeadWhereInput
    /**
     * Limit how many RawLeads to update.
     */
    limit?: number
  }

  /**
   * RawLead updateManyAndReturn
   */
  export type RawLeadUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RawLead
     */
    select?: RawLeadSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RawLead
     */
    omit?: RawLeadOmit<ExtArgs> | null
    /**
     * The data used to update RawLeads.
     */
    data: XOR<RawLeadUpdateManyMutationInput, RawLeadUncheckedUpdateManyInput>
    /**
     * Filter which RawLeads to update
     */
    where?: RawLeadWhereInput
    /**
     * Limit how many RawLeads to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RawLeadIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * RawLead upsert
   */
  export type RawLeadUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RawLead
     */
    select?: RawLeadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RawLead
     */
    omit?: RawLeadOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RawLeadInclude<ExtArgs> | null
    /**
     * The filter to search for the RawLead to update in case it exists.
     */
    where: RawLeadWhereUniqueInput
    /**
     * In case the RawLead found by the `where` argument doesn't exist, create a new RawLead with this data.
     */
    create: XOR<RawLeadCreateInput, RawLeadUncheckedCreateInput>
    /**
     * In case the RawLead was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RawLeadUpdateInput, RawLeadUncheckedUpdateInput>
  }

  /**
   * RawLead delete
   */
  export type RawLeadDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RawLead
     */
    select?: RawLeadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RawLead
     */
    omit?: RawLeadOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RawLeadInclude<ExtArgs> | null
    /**
     * Filter which RawLead to delete.
     */
    where: RawLeadWhereUniqueInput
  }

  /**
   * RawLead deleteMany
   */
  export type RawLeadDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RawLeads to delete
     */
    where?: RawLeadWhereInput
    /**
     * Limit how many RawLeads to delete.
     */
    limit?: number
  }

  /**
   * RawLead.lead
   */
  export type RawLead$leadArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lead
     */
    select?: LeadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lead
     */
    omit?: LeadOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeadInclude<ExtArgs> | null
    where?: LeadWhereInput
  }

  /**
   * RawLead without action
   */
  export type RawLeadDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RawLead
     */
    select?: RawLeadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RawLead
     */
    omit?: RawLeadOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RawLeadInclude<ExtArgs> | null
  }


  /**
   * Model Lead
   */

  export type AggregateLead = {
    _count: LeadCountAggregateOutputType | null
    _avg: LeadAvgAggregateOutputType | null
    _sum: LeadSumAggregateOutputType | null
    _min: LeadMinAggregateOutputType | null
    _max: LeadMaxAggregateOutputType | null
  }

  export type LeadAvgAggregateOutputType = {
    id: number | null
  }

  export type LeadSumAggregateOutputType = {
    id: number | null
  }

  export type LeadMinAggregateOutputType = {
    id: number | null
    uuid: string | null
    raw_lead_uuid: string | null
    name: string | null
    email: string | null
    phone: string | null
    company: string | null
    website: string | null
    linkedin_url: string | null
    title: string | null
    location: string | null
    industry: string | null
    description: string | null
    source_type: $Enums.SourceType | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type LeadMaxAggregateOutputType = {
    id: number | null
    uuid: string | null
    raw_lead_uuid: string | null
    name: string | null
    email: string | null
    phone: string | null
    company: string | null
    website: string | null
    linkedin_url: string | null
    title: string | null
    location: string | null
    industry: string | null
    description: string | null
    source_type: $Enums.SourceType | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type LeadCountAggregateOutputType = {
    id: number
    uuid: number
    raw_lead_uuid: number
    name: number
    email: number
    phone: number
    company: number
    website: number
    linkedin_url: number
    title: number
    location: number
    industry: number
    description: number
    source_type: number
    raw_data: number
    enrichment_data: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type LeadAvgAggregateInputType = {
    id?: true
  }

  export type LeadSumAggregateInputType = {
    id?: true
  }

  export type LeadMinAggregateInputType = {
    id?: true
    uuid?: true
    raw_lead_uuid?: true
    name?: true
    email?: true
    phone?: true
    company?: true
    website?: true
    linkedin_url?: true
    title?: true
    location?: true
    industry?: true
    description?: true
    source_type?: true
    created_at?: true
    updated_at?: true
  }

  export type LeadMaxAggregateInputType = {
    id?: true
    uuid?: true
    raw_lead_uuid?: true
    name?: true
    email?: true
    phone?: true
    company?: true
    website?: true
    linkedin_url?: true
    title?: true
    location?: true
    industry?: true
    description?: true
    source_type?: true
    created_at?: true
    updated_at?: true
  }

  export type LeadCountAggregateInputType = {
    id?: true
    uuid?: true
    raw_lead_uuid?: true
    name?: true
    email?: true
    phone?: true
    company?: true
    website?: true
    linkedin_url?: true
    title?: true
    location?: true
    industry?: true
    description?: true
    source_type?: true
    raw_data?: true
    enrichment_data?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type LeadAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Lead to aggregate.
     */
    where?: LeadWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Leads to fetch.
     */
    orderBy?: LeadOrderByWithRelationInput | LeadOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: LeadWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Leads from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Leads.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Leads
    **/
    _count?: true | LeadCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: LeadAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: LeadSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LeadMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LeadMaxAggregateInputType
  }

  export type GetLeadAggregateType<T extends LeadAggregateArgs> = {
        [P in keyof T & keyof AggregateLead]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLead[P]>
      : GetScalarType<T[P], AggregateLead[P]>
  }




  export type LeadGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LeadWhereInput
    orderBy?: LeadOrderByWithAggregationInput | LeadOrderByWithAggregationInput[]
    by: LeadScalarFieldEnum[] | LeadScalarFieldEnum
    having?: LeadScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LeadCountAggregateInputType | true
    _avg?: LeadAvgAggregateInputType
    _sum?: LeadSumAggregateInputType
    _min?: LeadMinAggregateInputType
    _max?: LeadMaxAggregateInputType
  }

  export type LeadGroupByOutputType = {
    id: number
    uuid: string
    raw_lead_uuid: string | null
    name: string | null
    email: string | null
    phone: string | null
    company: string | null
    website: string | null
    linkedin_url: string | null
    title: string | null
    location: string | null
    industry: string | null
    description: string | null
    source_type: $Enums.SourceType
    raw_data: JsonValue | null
    enrichment_data: JsonValue | null
    created_at: Date
    updated_at: Date
    _count: LeadCountAggregateOutputType | null
    _avg: LeadAvgAggregateOutputType | null
    _sum: LeadSumAggregateOutputType | null
    _min: LeadMinAggregateOutputType | null
    _max: LeadMaxAggregateOutputType | null
  }

  type GetLeadGroupByPayload<T extends LeadGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LeadGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LeadGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LeadGroupByOutputType[P]>
            : GetScalarType<T[P], LeadGroupByOutputType[P]>
        }
      >
    >


  export type LeadSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    uuid?: boolean
    raw_lead_uuid?: boolean
    name?: boolean
    email?: boolean
    phone?: boolean
    company?: boolean
    website?: boolean
    linkedin_url?: boolean
    title?: boolean
    location?: boolean
    industry?: boolean
    description?: boolean
    source_type?: boolean
    raw_data?: boolean
    enrichment_data?: boolean
    created_at?: boolean
    updated_at?: boolean
    raw_lead?: boolean | Lead$raw_leadArgs<ExtArgs>
    contacts?: boolean | Lead$contactsArgs<ExtArgs>
    _count?: boolean | LeadCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["lead"]>

  export type LeadSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    uuid?: boolean
    raw_lead_uuid?: boolean
    name?: boolean
    email?: boolean
    phone?: boolean
    company?: boolean
    website?: boolean
    linkedin_url?: boolean
    title?: boolean
    location?: boolean
    industry?: boolean
    description?: boolean
    source_type?: boolean
    raw_data?: boolean
    enrichment_data?: boolean
    created_at?: boolean
    updated_at?: boolean
    raw_lead?: boolean | Lead$raw_leadArgs<ExtArgs>
  }, ExtArgs["result"]["lead"]>

  export type LeadSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    uuid?: boolean
    raw_lead_uuid?: boolean
    name?: boolean
    email?: boolean
    phone?: boolean
    company?: boolean
    website?: boolean
    linkedin_url?: boolean
    title?: boolean
    location?: boolean
    industry?: boolean
    description?: boolean
    source_type?: boolean
    raw_data?: boolean
    enrichment_data?: boolean
    created_at?: boolean
    updated_at?: boolean
    raw_lead?: boolean | Lead$raw_leadArgs<ExtArgs>
  }, ExtArgs["result"]["lead"]>

  export type LeadSelectScalar = {
    id?: boolean
    uuid?: boolean
    raw_lead_uuid?: boolean
    name?: boolean
    email?: boolean
    phone?: boolean
    company?: boolean
    website?: boolean
    linkedin_url?: boolean
    title?: boolean
    location?: boolean
    industry?: boolean
    description?: boolean
    source_type?: boolean
    raw_data?: boolean
    enrichment_data?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type LeadOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "uuid" | "raw_lead_uuid" | "name" | "email" | "phone" | "company" | "website" | "linkedin_url" | "title" | "location" | "industry" | "description" | "source_type" | "raw_data" | "enrichment_data" | "created_at" | "updated_at", ExtArgs["result"]["lead"]>
  export type LeadInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    raw_lead?: boolean | Lead$raw_leadArgs<ExtArgs>
    contacts?: boolean | Lead$contactsArgs<ExtArgs>
    _count?: boolean | LeadCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type LeadIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    raw_lead?: boolean | Lead$raw_leadArgs<ExtArgs>
  }
  export type LeadIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    raw_lead?: boolean | Lead$raw_leadArgs<ExtArgs>
  }

  export type $LeadPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Lead"
    objects: {
      raw_lead: Prisma.$RawLeadPayload<ExtArgs> | null
      contacts: Prisma.$ContactPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      uuid: string
      raw_lead_uuid: string | null
      name: string | null
      email: string | null
      phone: string | null
      company: string | null
      website: string | null
      linkedin_url: string | null
      title: string | null
      location: string | null
      industry: string | null
      description: string | null
      source_type: $Enums.SourceType
      raw_data: Prisma.JsonValue | null
      enrichment_data: Prisma.JsonValue | null
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["lead"]>
    composites: {}
  }

  type LeadGetPayload<S extends boolean | null | undefined | LeadDefaultArgs> = $Result.GetResult<Prisma.$LeadPayload, S>

  type LeadCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<LeadFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: LeadCountAggregateInputType | true
    }

  export interface LeadDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Lead'], meta: { name: 'Lead' } }
    /**
     * Find zero or one Lead that matches the filter.
     * @param {LeadFindUniqueArgs} args - Arguments to find a Lead
     * @example
     * // Get one Lead
     * const lead = await prisma.lead.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LeadFindUniqueArgs>(args: SelectSubset<T, LeadFindUniqueArgs<ExtArgs>>): Prisma__LeadClient<$Result.GetResult<Prisma.$LeadPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Lead that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {LeadFindUniqueOrThrowArgs} args - Arguments to find a Lead
     * @example
     * // Get one Lead
     * const lead = await prisma.lead.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LeadFindUniqueOrThrowArgs>(args: SelectSubset<T, LeadFindUniqueOrThrowArgs<ExtArgs>>): Prisma__LeadClient<$Result.GetResult<Prisma.$LeadPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Lead that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeadFindFirstArgs} args - Arguments to find a Lead
     * @example
     * // Get one Lead
     * const lead = await prisma.lead.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LeadFindFirstArgs>(args?: SelectSubset<T, LeadFindFirstArgs<ExtArgs>>): Prisma__LeadClient<$Result.GetResult<Prisma.$LeadPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Lead that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeadFindFirstOrThrowArgs} args - Arguments to find a Lead
     * @example
     * // Get one Lead
     * const lead = await prisma.lead.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LeadFindFirstOrThrowArgs>(args?: SelectSubset<T, LeadFindFirstOrThrowArgs<ExtArgs>>): Prisma__LeadClient<$Result.GetResult<Prisma.$LeadPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Leads that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeadFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Leads
     * const leads = await prisma.lead.findMany()
     * 
     * // Get first 10 Leads
     * const leads = await prisma.lead.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const leadWithIdOnly = await prisma.lead.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends LeadFindManyArgs>(args?: SelectSubset<T, LeadFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LeadPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Lead.
     * @param {LeadCreateArgs} args - Arguments to create a Lead.
     * @example
     * // Create one Lead
     * const Lead = await prisma.lead.create({
     *   data: {
     *     // ... data to create a Lead
     *   }
     * })
     * 
     */
    create<T extends LeadCreateArgs>(args: SelectSubset<T, LeadCreateArgs<ExtArgs>>): Prisma__LeadClient<$Result.GetResult<Prisma.$LeadPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Leads.
     * @param {LeadCreateManyArgs} args - Arguments to create many Leads.
     * @example
     * // Create many Leads
     * const lead = await prisma.lead.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends LeadCreateManyArgs>(args?: SelectSubset<T, LeadCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Leads and returns the data saved in the database.
     * @param {LeadCreateManyAndReturnArgs} args - Arguments to create many Leads.
     * @example
     * // Create many Leads
     * const lead = await prisma.lead.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Leads and only return the `id`
     * const leadWithIdOnly = await prisma.lead.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends LeadCreateManyAndReturnArgs>(args?: SelectSubset<T, LeadCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LeadPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Lead.
     * @param {LeadDeleteArgs} args - Arguments to delete one Lead.
     * @example
     * // Delete one Lead
     * const Lead = await prisma.lead.delete({
     *   where: {
     *     // ... filter to delete one Lead
     *   }
     * })
     * 
     */
    delete<T extends LeadDeleteArgs>(args: SelectSubset<T, LeadDeleteArgs<ExtArgs>>): Prisma__LeadClient<$Result.GetResult<Prisma.$LeadPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Lead.
     * @param {LeadUpdateArgs} args - Arguments to update one Lead.
     * @example
     * // Update one Lead
     * const lead = await prisma.lead.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends LeadUpdateArgs>(args: SelectSubset<T, LeadUpdateArgs<ExtArgs>>): Prisma__LeadClient<$Result.GetResult<Prisma.$LeadPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Leads.
     * @param {LeadDeleteManyArgs} args - Arguments to filter Leads to delete.
     * @example
     * // Delete a few Leads
     * const { count } = await prisma.lead.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends LeadDeleteManyArgs>(args?: SelectSubset<T, LeadDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Leads.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeadUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Leads
     * const lead = await prisma.lead.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends LeadUpdateManyArgs>(args: SelectSubset<T, LeadUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Leads and returns the data updated in the database.
     * @param {LeadUpdateManyAndReturnArgs} args - Arguments to update many Leads.
     * @example
     * // Update many Leads
     * const lead = await prisma.lead.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Leads and only return the `id`
     * const leadWithIdOnly = await prisma.lead.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends LeadUpdateManyAndReturnArgs>(args: SelectSubset<T, LeadUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LeadPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Lead.
     * @param {LeadUpsertArgs} args - Arguments to update or create a Lead.
     * @example
     * // Update or create a Lead
     * const lead = await prisma.lead.upsert({
     *   create: {
     *     // ... data to create a Lead
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Lead we want to update
     *   }
     * })
     */
    upsert<T extends LeadUpsertArgs>(args: SelectSubset<T, LeadUpsertArgs<ExtArgs>>): Prisma__LeadClient<$Result.GetResult<Prisma.$LeadPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Leads.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeadCountArgs} args - Arguments to filter Leads to count.
     * @example
     * // Count the number of Leads
     * const count = await prisma.lead.count({
     *   where: {
     *     // ... the filter for the Leads we want to count
     *   }
     * })
    **/
    count<T extends LeadCountArgs>(
      args?: Subset<T, LeadCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LeadCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Lead.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeadAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends LeadAggregateArgs>(args: Subset<T, LeadAggregateArgs>): Prisma.PrismaPromise<GetLeadAggregateType<T>>

    /**
     * Group by Lead.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeadGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends LeadGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: LeadGroupByArgs['orderBy'] }
        : { orderBy?: LeadGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, LeadGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLeadGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Lead model
   */
  readonly fields: LeadFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Lead.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__LeadClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    raw_lead<T extends Lead$raw_leadArgs<ExtArgs> = {}>(args?: Subset<T, Lead$raw_leadArgs<ExtArgs>>): Prisma__RawLeadClient<$Result.GetResult<Prisma.$RawLeadPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    contacts<T extends Lead$contactsArgs<ExtArgs> = {}>(args?: Subset<T, Lead$contactsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ContactPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Lead model
   */
  interface LeadFieldRefs {
    readonly id: FieldRef<"Lead", 'Int'>
    readonly uuid: FieldRef<"Lead", 'String'>
    readonly raw_lead_uuid: FieldRef<"Lead", 'String'>
    readonly name: FieldRef<"Lead", 'String'>
    readonly email: FieldRef<"Lead", 'String'>
    readonly phone: FieldRef<"Lead", 'String'>
    readonly company: FieldRef<"Lead", 'String'>
    readonly website: FieldRef<"Lead", 'String'>
    readonly linkedin_url: FieldRef<"Lead", 'String'>
    readonly title: FieldRef<"Lead", 'String'>
    readonly location: FieldRef<"Lead", 'String'>
    readonly industry: FieldRef<"Lead", 'String'>
    readonly description: FieldRef<"Lead", 'String'>
    readonly source_type: FieldRef<"Lead", 'SourceType'>
    readonly raw_data: FieldRef<"Lead", 'Json'>
    readonly enrichment_data: FieldRef<"Lead", 'Json'>
    readonly created_at: FieldRef<"Lead", 'DateTime'>
    readonly updated_at: FieldRef<"Lead", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Lead findUnique
   */
  export type LeadFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lead
     */
    select?: LeadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lead
     */
    omit?: LeadOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeadInclude<ExtArgs> | null
    /**
     * Filter, which Lead to fetch.
     */
    where: LeadWhereUniqueInput
  }

  /**
   * Lead findUniqueOrThrow
   */
  export type LeadFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lead
     */
    select?: LeadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lead
     */
    omit?: LeadOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeadInclude<ExtArgs> | null
    /**
     * Filter, which Lead to fetch.
     */
    where: LeadWhereUniqueInput
  }

  /**
   * Lead findFirst
   */
  export type LeadFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lead
     */
    select?: LeadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lead
     */
    omit?: LeadOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeadInclude<ExtArgs> | null
    /**
     * Filter, which Lead to fetch.
     */
    where?: LeadWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Leads to fetch.
     */
    orderBy?: LeadOrderByWithRelationInput | LeadOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Leads.
     */
    cursor?: LeadWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Leads from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Leads.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Leads.
     */
    distinct?: LeadScalarFieldEnum | LeadScalarFieldEnum[]
  }

  /**
   * Lead findFirstOrThrow
   */
  export type LeadFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lead
     */
    select?: LeadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lead
     */
    omit?: LeadOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeadInclude<ExtArgs> | null
    /**
     * Filter, which Lead to fetch.
     */
    where?: LeadWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Leads to fetch.
     */
    orderBy?: LeadOrderByWithRelationInput | LeadOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Leads.
     */
    cursor?: LeadWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Leads from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Leads.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Leads.
     */
    distinct?: LeadScalarFieldEnum | LeadScalarFieldEnum[]
  }

  /**
   * Lead findMany
   */
  export type LeadFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lead
     */
    select?: LeadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lead
     */
    omit?: LeadOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeadInclude<ExtArgs> | null
    /**
     * Filter, which Leads to fetch.
     */
    where?: LeadWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Leads to fetch.
     */
    orderBy?: LeadOrderByWithRelationInput | LeadOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Leads.
     */
    cursor?: LeadWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Leads from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Leads.
     */
    skip?: number
    distinct?: LeadScalarFieldEnum | LeadScalarFieldEnum[]
  }

  /**
   * Lead create
   */
  export type LeadCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lead
     */
    select?: LeadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lead
     */
    omit?: LeadOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeadInclude<ExtArgs> | null
    /**
     * The data needed to create a Lead.
     */
    data: XOR<LeadCreateInput, LeadUncheckedCreateInput>
  }

  /**
   * Lead createMany
   */
  export type LeadCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Leads.
     */
    data: LeadCreateManyInput | LeadCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Lead createManyAndReturn
   */
  export type LeadCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lead
     */
    select?: LeadSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Lead
     */
    omit?: LeadOmit<ExtArgs> | null
    /**
     * The data used to create many Leads.
     */
    data: LeadCreateManyInput | LeadCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeadIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Lead update
   */
  export type LeadUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lead
     */
    select?: LeadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lead
     */
    omit?: LeadOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeadInclude<ExtArgs> | null
    /**
     * The data needed to update a Lead.
     */
    data: XOR<LeadUpdateInput, LeadUncheckedUpdateInput>
    /**
     * Choose, which Lead to update.
     */
    where: LeadWhereUniqueInput
  }

  /**
   * Lead updateMany
   */
  export type LeadUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Leads.
     */
    data: XOR<LeadUpdateManyMutationInput, LeadUncheckedUpdateManyInput>
    /**
     * Filter which Leads to update
     */
    where?: LeadWhereInput
    /**
     * Limit how many Leads to update.
     */
    limit?: number
  }

  /**
   * Lead updateManyAndReturn
   */
  export type LeadUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lead
     */
    select?: LeadSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Lead
     */
    omit?: LeadOmit<ExtArgs> | null
    /**
     * The data used to update Leads.
     */
    data: XOR<LeadUpdateManyMutationInput, LeadUncheckedUpdateManyInput>
    /**
     * Filter which Leads to update
     */
    where?: LeadWhereInput
    /**
     * Limit how many Leads to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeadIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Lead upsert
   */
  export type LeadUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lead
     */
    select?: LeadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lead
     */
    omit?: LeadOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeadInclude<ExtArgs> | null
    /**
     * The filter to search for the Lead to update in case it exists.
     */
    where: LeadWhereUniqueInput
    /**
     * In case the Lead found by the `where` argument doesn't exist, create a new Lead with this data.
     */
    create: XOR<LeadCreateInput, LeadUncheckedCreateInput>
    /**
     * In case the Lead was found with the provided `where` argument, update it with this data.
     */
    update: XOR<LeadUpdateInput, LeadUncheckedUpdateInput>
  }

  /**
   * Lead delete
   */
  export type LeadDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lead
     */
    select?: LeadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lead
     */
    omit?: LeadOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeadInclude<ExtArgs> | null
    /**
     * Filter which Lead to delete.
     */
    where: LeadWhereUniqueInput
  }

  /**
   * Lead deleteMany
   */
  export type LeadDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Leads to delete
     */
    where?: LeadWhereInput
    /**
     * Limit how many Leads to delete.
     */
    limit?: number
  }

  /**
   * Lead.raw_lead
   */
  export type Lead$raw_leadArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RawLead
     */
    select?: RawLeadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RawLead
     */
    omit?: RawLeadOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RawLeadInclude<ExtArgs> | null
    where?: RawLeadWhereInput
  }

  /**
   * Lead.contacts
   */
  export type Lead$contactsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Contact
     */
    select?: ContactSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Contact
     */
    omit?: ContactOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactInclude<ExtArgs> | null
    where?: ContactWhereInput
    orderBy?: ContactOrderByWithRelationInput | ContactOrderByWithRelationInput[]
    cursor?: ContactWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ContactScalarFieldEnum | ContactScalarFieldEnum[]
  }

  /**
   * Lead without action
   */
  export type LeadDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Lead
     */
    select?: LeadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Lead
     */
    omit?: LeadOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeadInclude<ExtArgs> | null
  }


  /**
   * Model Contact
   */

  export type AggregateContact = {
    _count: ContactCountAggregateOutputType | null
    _avg: ContactAvgAggregateOutputType | null
    _sum: ContactSumAggregateOutputType | null
    _min: ContactMinAggregateOutputType | null
    _max: ContactMaxAggregateOutputType | null
  }

  export type ContactAvgAggregateOutputType = {
    id: number | null
    score: number | null
  }

  export type ContactSumAggregateOutputType = {
    id: number | null
    score: number | null
  }

  export type ContactMinAggregateOutputType = {
    id: number | null
    uuid: string | null
    user_uuid: string | null
    lead_uuid: string | null
    filter_uuid: string | null
    status: $Enums.LeadStatus | null
    score: number | null
    notes: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type ContactMaxAggregateOutputType = {
    id: number | null
    uuid: string | null
    user_uuid: string | null
    lead_uuid: string | null
    filter_uuid: string | null
    status: $Enums.LeadStatus | null
    score: number | null
    notes: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type ContactCountAggregateOutputType = {
    id: number
    uuid: number
    user_uuid: number
    lead_uuid: number
    filter_uuid: number
    status: number
    score: number
    notes: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type ContactAvgAggregateInputType = {
    id?: true
    score?: true
  }

  export type ContactSumAggregateInputType = {
    id?: true
    score?: true
  }

  export type ContactMinAggregateInputType = {
    id?: true
    uuid?: true
    user_uuid?: true
    lead_uuid?: true
    filter_uuid?: true
    status?: true
    score?: true
    notes?: true
    created_at?: true
    updated_at?: true
  }

  export type ContactMaxAggregateInputType = {
    id?: true
    uuid?: true
    user_uuid?: true
    lead_uuid?: true
    filter_uuid?: true
    status?: true
    score?: true
    notes?: true
    created_at?: true
    updated_at?: true
  }

  export type ContactCountAggregateInputType = {
    id?: true
    uuid?: true
    user_uuid?: true
    lead_uuid?: true
    filter_uuid?: true
    status?: true
    score?: true
    notes?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type ContactAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Contact to aggregate.
     */
    where?: ContactWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Contacts to fetch.
     */
    orderBy?: ContactOrderByWithRelationInput | ContactOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ContactWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Contacts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Contacts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Contacts
    **/
    _count?: true | ContactCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ContactAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ContactSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ContactMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ContactMaxAggregateInputType
  }

  export type GetContactAggregateType<T extends ContactAggregateArgs> = {
        [P in keyof T & keyof AggregateContact]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateContact[P]>
      : GetScalarType<T[P], AggregateContact[P]>
  }




  export type ContactGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ContactWhereInput
    orderBy?: ContactOrderByWithAggregationInput | ContactOrderByWithAggregationInput[]
    by: ContactScalarFieldEnum[] | ContactScalarFieldEnum
    having?: ContactScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ContactCountAggregateInputType | true
    _avg?: ContactAvgAggregateInputType
    _sum?: ContactSumAggregateInputType
    _min?: ContactMinAggregateInputType
    _max?: ContactMaxAggregateInputType
  }

  export type ContactGroupByOutputType = {
    id: number
    uuid: string
    user_uuid: string
    lead_uuid: string
    filter_uuid: string | null
    status: $Enums.LeadStatus
    score: number | null
    notes: string | null
    created_at: Date
    updated_at: Date
    _count: ContactCountAggregateOutputType | null
    _avg: ContactAvgAggregateOutputType | null
    _sum: ContactSumAggregateOutputType | null
    _min: ContactMinAggregateOutputType | null
    _max: ContactMaxAggregateOutputType | null
  }

  type GetContactGroupByPayload<T extends ContactGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ContactGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ContactGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ContactGroupByOutputType[P]>
            : GetScalarType<T[P], ContactGroupByOutputType[P]>
        }
      >
    >


  export type ContactSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    uuid?: boolean
    user_uuid?: boolean
    lead_uuid?: boolean
    filter_uuid?: boolean
    status?: boolean
    score?: boolean
    notes?: boolean
    created_at?: boolean
    updated_at?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    lead?: boolean | LeadDefaultArgs<ExtArgs>
    filter?: boolean | Contact$filterArgs<ExtArgs>
    tags?: boolean | Contact$tagsArgs<ExtArgs>
    interactions?: boolean | Contact$interactionsArgs<ExtArgs>
    outreach_messages?: boolean | Contact$outreach_messagesArgs<ExtArgs>
    _count?: boolean | ContactCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["contact"]>

  export type ContactSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    uuid?: boolean
    user_uuid?: boolean
    lead_uuid?: boolean
    filter_uuid?: boolean
    status?: boolean
    score?: boolean
    notes?: boolean
    created_at?: boolean
    updated_at?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    lead?: boolean | LeadDefaultArgs<ExtArgs>
    filter?: boolean | Contact$filterArgs<ExtArgs>
  }, ExtArgs["result"]["contact"]>

  export type ContactSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    uuid?: boolean
    user_uuid?: boolean
    lead_uuid?: boolean
    filter_uuid?: boolean
    status?: boolean
    score?: boolean
    notes?: boolean
    created_at?: boolean
    updated_at?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    lead?: boolean | LeadDefaultArgs<ExtArgs>
    filter?: boolean | Contact$filterArgs<ExtArgs>
  }, ExtArgs["result"]["contact"]>

  export type ContactSelectScalar = {
    id?: boolean
    uuid?: boolean
    user_uuid?: boolean
    lead_uuid?: boolean
    filter_uuid?: boolean
    status?: boolean
    score?: boolean
    notes?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type ContactOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "uuid" | "user_uuid" | "lead_uuid" | "filter_uuid" | "status" | "score" | "notes" | "created_at" | "updated_at", ExtArgs["result"]["contact"]>
  export type ContactInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    lead?: boolean | LeadDefaultArgs<ExtArgs>
    filter?: boolean | Contact$filterArgs<ExtArgs>
    tags?: boolean | Contact$tagsArgs<ExtArgs>
    interactions?: boolean | Contact$interactionsArgs<ExtArgs>
    outreach_messages?: boolean | Contact$outreach_messagesArgs<ExtArgs>
    _count?: boolean | ContactCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ContactIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    lead?: boolean | LeadDefaultArgs<ExtArgs>
    filter?: boolean | Contact$filterArgs<ExtArgs>
  }
  export type ContactIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    lead?: boolean | LeadDefaultArgs<ExtArgs>
    filter?: boolean | Contact$filterArgs<ExtArgs>
  }

  export type $ContactPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Contact"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      lead: Prisma.$LeadPayload<ExtArgs>
      filter: Prisma.$FilterPayload<ExtArgs> | null
      tags: Prisma.$ContactTagPayload<ExtArgs>[]
      interactions: Prisma.$InteractionPayload<ExtArgs>[]
      outreach_messages: Prisma.$OutreachMessagePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      uuid: string
      user_uuid: string
      lead_uuid: string
      filter_uuid: string | null
      status: $Enums.LeadStatus
      score: number | null
      notes: string | null
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["contact"]>
    composites: {}
  }

  type ContactGetPayload<S extends boolean | null | undefined | ContactDefaultArgs> = $Result.GetResult<Prisma.$ContactPayload, S>

  type ContactCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ContactFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ContactCountAggregateInputType | true
    }

  export interface ContactDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Contact'], meta: { name: 'Contact' } }
    /**
     * Find zero or one Contact that matches the filter.
     * @param {ContactFindUniqueArgs} args - Arguments to find a Contact
     * @example
     * // Get one Contact
     * const contact = await prisma.contact.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ContactFindUniqueArgs>(args: SelectSubset<T, ContactFindUniqueArgs<ExtArgs>>): Prisma__ContactClient<$Result.GetResult<Prisma.$ContactPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Contact that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ContactFindUniqueOrThrowArgs} args - Arguments to find a Contact
     * @example
     * // Get one Contact
     * const contact = await prisma.contact.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ContactFindUniqueOrThrowArgs>(args: SelectSubset<T, ContactFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ContactClient<$Result.GetResult<Prisma.$ContactPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Contact that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactFindFirstArgs} args - Arguments to find a Contact
     * @example
     * // Get one Contact
     * const contact = await prisma.contact.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ContactFindFirstArgs>(args?: SelectSubset<T, ContactFindFirstArgs<ExtArgs>>): Prisma__ContactClient<$Result.GetResult<Prisma.$ContactPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Contact that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactFindFirstOrThrowArgs} args - Arguments to find a Contact
     * @example
     * // Get one Contact
     * const contact = await prisma.contact.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ContactFindFirstOrThrowArgs>(args?: SelectSubset<T, ContactFindFirstOrThrowArgs<ExtArgs>>): Prisma__ContactClient<$Result.GetResult<Prisma.$ContactPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Contacts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Contacts
     * const contacts = await prisma.contact.findMany()
     * 
     * // Get first 10 Contacts
     * const contacts = await prisma.contact.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const contactWithIdOnly = await prisma.contact.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ContactFindManyArgs>(args?: SelectSubset<T, ContactFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ContactPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Contact.
     * @param {ContactCreateArgs} args - Arguments to create a Contact.
     * @example
     * // Create one Contact
     * const Contact = await prisma.contact.create({
     *   data: {
     *     // ... data to create a Contact
     *   }
     * })
     * 
     */
    create<T extends ContactCreateArgs>(args: SelectSubset<T, ContactCreateArgs<ExtArgs>>): Prisma__ContactClient<$Result.GetResult<Prisma.$ContactPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Contacts.
     * @param {ContactCreateManyArgs} args - Arguments to create many Contacts.
     * @example
     * // Create many Contacts
     * const contact = await prisma.contact.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ContactCreateManyArgs>(args?: SelectSubset<T, ContactCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Contacts and returns the data saved in the database.
     * @param {ContactCreateManyAndReturnArgs} args - Arguments to create many Contacts.
     * @example
     * // Create many Contacts
     * const contact = await prisma.contact.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Contacts and only return the `id`
     * const contactWithIdOnly = await prisma.contact.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ContactCreateManyAndReturnArgs>(args?: SelectSubset<T, ContactCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ContactPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Contact.
     * @param {ContactDeleteArgs} args - Arguments to delete one Contact.
     * @example
     * // Delete one Contact
     * const Contact = await prisma.contact.delete({
     *   where: {
     *     // ... filter to delete one Contact
     *   }
     * })
     * 
     */
    delete<T extends ContactDeleteArgs>(args: SelectSubset<T, ContactDeleteArgs<ExtArgs>>): Prisma__ContactClient<$Result.GetResult<Prisma.$ContactPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Contact.
     * @param {ContactUpdateArgs} args - Arguments to update one Contact.
     * @example
     * // Update one Contact
     * const contact = await prisma.contact.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ContactUpdateArgs>(args: SelectSubset<T, ContactUpdateArgs<ExtArgs>>): Prisma__ContactClient<$Result.GetResult<Prisma.$ContactPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Contacts.
     * @param {ContactDeleteManyArgs} args - Arguments to filter Contacts to delete.
     * @example
     * // Delete a few Contacts
     * const { count } = await prisma.contact.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ContactDeleteManyArgs>(args?: SelectSubset<T, ContactDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Contacts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Contacts
     * const contact = await prisma.contact.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ContactUpdateManyArgs>(args: SelectSubset<T, ContactUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Contacts and returns the data updated in the database.
     * @param {ContactUpdateManyAndReturnArgs} args - Arguments to update many Contacts.
     * @example
     * // Update many Contacts
     * const contact = await prisma.contact.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Contacts and only return the `id`
     * const contactWithIdOnly = await prisma.contact.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ContactUpdateManyAndReturnArgs>(args: SelectSubset<T, ContactUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ContactPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Contact.
     * @param {ContactUpsertArgs} args - Arguments to update or create a Contact.
     * @example
     * // Update or create a Contact
     * const contact = await prisma.contact.upsert({
     *   create: {
     *     // ... data to create a Contact
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Contact we want to update
     *   }
     * })
     */
    upsert<T extends ContactUpsertArgs>(args: SelectSubset<T, ContactUpsertArgs<ExtArgs>>): Prisma__ContactClient<$Result.GetResult<Prisma.$ContactPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Contacts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactCountArgs} args - Arguments to filter Contacts to count.
     * @example
     * // Count the number of Contacts
     * const count = await prisma.contact.count({
     *   where: {
     *     // ... the filter for the Contacts we want to count
     *   }
     * })
    **/
    count<T extends ContactCountArgs>(
      args?: Subset<T, ContactCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ContactCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Contact.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ContactAggregateArgs>(args: Subset<T, ContactAggregateArgs>): Prisma.PrismaPromise<GetContactAggregateType<T>>

    /**
     * Group by Contact.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ContactGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ContactGroupByArgs['orderBy'] }
        : { orderBy?: ContactGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ContactGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetContactGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Contact model
   */
  readonly fields: ContactFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Contact.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ContactClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    lead<T extends LeadDefaultArgs<ExtArgs> = {}>(args?: Subset<T, LeadDefaultArgs<ExtArgs>>): Prisma__LeadClient<$Result.GetResult<Prisma.$LeadPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    filter<T extends Contact$filterArgs<ExtArgs> = {}>(args?: Subset<T, Contact$filterArgs<ExtArgs>>): Prisma__FilterClient<$Result.GetResult<Prisma.$FilterPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    tags<T extends Contact$tagsArgs<ExtArgs> = {}>(args?: Subset<T, Contact$tagsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ContactTagPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    interactions<T extends Contact$interactionsArgs<ExtArgs> = {}>(args?: Subset<T, Contact$interactionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InteractionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    outreach_messages<T extends Contact$outreach_messagesArgs<ExtArgs> = {}>(args?: Subset<T, Contact$outreach_messagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OutreachMessagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Contact model
   */
  interface ContactFieldRefs {
    readonly id: FieldRef<"Contact", 'Int'>
    readonly uuid: FieldRef<"Contact", 'String'>
    readonly user_uuid: FieldRef<"Contact", 'String'>
    readonly lead_uuid: FieldRef<"Contact", 'String'>
    readonly filter_uuid: FieldRef<"Contact", 'String'>
    readonly status: FieldRef<"Contact", 'LeadStatus'>
    readonly score: FieldRef<"Contact", 'Int'>
    readonly notes: FieldRef<"Contact", 'String'>
    readonly created_at: FieldRef<"Contact", 'DateTime'>
    readonly updated_at: FieldRef<"Contact", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Contact findUnique
   */
  export type ContactFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Contact
     */
    select?: ContactSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Contact
     */
    omit?: ContactOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactInclude<ExtArgs> | null
    /**
     * Filter, which Contact to fetch.
     */
    where: ContactWhereUniqueInput
  }

  /**
   * Contact findUniqueOrThrow
   */
  export type ContactFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Contact
     */
    select?: ContactSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Contact
     */
    omit?: ContactOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactInclude<ExtArgs> | null
    /**
     * Filter, which Contact to fetch.
     */
    where: ContactWhereUniqueInput
  }

  /**
   * Contact findFirst
   */
  export type ContactFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Contact
     */
    select?: ContactSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Contact
     */
    omit?: ContactOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactInclude<ExtArgs> | null
    /**
     * Filter, which Contact to fetch.
     */
    where?: ContactWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Contacts to fetch.
     */
    orderBy?: ContactOrderByWithRelationInput | ContactOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Contacts.
     */
    cursor?: ContactWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Contacts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Contacts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Contacts.
     */
    distinct?: ContactScalarFieldEnum | ContactScalarFieldEnum[]
  }

  /**
   * Contact findFirstOrThrow
   */
  export type ContactFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Contact
     */
    select?: ContactSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Contact
     */
    omit?: ContactOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactInclude<ExtArgs> | null
    /**
     * Filter, which Contact to fetch.
     */
    where?: ContactWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Contacts to fetch.
     */
    orderBy?: ContactOrderByWithRelationInput | ContactOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Contacts.
     */
    cursor?: ContactWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Contacts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Contacts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Contacts.
     */
    distinct?: ContactScalarFieldEnum | ContactScalarFieldEnum[]
  }

  /**
   * Contact findMany
   */
  export type ContactFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Contact
     */
    select?: ContactSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Contact
     */
    omit?: ContactOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactInclude<ExtArgs> | null
    /**
     * Filter, which Contacts to fetch.
     */
    where?: ContactWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Contacts to fetch.
     */
    orderBy?: ContactOrderByWithRelationInput | ContactOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Contacts.
     */
    cursor?: ContactWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Contacts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Contacts.
     */
    skip?: number
    distinct?: ContactScalarFieldEnum | ContactScalarFieldEnum[]
  }

  /**
   * Contact create
   */
  export type ContactCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Contact
     */
    select?: ContactSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Contact
     */
    omit?: ContactOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactInclude<ExtArgs> | null
    /**
     * The data needed to create a Contact.
     */
    data: XOR<ContactCreateInput, ContactUncheckedCreateInput>
  }

  /**
   * Contact createMany
   */
  export type ContactCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Contacts.
     */
    data: ContactCreateManyInput | ContactCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Contact createManyAndReturn
   */
  export type ContactCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Contact
     */
    select?: ContactSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Contact
     */
    omit?: ContactOmit<ExtArgs> | null
    /**
     * The data used to create many Contacts.
     */
    data: ContactCreateManyInput | ContactCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Contact update
   */
  export type ContactUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Contact
     */
    select?: ContactSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Contact
     */
    omit?: ContactOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactInclude<ExtArgs> | null
    /**
     * The data needed to update a Contact.
     */
    data: XOR<ContactUpdateInput, ContactUncheckedUpdateInput>
    /**
     * Choose, which Contact to update.
     */
    where: ContactWhereUniqueInput
  }

  /**
   * Contact updateMany
   */
  export type ContactUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Contacts.
     */
    data: XOR<ContactUpdateManyMutationInput, ContactUncheckedUpdateManyInput>
    /**
     * Filter which Contacts to update
     */
    where?: ContactWhereInput
    /**
     * Limit how many Contacts to update.
     */
    limit?: number
  }

  /**
   * Contact updateManyAndReturn
   */
  export type ContactUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Contact
     */
    select?: ContactSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Contact
     */
    omit?: ContactOmit<ExtArgs> | null
    /**
     * The data used to update Contacts.
     */
    data: XOR<ContactUpdateManyMutationInput, ContactUncheckedUpdateManyInput>
    /**
     * Filter which Contacts to update
     */
    where?: ContactWhereInput
    /**
     * Limit how many Contacts to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Contact upsert
   */
  export type ContactUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Contact
     */
    select?: ContactSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Contact
     */
    omit?: ContactOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactInclude<ExtArgs> | null
    /**
     * The filter to search for the Contact to update in case it exists.
     */
    where: ContactWhereUniqueInput
    /**
     * In case the Contact found by the `where` argument doesn't exist, create a new Contact with this data.
     */
    create: XOR<ContactCreateInput, ContactUncheckedCreateInput>
    /**
     * In case the Contact was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ContactUpdateInput, ContactUncheckedUpdateInput>
  }

  /**
   * Contact delete
   */
  export type ContactDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Contact
     */
    select?: ContactSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Contact
     */
    omit?: ContactOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactInclude<ExtArgs> | null
    /**
     * Filter which Contact to delete.
     */
    where: ContactWhereUniqueInput
  }

  /**
   * Contact deleteMany
   */
  export type ContactDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Contacts to delete
     */
    where?: ContactWhereInput
    /**
     * Limit how many Contacts to delete.
     */
    limit?: number
  }

  /**
   * Contact.filter
   */
  export type Contact$filterArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Filter
     */
    select?: FilterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Filter
     */
    omit?: FilterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FilterInclude<ExtArgs> | null
    where?: FilterWhereInput
  }

  /**
   * Contact.tags
   */
  export type Contact$tagsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactTag
     */
    select?: ContactTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContactTag
     */
    omit?: ContactTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactTagInclude<ExtArgs> | null
    where?: ContactTagWhereInput
    orderBy?: ContactTagOrderByWithRelationInput | ContactTagOrderByWithRelationInput[]
    cursor?: ContactTagWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ContactTagScalarFieldEnum | ContactTagScalarFieldEnum[]
  }

  /**
   * Contact.interactions
   */
  export type Contact$interactionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Interaction
     */
    select?: InteractionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Interaction
     */
    omit?: InteractionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InteractionInclude<ExtArgs> | null
    where?: InteractionWhereInput
    orderBy?: InteractionOrderByWithRelationInput | InteractionOrderByWithRelationInput[]
    cursor?: InteractionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: InteractionScalarFieldEnum | InteractionScalarFieldEnum[]
  }

  /**
   * Contact.outreach_messages
   */
  export type Contact$outreach_messagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutreachMessage
     */
    select?: OutreachMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutreachMessage
     */
    omit?: OutreachMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutreachMessageInclude<ExtArgs> | null
    where?: OutreachMessageWhereInput
    orderBy?: OutreachMessageOrderByWithRelationInput | OutreachMessageOrderByWithRelationInput[]
    cursor?: OutreachMessageWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OutreachMessageScalarFieldEnum | OutreachMessageScalarFieldEnum[]
  }

  /**
   * Contact without action
   */
  export type ContactDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Contact
     */
    select?: ContactSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Contact
     */
    omit?: ContactOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactInclude<ExtArgs> | null
  }


  /**
   * Model ContactTag
   */

  export type AggregateContactTag = {
    _count: ContactTagCountAggregateOutputType | null
    _avg: ContactTagAvgAggregateOutputType | null
    _sum: ContactTagSumAggregateOutputType | null
    _min: ContactTagMinAggregateOutputType | null
    _max: ContactTagMaxAggregateOutputType | null
  }

  export type ContactTagAvgAggregateOutputType = {
    id: number | null
  }

  export type ContactTagSumAggregateOutputType = {
    id: number | null
  }

  export type ContactTagMinAggregateOutputType = {
    id: number | null
    contact_uuid: string | null
    tag: string | null
    created_at: Date | null
  }

  export type ContactTagMaxAggregateOutputType = {
    id: number | null
    contact_uuid: string | null
    tag: string | null
    created_at: Date | null
  }

  export type ContactTagCountAggregateOutputType = {
    id: number
    contact_uuid: number
    tag: number
    created_at: number
    _all: number
  }


  export type ContactTagAvgAggregateInputType = {
    id?: true
  }

  export type ContactTagSumAggregateInputType = {
    id?: true
  }

  export type ContactTagMinAggregateInputType = {
    id?: true
    contact_uuid?: true
    tag?: true
    created_at?: true
  }

  export type ContactTagMaxAggregateInputType = {
    id?: true
    contact_uuid?: true
    tag?: true
    created_at?: true
  }

  export type ContactTagCountAggregateInputType = {
    id?: true
    contact_uuid?: true
    tag?: true
    created_at?: true
    _all?: true
  }

  export type ContactTagAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ContactTag to aggregate.
     */
    where?: ContactTagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ContactTags to fetch.
     */
    orderBy?: ContactTagOrderByWithRelationInput | ContactTagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ContactTagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ContactTags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ContactTags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ContactTags
    **/
    _count?: true | ContactTagCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ContactTagAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ContactTagSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ContactTagMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ContactTagMaxAggregateInputType
  }

  export type GetContactTagAggregateType<T extends ContactTagAggregateArgs> = {
        [P in keyof T & keyof AggregateContactTag]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateContactTag[P]>
      : GetScalarType<T[P], AggregateContactTag[P]>
  }




  export type ContactTagGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ContactTagWhereInput
    orderBy?: ContactTagOrderByWithAggregationInput | ContactTagOrderByWithAggregationInput[]
    by: ContactTagScalarFieldEnum[] | ContactTagScalarFieldEnum
    having?: ContactTagScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ContactTagCountAggregateInputType | true
    _avg?: ContactTagAvgAggregateInputType
    _sum?: ContactTagSumAggregateInputType
    _min?: ContactTagMinAggregateInputType
    _max?: ContactTagMaxAggregateInputType
  }

  export type ContactTagGroupByOutputType = {
    id: number
    contact_uuid: string
    tag: string
    created_at: Date
    _count: ContactTagCountAggregateOutputType | null
    _avg: ContactTagAvgAggregateOutputType | null
    _sum: ContactTagSumAggregateOutputType | null
    _min: ContactTagMinAggregateOutputType | null
    _max: ContactTagMaxAggregateOutputType | null
  }

  type GetContactTagGroupByPayload<T extends ContactTagGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ContactTagGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ContactTagGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ContactTagGroupByOutputType[P]>
            : GetScalarType<T[P], ContactTagGroupByOutputType[P]>
        }
      >
    >


  export type ContactTagSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    contact_uuid?: boolean
    tag?: boolean
    created_at?: boolean
    contact?: boolean | ContactDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["contactTag"]>

  export type ContactTagSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    contact_uuid?: boolean
    tag?: boolean
    created_at?: boolean
    contact?: boolean | ContactDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["contactTag"]>

  export type ContactTagSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    contact_uuid?: boolean
    tag?: boolean
    created_at?: boolean
    contact?: boolean | ContactDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["contactTag"]>

  export type ContactTagSelectScalar = {
    id?: boolean
    contact_uuid?: boolean
    tag?: boolean
    created_at?: boolean
  }

  export type ContactTagOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "contact_uuid" | "tag" | "created_at", ExtArgs["result"]["contactTag"]>
  export type ContactTagInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    contact?: boolean | ContactDefaultArgs<ExtArgs>
  }
  export type ContactTagIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    contact?: boolean | ContactDefaultArgs<ExtArgs>
  }
  export type ContactTagIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    contact?: boolean | ContactDefaultArgs<ExtArgs>
  }

  export type $ContactTagPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ContactTag"
    objects: {
      contact: Prisma.$ContactPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      contact_uuid: string
      tag: string
      created_at: Date
    }, ExtArgs["result"]["contactTag"]>
    composites: {}
  }

  type ContactTagGetPayload<S extends boolean | null | undefined | ContactTagDefaultArgs> = $Result.GetResult<Prisma.$ContactTagPayload, S>

  type ContactTagCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ContactTagFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ContactTagCountAggregateInputType | true
    }

  export interface ContactTagDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ContactTag'], meta: { name: 'ContactTag' } }
    /**
     * Find zero or one ContactTag that matches the filter.
     * @param {ContactTagFindUniqueArgs} args - Arguments to find a ContactTag
     * @example
     * // Get one ContactTag
     * const contactTag = await prisma.contactTag.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ContactTagFindUniqueArgs>(args: SelectSubset<T, ContactTagFindUniqueArgs<ExtArgs>>): Prisma__ContactTagClient<$Result.GetResult<Prisma.$ContactTagPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ContactTag that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ContactTagFindUniqueOrThrowArgs} args - Arguments to find a ContactTag
     * @example
     * // Get one ContactTag
     * const contactTag = await prisma.contactTag.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ContactTagFindUniqueOrThrowArgs>(args: SelectSubset<T, ContactTagFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ContactTagClient<$Result.GetResult<Prisma.$ContactTagPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ContactTag that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactTagFindFirstArgs} args - Arguments to find a ContactTag
     * @example
     * // Get one ContactTag
     * const contactTag = await prisma.contactTag.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ContactTagFindFirstArgs>(args?: SelectSubset<T, ContactTagFindFirstArgs<ExtArgs>>): Prisma__ContactTagClient<$Result.GetResult<Prisma.$ContactTagPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ContactTag that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactTagFindFirstOrThrowArgs} args - Arguments to find a ContactTag
     * @example
     * // Get one ContactTag
     * const contactTag = await prisma.contactTag.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ContactTagFindFirstOrThrowArgs>(args?: SelectSubset<T, ContactTagFindFirstOrThrowArgs<ExtArgs>>): Prisma__ContactTagClient<$Result.GetResult<Prisma.$ContactTagPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ContactTags that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactTagFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ContactTags
     * const contactTags = await prisma.contactTag.findMany()
     * 
     * // Get first 10 ContactTags
     * const contactTags = await prisma.contactTag.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const contactTagWithIdOnly = await prisma.contactTag.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ContactTagFindManyArgs>(args?: SelectSubset<T, ContactTagFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ContactTagPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ContactTag.
     * @param {ContactTagCreateArgs} args - Arguments to create a ContactTag.
     * @example
     * // Create one ContactTag
     * const ContactTag = await prisma.contactTag.create({
     *   data: {
     *     // ... data to create a ContactTag
     *   }
     * })
     * 
     */
    create<T extends ContactTagCreateArgs>(args: SelectSubset<T, ContactTagCreateArgs<ExtArgs>>): Prisma__ContactTagClient<$Result.GetResult<Prisma.$ContactTagPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ContactTags.
     * @param {ContactTagCreateManyArgs} args - Arguments to create many ContactTags.
     * @example
     * // Create many ContactTags
     * const contactTag = await prisma.contactTag.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ContactTagCreateManyArgs>(args?: SelectSubset<T, ContactTagCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ContactTags and returns the data saved in the database.
     * @param {ContactTagCreateManyAndReturnArgs} args - Arguments to create many ContactTags.
     * @example
     * // Create many ContactTags
     * const contactTag = await prisma.contactTag.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ContactTags and only return the `id`
     * const contactTagWithIdOnly = await prisma.contactTag.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ContactTagCreateManyAndReturnArgs>(args?: SelectSubset<T, ContactTagCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ContactTagPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ContactTag.
     * @param {ContactTagDeleteArgs} args - Arguments to delete one ContactTag.
     * @example
     * // Delete one ContactTag
     * const ContactTag = await prisma.contactTag.delete({
     *   where: {
     *     // ... filter to delete one ContactTag
     *   }
     * })
     * 
     */
    delete<T extends ContactTagDeleteArgs>(args: SelectSubset<T, ContactTagDeleteArgs<ExtArgs>>): Prisma__ContactTagClient<$Result.GetResult<Prisma.$ContactTagPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ContactTag.
     * @param {ContactTagUpdateArgs} args - Arguments to update one ContactTag.
     * @example
     * // Update one ContactTag
     * const contactTag = await prisma.contactTag.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ContactTagUpdateArgs>(args: SelectSubset<T, ContactTagUpdateArgs<ExtArgs>>): Prisma__ContactTagClient<$Result.GetResult<Prisma.$ContactTagPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ContactTags.
     * @param {ContactTagDeleteManyArgs} args - Arguments to filter ContactTags to delete.
     * @example
     * // Delete a few ContactTags
     * const { count } = await prisma.contactTag.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ContactTagDeleteManyArgs>(args?: SelectSubset<T, ContactTagDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ContactTags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactTagUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ContactTags
     * const contactTag = await prisma.contactTag.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ContactTagUpdateManyArgs>(args: SelectSubset<T, ContactTagUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ContactTags and returns the data updated in the database.
     * @param {ContactTagUpdateManyAndReturnArgs} args - Arguments to update many ContactTags.
     * @example
     * // Update many ContactTags
     * const contactTag = await prisma.contactTag.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ContactTags and only return the `id`
     * const contactTagWithIdOnly = await prisma.contactTag.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ContactTagUpdateManyAndReturnArgs>(args: SelectSubset<T, ContactTagUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ContactTagPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ContactTag.
     * @param {ContactTagUpsertArgs} args - Arguments to update or create a ContactTag.
     * @example
     * // Update or create a ContactTag
     * const contactTag = await prisma.contactTag.upsert({
     *   create: {
     *     // ... data to create a ContactTag
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ContactTag we want to update
     *   }
     * })
     */
    upsert<T extends ContactTagUpsertArgs>(args: SelectSubset<T, ContactTagUpsertArgs<ExtArgs>>): Prisma__ContactTagClient<$Result.GetResult<Prisma.$ContactTagPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ContactTags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactTagCountArgs} args - Arguments to filter ContactTags to count.
     * @example
     * // Count the number of ContactTags
     * const count = await prisma.contactTag.count({
     *   where: {
     *     // ... the filter for the ContactTags we want to count
     *   }
     * })
    **/
    count<T extends ContactTagCountArgs>(
      args?: Subset<T, ContactTagCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ContactTagCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ContactTag.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactTagAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ContactTagAggregateArgs>(args: Subset<T, ContactTagAggregateArgs>): Prisma.PrismaPromise<GetContactTagAggregateType<T>>

    /**
     * Group by ContactTag.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactTagGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ContactTagGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ContactTagGroupByArgs['orderBy'] }
        : { orderBy?: ContactTagGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ContactTagGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetContactTagGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ContactTag model
   */
  readonly fields: ContactTagFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ContactTag.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ContactTagClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    contact<T extends ContactDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ContactDefaultArgs<ExtArgs>>): Prisma__ContactClient<$Result.GetResult<Prisma.$ContactPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ContactTag model
   */
  interface ContactTagFieldRefs {
    readonly id: FieldRef<"ContactTag", 'Int'>
    readonly contact_uuid: FieldRef<"ContactTag", 'String'>
    readonly tag: FieldRef<"ContactTag", 'String'>
    readonly created_at: FieldRef<"ContactTag", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ContactTag findUnique
   */
  export type ContactTagFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactTag
     */
    select?: ContactTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContactTag
     */
    omit?: ContactTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactTagInclude<ExtArgs> | null
    /**
     * Filter, which ContactTag to fetch.
     */
    where: ContactTagWhereUniqueInput
  }

  /**
   * ContactTag findUniqueOrThrow
   */
  export type ContactTagFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactTag
     */
    select?: ContactTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContactTag
     */
    omit?: ContactTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactTagInclude<ExtArgs> | null
    /**
     * Filter, which ContactTag to fetch.
     */
    where: ContactTagWhereUniqueInput
  }

  /**
   * ContactTag findFirst
   */
  export type ContactTagFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactTag
     */
    select?: ContactTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContactTag
     */
    omit?: ContactTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactTagInclude<ExtArgs> | null
    /**
     * Filter, which ContactTag to fetch.
     */
    where?: ContactTagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ContactTags to fetch.
     */
    orderBy?: ContactTagOrderByWithRelationInput | ContactTagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ContactTags.
     */
    cursor?: ContactTagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ContactTags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ContactTags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ContactTags.
     */
    distinct?: ContactTagScalarFieldEnum | ContactTagScalarFieldEnum[]
  }

  /**
   * ContactTag findFirstOrThrow
   */
  export type ContactTagFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactTag
     */
    select?: ContactTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContactTag
     */
    omit?: ContactTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactTagInclude<ExtArgs> | null
    /**
     * Filter, which ContactTag to fetch.
     */
    where?: ContactTagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ContactTags to fetch.
     */
    orderBy?: ContactTagOrderByWithRelationInput | ContactTagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ContactTags.
     */
    cursor?: ContactTagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ContactTags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ContactTags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ContactTags.
     */
    distinct?: ContactTagScalarFieldEnum | ContactTagScalarFieldEnum[]
  }

  /**
   * ContactTag findMany
   */
  export type ContactTagFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactTag
     */
    select?: ContactTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContactTag
     */
    omit?: ContactTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactTagInclude<ExtArgs> | null
    /**
     * Filter, which ContactTags to fetch.
     */
    where?: ContactTagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ContactTags to fetch.
     */
    orderBy?: ContactTagOrderByWithRelationInput | ContactTagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ContactTags.
     */
    cursor?: ContactTagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ContactTags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ContactTags.
     */
    skip?: number
    distinct?: ContactTagScalarFieldEnum | ContactTagScalarFieldEnum[]
  }

  /**
   * ContactTag create
   */
  export type ContactTagCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactTag
     */
    select?: ContactTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContactTag
     */
    omit?: ContactTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactTagInclude<ExtArgs> | null
    /**
     * The data needed to create a ContactTag.
     */
    data: XOR<ContactTagCreateInput, ContactTagUncheckedCreateInput>
  }

  /**
   * ContactTag createMany
   */
  export type ContactTagCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ContactTags.
     */
    data: ContactTagCreateManyInput | ContactTagCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ContactTag createManyAndReturn
   */
  export type ContactTagCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactTag
     */
    select?: ContactTagSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ContactTag
     */
    omit?: ContactTagOmit<ExtArgs> | null
    /**
     * The data used to create many ContactTags.
     */
    data: ContactTagCreateManyInput | ContactTagCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactTagIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ContactTag update
   */
  export type ContactTagUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactTag
     */
    select?: ContactTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContactTag
     */
    omit?: ContactTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactTagInclude<ExtArgs> | null
    /**
     * The data needed to update a ContactTag.
     */
    data: XOR<ContactTagUpdateInput, ContactTagUncheckedUpdateInput>
    /**
     * Choose, which ContactTag to update.
     */
    where: ContactTagWhereUniqueInput
  }

  /**
   * ContactTag updateMany
   */
  export type ContactTagUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ContactTags.
     */
    data: XOR<ContactTagUpdateManyMutationInput, ContactTagUncheckedUpdateManyInput>
    /**
     * Filter which ContactTags to update
     */
    where?: ContactTagWhereInput
    /**
     * Limit how many ContactTags to update.
     */
    limit?: number
  }

  /**
   * ContactTag updateManyAndReturn
   */
  export type ContactTagUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactTag
     */
    select?: ContactTagSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ContactTag
     */
    omit?: ContactTagOmit<ExtArgs> | null
    /**
     * The data used to update ContactTags.
     */
    data: XOR<ContactTagUpdateManyMutationInput, ContactTagUncheckedUpdateManyInput>
    /**
     * Filter which ContactTags to update
     */
    where?: ContactTagWhereInput
    /**
     * Limit how many ContactTags to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactTagIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ContactTag upsert
   */
  export type ContactTagUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactTag
     */
    select?: ContactTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContactTag
     */
    omit?: ContactTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactTagInclude<ExtArgs> | null
    /**
     * The filter to search for the ContactTag to update in case it exists.
     */
    where: ContactTagWhereUniqueInput
    /**
     * In case the ContactTag found by the `where` argument doesn't exist, create a new ContactTag with this data.
     */
    create: XOR<ContactTagCreateInput, ContactTagUncheckedCreateInput>
    /**
     * In case the ContactTag was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ContactTagUpdateInput, ContactTagUncheckedUpdateInput>
  }

  /**
   * ContactTag delete
   */
  export type ContactTagDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactTag
     */
    select?: ContactTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContactTag
     */
    omit?: ContactTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactTagInclude<ExtArgs> | null
    /**
     * Filter which ContactTag to delete.
     */
    where: ContactTagWhereUniqueInput
  }

  /**
   * ContactTag deleteMany
   */
  export type ContactTagDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ContactTags to delete
     */
    where?: ContactTagWhereInput
    /**
     * Limit how many ContactTags to delete.
     */
    limit?: number
  }

  /**
   * ContactTag without action
   */
  export type ContactTagDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactTag
     */
    select?: ContactTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContactTag
     */
    omit?: ContactTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactTagInclude<ExtArgs> | null
  }


  /**
   * Model Interaction
   */

  export type AggregateInteraction = {
    _count: InteractionCountAggregateOutputType | null
    _avg: InteractionAvgAggregateOutputType | null
    _sum: InteractionSumAggregateOutputType | null
    _min: InteractionMinAggregateOutputType | null
    _max: InteractionMaxAggregateOutputType | null
  }

  export type InteractionAvgAggregateOutputType = {
    id: number | null
  }

  export type InteractionSumAggregateOutputType = {
    id: number | null
  }

  export type InteractionMinAggregateOutputType = {
    id: number | null
    uuid: string | null
    contact_uuid: string | null
    user_uuid: string | null
    type: $Enums.InteractionType | null
    content: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type InteractionMaxAggregateOutputType = {
    id: number | null
    uuid: string | null
    contact_uuid: string | null
    user_uuid: string | null
    type: $Enums.InteractionType | null
    content: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type InteractionCountAggregateOutputType = {
    id: number
    uuid: number
    contact_uuid: number
    user_uuid: number
    type: number
    content: number
    metadata: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type InteractionAvgAggregateInputType = {
    id?: true
  }

  export type InteractionSumAggregateInputType = {
    id?: true
  }

  export type InteractionMinAggregateInputType = {
    id?: true
    uuid?: true
    contact_uuid?: true
    user_uuid?: true
    type?: true
    content?: true
    created_at?: true
    updated_at?: true
  }

  export type InteractionMaxAggregateInputType = {
    id?: true
    uuid?: true
    contact_uuid?: true
    user_uuid?: true
    type?: true
    content?: true
    created_at?: true
    updated_at?: true
  }

  export type InteractionCountAggregateInputType = {
    id?: true
    uuid?: true
    contact_uuid?: true
    user_uuid?: true
    type?: true
    content?: true
    metadata?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type InteractionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Interaction to aggregate.
     */
    where?: InteractionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Interactions to fetch.
     */
    orderBy?: InteractionOrderByWithRelationInput | InteractionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: InteractionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Interactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Interactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Interactions
    **/
    _count?: true | InteractionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: InteractionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: InteractionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: InteractionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: InteractionMaxAggregateInputType
  }

  export type GetInteractionAggregateType<T extends InteractionAggregateArgs> = {
        [P in keyof T & keyof AggregateInteraction]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateInteraction[P]>
      : GetScalarType<T[P], AggregateInteraction[P]>
  }




  export type InteractionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InteractionWhereInput
    orderBy?: InteractionOrderByWithAggregationInput | InteractionOrderByWithAggregationInput[]
    by: InteractionScalarFieldEnum[] | InteractionScalarFieldEnum
    having?: InteractionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: InteractionCountAggregateInputType | true
    _avg?: InteractionAvgAggregateInputType
    _sum?: InteractionSumAggregateInputType
    _min?: InteractionMinAggregateInputType
    _max?: InteractionMaxAggregateInputType
  }

  export type InteractionGroupByOutputType = {
    id: number
    uuid: string
    contact_uuid: string
    user_uuid: string
    type: $Enums.InteractionType
    content: string | null
    metadata: JsonValue | null
    created_at: Date
    updated_at: Date
    _count: InteractionCountAggregateOutputType | null
    _avg: InteractionAvgAggregateOutputType | null
    _sum: InteractionSumAggregateOutputType | null
    _min: InteractionMinAggregateOutputType | null
    _max: InteractionMaxAggregateOutputType | null
  }

  type GetInteractionGroupByPayload<T extends InteractionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<InteractionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof InteractionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], InteractionGroupByOutputType[P]>
            : GetScalarType<T[P], InteractionGroupByOutputType[P]>
        }
      >
    >


  export type InteractionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    uuid?: boolean
    contact_uuid?: boolean
    user_uuid?: boolean
    type?: boolean
    content?: boolean
    metadata?: boolean
    created_at?: boolean
    updated_at?: boolean
    contact?: boolean | ContactDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["interaction"]>

  export type InteractionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    uuid?: boolean
    contact_uuid?: boolean
    user_uuid?: boolean
    type?: boolean
    content?: boolean
    metadata?: boolean
    created_at?: boolean
    updated_at?: boolean
    contact?: boolean | ContactDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["interaction"]>

  export type InteractionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    uuid?: boolean
    contact_uuid?: boolean
    user_uuid?: boolean
    type?: boolean
    content?: boolean
    metadata?: boolean
    created_at?: boolean
    updated_at?: boolean
    contact?: boolean | ContactDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["interaction"]>

  export type InteractionSelectScalar = {
    id?: boolean
    uuid?: boolean
    contact_uuid?: boolean
    user_uuid?: boolean
    type?: boolean
    content?: boolean
    metadata?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type InteractionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "uuid" | "contact_uuid" | "user_uuid" | "type" | "content" | "metadata" | "created_at" | "updated_at", ExtArgs["result"]["interaction"]>
  export type InteractionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    contact?: boolean | ContactDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type InteractionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    contact?: boolean | ContactDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type InteractionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    contact?: boolean | ContactDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $InteractionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Interaction"
    objects: {
      contact: Prisma.$ContactPayload<ExtArgs>
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      uuid: string
      contact_uuid: string
      user_uuid: string
      type: $Enums.InteractionType
      content: string | null
      metadata: Prisma.JsonValue | null
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["interaction"]>
    composites: {}
  }

  type InteractionGetPayload<S extends boolean | null | undefined | InteractionDefaultArgs> = $Result.GetResult<Prisma.$InteractionPayload, S>

  type InteractionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<InteractionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: InteractionCountAggregateInputType | true
    }

  export interface InteractionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Interaction'], meta: { name: 'Interaction' } }
    /**
     * Find zero or one Interaction that matches the filter.
     * @param {InteractionFindUniqueArgs} args - Arguments to find a Interaction
     * @example
     * // Get one Interaction
     * const interaction = await prisma.interaction.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends InteractionFindUniqueArgs>(args: SelectSubset<T, InteractionFindUniqueArgs<ExtArgs>>): Prisma__InteractionClient<$Result.GetResult<Prisma.$InteractionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Interaction that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {InteractionFindUniqueOrThrowArgs} args - Arguments to find a Interaction
     * @example
     * // Get one Interaction
     * const interaction = await prisma.interaction.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends InteractionFindUniqueOrThrowArgs>(args: SelectSubset<T, InteractionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__InteractionClient<$Result.GetResult<Prisma.$InteractionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Interaction that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InteractionFindFirstArgs} args - Arguments to find a Interaction
     * @example
     * // Get one Interaction
     * const interaction = await prisma.interaction.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends InteractionFindFirstArgs>(args?: SelectSubset<T, InteractionFindFirstArgs<ExtArgs>>): Prisma__InteractionClient<$Result.GetResult<Prisma.$InteractionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Interaction that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InteractionFindFirstOrThrowArgs} args - Arguments to find a Interaction
     * @example
     * // Get one Interaction
     * const interaction = await prisma.interaction.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends InteractionFindFirstOrThrowArgs>(args?: SelectSubset<T, InteractionFindFirstOrThrowArgs<ExtArgs>>): Prisma__InteractionClient<$Result.GetResult<Prisma.$InteractionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Interactions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InteractionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Interactions
     * const interactions = await prisma.interaction.findMany()
     * 
     * // Get first 10 Interactions
     * const interactions = await prisma.interaction.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const interactionWithIdOnly = await prisma.interaction.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends InteractionFindManyArgs>(args?: SelectSubset<T, InteractionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InteractionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Interaction.
     * @param {InteractionCreateArgs} args - Arguments to create a Interaction.
     * @example
     * // Create one Interaction
     * const Interaction = await prisma.interaction.create({
     *   data: {
     *     // ... data to create a Interaction
     *   }
     * })
     * 
     */
    create<T extends InteractionCreateArgs>(args: SelectSubset<T, InteractionCreateArgs<ExtArgs>>): Prisma__InteractionClient<$Result.GetResult<Prisma.$InteractionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Interactions.
     * @param {InteractionCreateManyArgs} args - Arguments to create many Interactions.
     * @example
     * // Create many Interactions
     * const interaction = await prisma.interaction.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends InteractionCreateManyArgs>(args?: SelectSubset<T, InteractionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Interactions and returns the data saved in the database.
     * @param {InteractionCreateManyAndReturnArgs} args - Arguments to create many Interactions.
     * @example
     * // Create many Interactions
     * const interaction = await prisma.interaction.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Interactions and only return the `id`
     * const interactionWithIdOnly = await prisma.interaction.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends InteractionCreateManyAndReturnArgs>(args?: SelectSubset<T, InteractionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InteractionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Interaction.
     * @param {InteractionDeleteArgs} args - Arguments to delete one Interaction.
     * @example
     * // Delete one Interaction
     * const Interaction = await prisma.interaction.delete({
     *   where: {
     *     // ... filter to delete one Interaction
     *   }
     * })
     * 
     */
    delete<T extends InteractionDeleteArgs>(args: SelectSubset<T, InteractionDeleteArgs<ExtArgs>>): Prisma__InteractionClient<$Result.GetResult<Prisma.$InteractionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Interaction.
     * @param {InteractionUpdateArgs} args - Arguments to update one Interaction.
     * @example
     * // Update one Interaction
     * const interaction = await prisma.interaction.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends InteractionUpdateArgs>(args: SelectSubset<T, InteractionUpdateArgs<ExtArgs>>): Prisma__InteractionClient<$Result.GetResult<Prisma.$InteractionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Interactions.
     * @param {InteractionDeleteManyArgs} args - Arguments to filter Interactions to delete.
     * @example
     * // Delete a few Interactions
     * const { count } = await prisma.interaction.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends InteractionDeleteManyArgs>(args?: SelectSubset<T, InteractionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Interactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InteractionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Interactions
     * const interaction = await prisma.interaction.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends InteractionUpdateManyArgs>(args: SelectSubset<T, InteractionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Interactions and returns the data updated in the database.
     * @param {InteractionUpdateManyAndReturnArgs} args - Arguments to update many Interactions.
     * @example
     * // Update many Interactions
     * const interaction = await prisma.interaction.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Interactions and only return the `id`
     * const interactionWithIdOnly = await prisma.interaction.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends InteractionUpdateManyAndReturnArgs>(args: SelectSubset<T, InteractionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InteractionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Interaction.
     * @param {InteractionUpsertArgs} args - Arguments to update or create a Interaction.
     * @example
     * // Update or create a Interaction
     * const interaction = await prisma.interaction.upsert({
     *   create: {
     *     // ... data to create a Interaction
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Interaction we want to update
     *   }
     * })
     */
    upsert<T extends InteractionUpsertArgs>(args: SelectSubset<T, InteractionUpsertArgs<ExtArgs>>): Prisma__InteractionClient<$Result.GetResult<Prisma.$InteractionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Interactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InteractionCountArgs} args - Arguments to filter Interactions to count.
     * @example
     * // Count the number of Interactions
     * const count = await prisma.interaction.count({
     *   where: {
     *     // ... the filter for the Interactions we want to count
     *   }
     * })
    **/
    count<T extends InteractionCountArgs>(
      args?: Subset<T, InteractionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], InteractionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Interaction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InteractionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends InteractionAggregateArgs>(args: Subset<T, InteractionAggregateArgs>): Prisma.PrismaPromise<GetInteractionAggregateType<T>>

    /**
     * Group by Interaction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InteractionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends InteractionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: InteractionGroupByArgs['orderBy'] }
        : { orderBy?: InteractionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, InteractionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInteractionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Interaction model
   */
  readonly fields: InteractionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Interaction.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__InteractionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    contact<T extends ContactDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ContactDefaultArgs<ExtArgs>>): Prisma__ContactClient<$Result.GetResult<Prisma.$ContactPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Interaction model
   */
  interface InteractionFieldRefs {
    readonly id: FieldRef<"Interaction", 'Int'>
    readonly uuid: FieldRef<"Interaction", 'String'>
    readonly contact_uuid: FieldRef<"Interaction", 'String'>
    readonly user_uuid: FieldRef<"Interaction", 'String'>
    readonly type: FieldRef<"Interaction", 'InteractionType'>
    readonly content: FieldRef<"Interaction", 'String'>
    readonly metadata: FieldRef<"Interaction", 'Json'>
    readonly created_at: FieldRef<"Interaction", 'DateTime'>
    readonly updated_at: FieldRef<"Interaction", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Interaction findUnique
   */
  export type InteractionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Interaction
     */
    select?: InteractionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Interaction
     */
    omit?: InteractionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InteractionInclude<ExtArgs> | null
    /**
     * Filter, which Interaction to fetch.
     */
    where: InteractionWhereUniqueInput
  }

  /**
   * Interaction findUniqueOrThrow
   */
  export type InteractionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Interaction
     */
    select?: InteractionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Interaction
     */
    omit?: InteractionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InteractionInclude<ExtArgs> | null
    /**
     * Filter, which Interaction to fetch.
     */
    where: InteractionWhereUniqueInput
  }

  /**
   * Interaction findFirst
   */
  export type InteractionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Interaction
     */
    select?: InteractionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Interaction
     */
    omit?: InteractionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InteractionInclude<ExtArgs> | null
    /**
     * Filter, which Interaction to fetch.
     */
    where?: InteractionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Interactions to fetch.
     */
    orderBy?: InteractionOrderByWithRelationInput | InteractionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Interactions.
     */
    cursor?: InteractionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Interactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Interactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Interactions.
     */
    distinct?: InteractionScalarFieldEnum | InteractionScalarFieldEnum[]
  }

  /**
   * Interaction findFirstOrThrow
   */
  export type InteractionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Interaction
     */
    select?: InteractionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Interaction
     */
    omit?: InteractionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InteractionInclude<ExtArgs> | null
    /**
     * Filter, which Interaction to fetch.
     */
    where?: InteractionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Interactions to fetch.
     */
    orderBy?: InteractionOrderByWithRelationInput | InteractionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Interactions.
     */
    cursor?: InteractionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Interactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Interactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Interactions.
     */
    distinct?: InteractionScalarFieldEnum | InteractionScalarFieldEnum[]
  }

  /**
   * Interaction findMany
   */
  export type InteractionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Interaction
     */
    select?: InteractionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Interaction
     */
    omit?: InteractionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InteractionInclude<ExtArgs> | null
    /**
     * Filter, which Interactions to fetch.
     */
    where?: InteractionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Interactions to fetch.
     */
    orderBy?: InteractionOrderByWithRelationInput | InteractionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Interactions.
     */
    cursor?: InteractionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Interactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Interactions.
     */
    skip?: number
    distinct?: InteractionScalarFieldEnum | InteractionScalarFieldEnum[]
  }

  /**
   * Interaction create
   */
  export type InteractionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Interaction
     */
    select?: InteractionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Interaction
     */
    omit?: InteractionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InteractionInclude<ExtArgs> | null
    /**
     * The data needed to create a Interaction.
     */
    data: XOR<InteractionCreateInput, InteractionUncheckedCreateInput>
  }

  /**
   * Interaction createMany
   */
  export type InteractionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Interactions.
     */
    data: InteractionCreateManyInput | InteractionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Interaction createManyAndReturn
   */
  export type InteractionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Interaction
     */
    select?: InteractionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Interaction
     */
    omit?: InteractionOmit<ExtArgs> | null
    /**
     * The data used to create many Interactions.
     */
    data: InteractionCreateManyInput | InteractionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InteractionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Interaction update
   */
  export type InteractionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Interaction
     */
    select?: InteractionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Interaction
     */
    omit?: InteractionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InteractionInclude<ExtArgs> | null
    /**
     * The data needed to update a Interaction.
     */
    data: XOR<InteractionUpdateInput, InteractionUncheckedUpdateInput>
    /**
     * Choose, which Interaction to update.
     */
    where: InteractionWhereUniqueInput
  }

  /**
   * Interaction updateMany
   */
  export type InteractionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Interactions.
     */
    data: XOR<InteractionUpdateManyMutationInput, InteractionUncheckedUpdateManyInput>
    /**
     * Filter which Interactions to update
     */
    where?: InteractionWhereInput
    /**
     * Limit how many Interactions to update.
     */
    limit?: number
  }

  /**
   * Interaction updateManyAndReturn
   */
  export type InteractionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Interaction
     */
    select?: InteractionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Interaction
     */
    omit?: InteractionOmit<ExtArgs> | null
    /**
     * The data used to update Interactions.
     */
    data: XOR<InteractionUpdateManyMutationInput, InteractionUncheckedUpdateManyInput>
    /**
     * Filter which Interactions to update
     */
    where?: InteractionWhereInput
    /**
     * Limit how many Interactions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InteractionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Interaction upsert
   */
  export type InteractionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Interaction
     */
    select?: InteractionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Interaction
     */
    omit?: InteractionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InteractionInclude<ExtArgs> | null
    /**
     * The filter to search for the Interaction to update in case it exists.
     */
    where: InteractionWhereUniqueInput
    /**
     * In case the Interaction found by the `where` argument doesn't exist, create a new Interaction with this data.
     */
    create: XOR<InteractionCreateInput, InteractionUncheckedCreateInput>
    /**
     * In case the Interaction was found with the provided `where` argument, update it with this data.
     */
    update: XOR<InteractionUpdateInput, InteractionUncheckedUpdateInput>
  }

  /**
   * Interaction delete
   */
  export type InteractionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Interaction
     */
    select?: InteractionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Interaction
     */
    omit?: InteractionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InteractionInclude<ExtArgs> | null
    /**
     * Filter which Interaction to delete.
     */
    where: InteractionWhereUniqueInput
  }

  /**
   * Interaction deleteMany
   */
  export type InteractionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Interactions to delete
     */
    where?: InteractionWhereInput
    /**
     * Limit how many Interactions to delete.
     */
    limit?: number
  }

  /**
   * Interaction without action
   */
  export type InteractionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Interaction
     */
    select?: InteractionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Interaction
     */
    omit?: InteractionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InteractionInclude<ExtArgs> | null
  }


  /**
   * Model OutreachMessage
   */

  export type AggregateOutreachMessage = {
    _count: OutreachMessageCountAggregateOutputType | null
    _avg: OutreachMessageAvgAggregateOutputType | null
    _sum: OutreachMessageSumAggregateOutputType | null
    _min: OutreachMessageMinAggregateOutputType | null
    _max: OutreachMessageMaxAggregateOutputType | null
  }

  export type OutreachMessageAvgAggregateOutputType = {
    id: number | null
  }

  export type OutreachMessageSumAggregateOutputType = {
    id: number | null
  }

  export type OutreachMessageMinAggregateOutputType = {
    id: number | null
    uuid: string | null
    user_uuid: string | null
    contact_uuid: string | null
    channel: $Enums.Channel | null
    subject: string | null
    content: string | null
    status: $Enums.MsgStatus | null
    scheduled_at: Date | null
    sent_at: Date | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type OutreachMessageMaxAggregateOutputType = {
    id: number | null
    uuid: string | null
    user_uuid: string | null
    contact_uuid: string | null
    channel: $Enums.Channel | null
    subject: string | null
    content: string | null
    status: $Enums.MsgStatus | null
    scheduled_at: Date | null
    sent_at: Date | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type OutreachMessageCountAggregateOutputType = {
    id: number
    uuid: number
    user_uuid: number
    contact_uuid: number
    channel: number
    subject: number
    content: number
    status: number
    scheduled_at: number
    sent_at: number
    metadata: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type OutreachMessageAvgAggregateInputType = {
    id?: true
  }

  export type OutreachMessageSumAggregateInputType = {
    id?: true
  }

  export type OutreachMessageMinAggregateInputType = {
    id?: true
    uuid?: true
    user_uuid?: true
    contact_uuid?: true
    channel?: true
    subject?: true
    content?: true
    status?: true
    scheduled_at?: true
    sent_at?: true
    created_at?: true
    updated_at?: true
  }

  export type OutreachMessageMaxAggregateInputType = {
    id?: true
    uuid?: true
    user_uuid?: true
    contact_uuid?: true
    channel?: true
    subject?: true
    content?: true
    status?: true
    scheduled_at?: true
    sent_at?: true
    created_at?: true
    updated_at?: true
  }

  export type OutreachMessageCountAggregateInputType = {
    id?: true
    uuid?: true
    user_uuid?: true
    contact_uuid?: true
    channel?: true
    subject?: true
    content?: true
    status?: true
    scheduled_at?: true
    sent_at?: true
    metadata?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type OutreachMessageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OutreachMessage to aggregate.
     */
    where?: OutreachMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OutreachMessages to fetch.
     */
    orderBy?: OutreachMessageOrderByWithRelationInput | OutreachMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OutreachMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OutreachMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OutreachMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OutreachMessages
    **/
    _count?: true | OutreachMessageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OutreachMessageAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OutreachMessageSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OutreachMessageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OutreachMessageMaxAggregateInputType
  }

  export type GetOutreachMessageAggregateType<T extends OutreachMessageAggregateArgs> = {
        [P in keyof T & keyof AggregateOutreachMessage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOutreachMessage[P]>
      : GetScalarType<T[P], AggregateOutreachMessage[P]>
  }




  export type OutreachMessageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OutreachMessageWhereInput
    orderBy?: OutreachMessageOrderByWithAggregationInput | OutreachMessageOrderByWithAggregationInput[]
    by: OutreachMessageScalarFieldEnum[] | OutreachMessageScalarFieldEnum
    having?: OutreachMessageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OutreachMessageCountAggregateInputType | true
    _avg?: OutreachMessageAvgAggregateInputType
    _sum?: OutreachMessageSumAggregateInputType
    _min?: OutreachMessageMinAggregateInputType
    _max?: OutreachMessageMaxAggregateInputType
  }

  export type OutreachMessageGroupByOutputType = {
    id: number
    uuid: string
    user_uuid: string
    contact_uuid: string
    channel: $Enums.Channel
    subject: string | null
    content: string
    status: $Enums.MsgStatus
    scheduled_at: Date | null
    sent_at: Date | null
    metadata: JsonValue | null
    created_at: Date
    updated_at: Date
    _count: OutreachMessageCountAggregateOutputType | null
    _avg: OutreachMessageAvgAggregateOutputType | null
    _sum: OutreachMessageSumAggregateOutputType | null
    _min: OutreachMessageMinAggregateOutputType | null
    _max: OutreachMessageMaxAggregateOutputType | null
  }

  type GetOutreachMessageGroupByPayload<T extends OutreachMessageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OutreachMessageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OutreachMessageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OutreachMessageGroupByOutputType[P]>
            : GetScalarType<T[P], OutreachMessageGroupByOutputType[P]>
        }
      >
    >


  export type OutreachMessageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    uuid?: boolean
    user_uuid?: boolean
    contact_uuid?: boolean
    channel?: boolean
    subject?: boolean
    content?: boolean
    status?: boolean
    scheduled_at?: boolean
    sent_at?: boolean
    metadata?: boolean
    created_at?: boolean
    updated_at?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    contact?: boolean | ContactDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["outreachMessage"]>

  export type OutreachMessageSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    uuid?: boolean
    user_uuid?: boolean
    contact_uuid?: boolean
    channel?: boolean
    subject?: boolean
    content?: boolean
    status?: boolean
    scheduled_at?: boolean
    sent_at?: boolean
    metadata?: boolean
    created_at?: boolean
    updated_at?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    contact?: boolean | ContactDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["outreachMessage"]>

  export type OutreachMessageSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    uuid?: boolean
    user_uuid?: boolean
    contact_uuid?: boolean
    channel?: boolean
    subject?: boolean
    content?: boolean
    status?: boolean
    scheduled_at?: boolean
    sent_at?: boolean
    metadata?: boolean
    created_at?: boolean
    updated_at?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    contact?: boolean | ContactDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["outreachMessage"]>

  export type OutreachMessageSelectScalar = {
    id?: boolean
    uuid?: boolean
    user_uuid?: boolean
    contact_uuid?: boolean
    channel?: boolean
    subject?: boolean
    content?: boolean
    status?: boolean
    scheduled_at?: boolean
    sent_at?: boolean
    metadata?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type OutreachMessageOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "uuid" | "user_uuid" | "contact_uuid" | "channel" | "subject" | "content" | "status" | "scheduled_at" | "sent_at" | "metadata" | "created_at" | "updated_at", ExtArgs["result"]["outreachMessage"]>
  export type OutreachMessageInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    contact?: boolean | ContactDefaultArgs<ExtArgs>
  }
  export type OutreachMessageIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    contact?: boolean | ContactDefaultArgs<ExtArgs>
  }
  export type OutreachMessageIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    contact?: boolean | ContactDefaultArgs<ExtArgs>
  }

  export type $OutreachMessagePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OutreachMessage"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      contact: Prisma.$ContactPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      uuid: string
      user_uuid: string
      contact_uuid: string
      channel: $Enums.Channel
      subject: string | null
      content: string
      status: $Enums.MsgStatus
      scheduled_at: Date | null
      sent_at: Date | null
      metadata: Prisma.JsonValue | null
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["outreachMessage"]>
    composites: {}
  }

  type OutreachMessageGetPayload<S extends boolean | null | undefined | OutreachMessageDefaultArgs> = $Result.GetResult<Prisma.$OutreachMessagePayload, S>

  type OutreachMessageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OutreachMessageFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OutreachMessageCountAggregateInputType | true
    }

  export interface OutreachMessageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OutreachMessage'], meta: { name: 'OutreachMessage' } }
    /**
     * Find zero or one OutreachMessage that matches the filter.
     * @param {OutreachMessageFindUniqueArgs} args - Arguments to find a OutreachMessage
     * @example
     * // Get one OutreachMessage
     * const outreachMessage = await prisma.outreachMessage.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OutreachMessageFindUniqueArgs>(args: SelectSubset<T, OutreachMessageFindUniqueArgs<ExtArgs>>): Prisma__OutreachMessageClient<$Result.GetResult<Prisma.$OutreachMessagePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one OutreachMessage that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OutreachMessageFindUniqueOrThrowArgs} args - Arguments to find a OutreachMessage
     * @example
     * // Get one OutreachMessage
     * const outreachMessage = await prisma.outreachMessage.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OutreachMessageFindUniqueOrThrowArgs>(args: SelectSubset<T, OutreachMessageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OutreachMessageClient<$Result.GetResult<Prisma.$OutreachMessagePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OutreachMessage that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutreachMessageFindFirstArgs} args - Arguments to find a OutreachMessage
     * @example
     * // Get one OutreachMessage
     * const outreachMessage = await prisma.outreachMessage.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OutreachMessageFindFirstArgs>(args?: SelectSubset<T, OutreachMessageFindFirstArgs<ExtArgs>>): Prisma__OutreachMessageClient<$Result.GetResult<Prisma.$OutreachMessagePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OutreachMessage that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutreachMessageFindFirstOrThrowArgs} args - Arguments to find a OutreachMessage
     * @example
     * // Get one OutreachMessage
     * const outreachMessage = await prisma.outreachMessage.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OutreachMessageFindFirstOrThrowArgs>(args?: SelectSubset<T, OutreachMessageFindFirstOrThrowArgs<ExtArgs>>): Prisma__OutreachMessageClient<$Result.GetResult<Prisma.$OutreachMessagePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more OutreachMessages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutreachMessageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OutreachMessages
     * const outreachMessages = await prisma.outreachMessage.findMany()
     * 
     * // Get first 10 OutreachMessages
     * const outreachMessages = await prisma.outreachMessage.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const outreachMessageWithIdOnly = await prisma.outreachMessage.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OutreachMessageFindManyArgs>(args?: SelectSubset<T, OutreachMessageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OutreachMessagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a OutreachMessage.
     * @param {OutreachMessageCreateArgs} args - Arguments to create a OutreachMessage.
     * @example
     * // Create one OutreachMessage
     * const OutreachMessage = await prisma.outreachMessage.create({
     *   data: {
     *     // ... data to create a OutreachMessage
     *   }
     * })
     * 
     */
    create<T extends OutreachMessageCreateArgs>(args: SelectSubset<T, OutreachMessageCreateArgs<ExtArgs>>): Prisma__OutreachMessageClient<$Result.GetResult<Prisma.$OutreachMessagePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many OutreachMessages.
     * @param {OutreachMessageCreateManyArgs} args - Arguments to create many OutreachMessages.
     * @example
     * // Create many OutreachMessages
     * const outreachMessage = await prisma.outreachMessage.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OutreachMessageCreateManyArgs>(args?: SelectSubset<T, OutreachMessageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OutreachMessages and returns the data saved in the database.
     * @param {OutreachMessageCreateManyAndReturnArgs} args - Arguments to create many OutreachMessages.
     * @example
     * // Create many OutreachMessages
     * const outreachMessage = await prisma.outreachMessage.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OutreachMessages and only return the `id`
     * const outreachMessageWithIdOnly = await prisma.outreachMessage.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OutreachMessageCreateManyAndReturnArgs>(args?: SelectSubset<T, OutreachMessageCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OutreachMessagePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a OutreachMessage.
     * @param {OutreachMessageDeleteArgs} args - Arguments to delete one OutreachMessage.
     * @example
     * // Delete one OutreachMessage
     * const OutreachMessage = await prisma.outreachMessage.delete({
     *   where: {
     *     // ... filter to delete one OutreachMessage
     *   }
     * })
     * 
     */
    delete<T extends OutreachMessageDeleteArgs>(args: SelectSubset<T, OutreachMessageDeleteArgs<ExtArgs>>): Prisma__OutreachMessageClient<$Result.GetResult<Prisma.$OutreachMessagePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one OutreachMessage.
     * @param {OutreachMessageUpdateArgs} args - Arguments to update one OutreachMessage.
     * @example
     * // Update one OutreachMessage
     * const outreachMessage = await prisma.outreachMessage.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OutreachMessageUpdateArgs>(args: SelectSubset<T, OutreachMessageUpdateArgs<ExtArgs>>): Prisma__OutreachMessageClient<$Result.GetResult<Prisma.$OutreachMessagePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more OutreachMessages.
     * @param {OutreachMessageDeleteManyArgs} args - Arguments to filter OutreachMessages to delete.
     * @example
     * // Delete a few OutreachMessages
     * const { count } = await prisma.outreachMessage.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OutreachMessageDeleteManyArgs>(args?: SelectSubset<T, OutreachMessageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OutreachMessages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutreachMessageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OutreachMessages
     * const outreachMessage = await prisma.outreachMessage.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OutreachMessageUpdateManyArgs>(args: SelectSubset<T, OutreachMessageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OutreachMessages and returns the data updated in the database.
     * @param {OutreachMessageUpdateManyAndReturnArgs} args - Arguments to update many OutreachMessages.
     * @example
     * // Update many OutreachMessages
     * const outreachMessage = await prisma.outreachMessage.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more OutreachMessages and only return the `id`
     * const outreachMessageWithIdOnly = await prisma.outreachMessage.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OutreachMessageUpdateManyAndReturnArgs>(args: SelectSubset<T, OutreachMessageUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OutreachMessagePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one OutreachMessage.
     * @param {OutreachMessageUpsertArgs} args - Arguments to update or create a OutreachMessage.
     * @example
     * // Update or create a OutreachMessage
     * const outreachMessage = await prisma.outreachMessage.upsert({
     *   create: {
     *     // ... data to create a OutreachMessage
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OutreachMessage we want to update
     *   }
     * })
     */
    upsert<T extends OutreachMessageUpsertArgs>(args: SelectSubset<T, OutreachMessageUpsertArgs<ExtArgs>>): Prisma__OutreachMessageClient<$Result.GetResult<Prisma.$OutreachMessagePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of OutreachMessages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutreachMessageCountArgs} args - Arguments to filter OutreachMessages to count.
     * @example
     * // Count the number of OutreachMessages
     * const count = await prisma.outreachMessage.count({
     *   where: {
     *     // ... the filter for the OutreachMessages we want to count
     *   }
     * })
    **/
    count<T extends OutreachMessageCountArgs>(
      args?: Subset<T, OutreachMessageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OutreachMessageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OutreachMessage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutreachMessageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OutreachMessageAggregateArgs>(args: Subset<T, OutreachMessageAggregateArgs>): Prisma.PrismaPromise<GetOutreachMessageAggregateType<T>>

    /**
     * Group by OutreachMessage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutreachMessageGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OutreachMessageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OutreachMessageGroupByArgs['orderBy'] }
        : { orderBy?: OutreachMessageGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OutreachMessageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOutreachMessageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OutreachMessage model
   */
  readonly fields: OutreachMessageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OutreachMessage.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OutreachMessageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    contact<T extends ContactDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ContactDefaultArgs<ExtArgs>>): Prisma__ContactClient<$Result.GetResult<Prisma.$ContactPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the OutreachMessage model
   */
  interface OutreachMessageFieldRefs {
    readonly id: FieldRef<"OutreachMessage", 'Int'>
    readonly uuid: FieldRef<"OutreachMessage", 'String'>
    readonly user_uuid: FieldRef<"OutreachMessage", 'String'>
    readonly contact_uuid: FieldRef<"OutreachMessage", 'String'>
    readonly channel: FieldRef<"OutreachMessage", 'Channel'>
    readonly subject: FieldRef<"OutreachMessage", 'String'>
    readonly content: FieldRef<"OutreachMessage", 'String'>
    readonly status: FieldRef<"OutreachMessage", 'MsgStatus'>
    readonly scheduled_at: FieldRef<"OutreachMessage", 'DateTime'>
    readonly sent_at: FieldRef<"OutreachMessage", 'DateTime'>
    readonly metadata: FieldRef<"OutreachMessage", 'Json'>
    readonly created_at: FieldRef<"OutreachMessage", 'DateTime'>
    readonly updated_at: FieldRef<"OutreachMessage", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * OutreachMessage findUnique
   */
  export type OutreachMessageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutreachMessage
     */
    select?: OutreachMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutreachMessage
     */
    omit?: OutreachMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutreachMessageInclude<ExtArgs> | null
    /**
     * Filter, which OutreachMessage to fetch.
     */
    where: OutreachMessageWhereUniqueInput
  }

  /**
   * OutreachMessage findUniqueOrThrow
   */
  export type OutreachMessageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutreachMessage
     */
    select?: OutreachMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutreachMessage
     */
    omit?: OutreachMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutreachMessageInclude<ExtArgs> | null
    /**
     * Filter, which OutreachMessage to fetch.
     */
    where: OutreachMessageWhereUniqueInput
  }

  /**
   * OutreachMessage findFirst
   */
  export type OutreachMessageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutreachMessage
     */
    select?: OutreachMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutreachMessage
     */
    omit?: OutreachMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutreachMessageInclude<ExtArgs> | null
    /**
     * Filter, which OutreachMessage to fetch.
     */
    where?: OutreachMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OutreachMessages to fetch.
     */
    orderBy?: OutreachMessageOrderByWithRelationInput | OutreachMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OutreachMessages.
     */
    cursor?: OutreachMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OutreachMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OutreachMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OutreachMessages.
     */
    distinct?: OutreachMessageScalarFieldEnum | OutreachMessageScalarFieldEnum[]
  }

  /**
   * OutreachMessage findFirstOrThrow
   */
  export type OutreachMessageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutreachMessage
     */
    select?: OutreachMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutreachMessage
     */
    omit?: OutreachMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutreachMessageInclude<ExtArgs> | null
    /**
     * Filter, which OutreachMessage to fetch.
     */
    where?: OutreachMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OutreachMessages to fetch.
     */
    orderBy?: OutreachMessageOrderByWithRelationInput | OutreachMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OutreachMessages.
     */
    cursor?: OutreachMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OutreachMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OutreachMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OutreachMessages.
     */
    distinct?: OutreachMessageScalarFieldEnum | OutreachMessageScalarFieldEnum[]
  }

  /**
   * OutreachMessage findMany
   */
  export type OutreachMessageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutreachMessage
     */
    select?: OutreachMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutreachMessage
     */
    omit?: OutreachMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutreachMessageInclude<ExtArgs> | null
    /**
     * Filter, which OutreachMessages to fetch.
     */
    where?: OutreachMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OutreachMessages to fetch.
     */
    orderBy?: OutreachMessageOrderByWithRelationInput | OutreachMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OutreachMessages.
     */
    cursor?: OutreachMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OutreachMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OutreachMessages.
     */
    skip?: number
    distinct?: OutreachMessageScalarFieldEnum | OutreachMessageScalarFieldEnum[]
  }

  /**
   * OutreachMessage create
   */
  export type OutreachMessageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutreachMessage
     */
    select?: OutreachMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutreachMessage
     */
    omit?: OutreachMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutreachMessageInclude<ExtArgs> | null
    /**
     * The data needed to create a OutreachMessage.
     */
    data: XOR<OutreachMessageCreateInput, OutreachMessageUncheckedCreateInput>
  }

  /**
   * OutreachMessage createMany
   */
  export type OutreachMessageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OutreachMessages.
     */
    data: OutreachMessageCreateManyInput | OutreachMessageCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OutreachMessage createManyAndReturn
   */
  export type OutreachMessageCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutreachMessage
     */
    select?: OutreachMessageSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OutreachMessage
     */
    omit?: OutreachMessageOmit<ExtArgs> | null
    /**
     * The data used to create many OutreachMessages.
     */
    data: OutreachMessageCreateManyInput | OutreachMessageCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutreachMessageIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * OutreachMessage update
   */
  export type OutreachMessageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutreachMessage
     */
    select?: OutreachMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutreachMessage
     */
    omit?: OutreachMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutreachMessageInclude<ExtArgs> | null
    /**
     * The data needed to update a OutreachMessage.
     */
    data: XOR<OutreachMessageUpdateInput, OutreachMessageUncheckedUpdateInput>
    /**
     * Choose, which OutreachMessage to update.
     */
    where: OutreachMessageWhereUniqueInput
  }

  /**
   * OutreachMessage updateMany
   */
  export type OutreachMessageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OutreachMessages.
     */
    data: XOR<OutreachMessageUpdateManyMutationInput, OutreachMessageUncheckedUpdateManyInput>
    /**
     * Filter which OutreachMessages to update
     */
    where?: OutreachMessageWhereInput
    /**
     * Limit how many OutreachMessages to update.
     */
    limit?: number
  }

  /**
   * OutreachMessage updateManyAndReturn
   */
  export type OutreachMessageUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutreachMessage
     */
    select?: OutreachMessageSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OutreachMessage
     */
    omit?: OutreachMessageOmit<ExtArgs> | null
    /**
     * The data used to update OutreachMessages.
     */
    data: XOR<OutreachMessageUpdateManyMutationInput, OutreachMessageUncheckedUpdateManyInput>
    /**
     * Filter which OutreachMessages to update
     */
    where?: OutreachMessageWhereInput
    /**
     * Limit how many OutreachMessages to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutreachMessageIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * OutreachMessage upsert
   */
  export type OutreachMessageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutreachMessage
     */
    select?: OutreachMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutreachMessage
     */
    omit?: OutreachMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutreachMessageInclude<ExtArgs> | null
    /**
     * The filter to search for the OutreachMessage to update in case it exists.
     */
    where: OutreachMessageWhereUniqueInput
    /**
     * In case the OutreachMessage found by the `where` argument doesn't exist, create a new OutreachMessage with this data.
     */
    create: XOR<OutreachMessageCreateInput, OutreachMessageUncheckedCreateInput>
    /**
     * In case the OutreachMessage was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OutreachMessageUpdateInput, OutreachMessageUncheckedUpdateInput>
  }

  /**
   * OutreachMessage delete
   */
  export type OutreachMessageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutreachMessage
     */
    select?: OutreachMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutreachMessage
     */
    omit?: OutreachMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutreachMessageInclude<ExtArgs> | null
    /**
     * Filter which OutreachMessage to delete.
     */
    where: OutreachMessageWhereUniqueInput
  }

  /**
   * OutreachMessage deleteMany
   */
  export type OutreachMessageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OutreachMessages to delete
     */
    where?: OutreachMessageWhereInput
    /**
     * Limit how many OutreachMessages to delete.
     */
    limit?: number
  }

  /**
   * OutreachMessage without action
   */
  export type OutreachMessageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutreachMessage
     */
    select?: OutreachMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutreachMessage
     */
    omit?: OutreachMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutreachMessageInclude<ExtArgs> | null
  }


  /**
   * Model OutreachSequence
   */

  export type AggregateOutreachSequence = {
    _count: OutreachSequenceCountAggregateOutputType | null
    _avg: OutreachSequenceAvgAggregateOutputType | null
    _sum: OutreachSequenceSumAggregateOutputType | null
    _min: OutreachSequenceMinAggregateOutputType | null
    _max: OutreachSequenceMaxAggregateOutputType | null
  }

  export type OutreachSequenceAvgAggregateOutputType = {
    id: number | null
  }

  export type OutreachSequenceSumAggregateOutputType = {
    id: number | null
  }

  export type OutreachSequenceMinAggregateOutputType = {
    id: number | null
    uuid: string | null
    user_uuid: string | null
    name: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type OutreachSequenceMaxAggregateOutputType = {
    id: number | null
    uuid: string | null
    user_uuid: string | null
    name: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type OutreachSequenceCountAggregateOutputType = {
    id: number
    uuid: number
    user_uuid: number
    name: number
    steps: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type OutreachSequenceAvgAggregateInputType = {
    id?: true
  }

  export type OutreachSequenceSumAggregateInputType = {
    id?: true
  }

  export type OutreachSequenceMinAggregateInputType = {
    id?: true
    uuid?: true
    user_uuid?: true
    name?: true
    created_at?: true
    updated_at?: true
  }

  export type OutreachSequenceMaxAggregateInputType = {
    id?: true
    uuid?: true
    user_uuid?: true
    name?: true
    created_at?: true
    updated_at?: true
  }

  export type OutreachSequenceCountAggregateInputType = {
    id?: true
    uuid?: true
    user_uuid?: true
    name?: true
    steps?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type OutreachSequenceAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OutreachSequence to aggregate.
     */
    where?: OutreachSequenceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OutreachSequences to fetch.
     */
    orderBy?: OutreachSequenceOrderByWithRelationInput | OutreachSequenceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OutreachSequenceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OutreachSequences from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OutreachSequences.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OutreachSequences
    **/
    _count?: true | OutreachSequenceCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OutreachSequenceAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OutreachSequenceSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OutreachSequenceMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OutreachSequenceMaxAggregateInputType
  }

  export type GetOutreachSequenceAggregateType<T extends OutreachSequenceAggregateArgs> = {
        [P in keyof T & keyof AggregateOutreachSequence]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOutreachSequence[P]>
      : GetScalarType<T[P], AggregateOutreachSequence[P]>
  }




  export type OutreachSequenceGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OutreachSequenceWhereInput
    orderBy?: OutreachSequenceOrderByWithAggregationInput | OutreachSequenceOrderByWithAggregationInput[]
    by: OutreachSequenceScalarFieldEnum[] | OutreachSequenceScalarFieldEnum
    having?: OutreachSequenceScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OutreachSequenceCountAggregateInputType | true
    _avg?: OutreachSequenceAvgAggregateInputType
    _sum?: OutreachSequenceSumAggregateInputType
    _min?: OutreachSequenceMinAggregateInputType
    _max?: OutreachSequenceMaxAggregateInputType
  }

  export type OutreachSequenceGroupByOutputType = {
    id: number
    uuid: string
    user_uuid: string
    name: string
    steps: JsonValue
    created_at: Date
    updated_at: Date
    _count: OutreachSequenceCountAggregateOutputType | null
    _avg: OutreachSequenceAvgAggregateOutputType | null
    _sum: OutreachSequenceSumAggregateOutputType | null
    _min: OutreachSequenceMinAggregateOutputType | null
    _max: OutreachSequenceMaxAggregateOutputType | null
  }

  type GetOutreachSequenceGroupByPayload<T extends OutreachSequenceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OutreachSequenceGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OutreachSequenceGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OutreachSequenceGroupByOutputType[P]>
            : GetScalarType<T[P], OutreachSequenceGroupByOutputType[P]>
        }
      >
    >


  export type OutreachSequenceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    uuid?: boolean
    user_uuid?: boolean
    name?: boolean
    steps?: boolean
    created_at?: boolean
    updated_at?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["outreachSequence"]>

  export type OutreachSequenceSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    uuid?: boolean
    user_uuid?: boolean
    name?: boolean
    steps?: boolean
    created_at?: boolean
    updated_at?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["outreachSequence"]>

  export type OutreachSequenceSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    uuid?: boolean
    user_uuid?: boolean
    name?: boolean
    steps?: boolean
    created_at?: boolean
    updated_at?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["outreachSequence"]>

  export type OutreachSequenceSelectScalar = {
    id?: boolean
    uuid?: boolean
    user_uuid?: boolean
    name?: boolean
    steps?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type OutreachSequenceOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "uuid" | "user_uuid" | "name" | "steps" | "created_at" | "updated_at", ExtArgs["result"]["outreachSequence"]>
  export type OutreachSequenceInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type OutreachSequenceIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type OutreachSequenceIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $OutreachSequencePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OutreachSequence"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      uuid: string
      user_uuid: string
      name: string
      steps: Prisma.JsonValue
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["outreachSequence"]>
    composites: {}
  }

  type OutreachSequenceGetPayload<S extends boolean | null | undefined | OutreachSequenceDefaultArgs> = $Result.GetResult<Prisma.$OutreachSequencePayload, S>

  type OutreachSequenceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OutreachSequenceFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OutreachSequenceCountAggregateInputType | true
    }

  export interface OutreachSequenceDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OutreachSequence'], meta: { name: 'OutreachSequence' } }
    /**
     * Find zero or one OutreachSequence that matches the filter.
     * @param {OutreachSequenceFindUniqueArgs} args - Arguments to find a OutreachSequence
     * @example
     * // Get one OutreachSequence
     * const outreachSequence = await prisma.outreachSequence.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OutreachSequenceFindUniqueArgs>(args: SelectSubset<T, OutreachSequenceFindUniqueArgs<ExtArgs>>): Prisma__OutreachSequenceClient<$Result.GetResult<Prisma.$OutreachSequencePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one OutreachSequence that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OutreachSequenceFindUniqueOrThrowArgs} args - Arguments to find a OutreachSequence
     * @example
     * // Get one OutreachSequence
     * const outreachSequence = await prisma.outreachSequence.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OutreachSequenceFindUniqueOrThrowArgs>(args: SelectSubset<T, OutreachSequenceFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OutreachSequenceClient<$Result.GetResult<Prisma.$OutreachSequencePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OutreachSequence that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutreachSequenceFindFirstArgs} args - Arguments to find a OutreachSequence
     * @example
     * // Get one OutreachSequence
     * const outreachSequence = await prisma.outreachSequence.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OutreachSequenceFindFirstArgs>(args?: SelectSubset<T, OutreachSequenceFindFirstArgs<ExtArgs>>): Prisma__OutreachSequenceClient<$Result.GetResult<Prisma.$OutreachSequencePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OutreachSequence that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutreachSequenceFindFirstOrThrowArgs} args - Arguments to find a OutreachSequence
     * @example
     * // Get one OutreachSequence
     * const outreachSequence = await prisma.outreachSequence.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OutreachSequenceFindFirstOrThrowArgs>(args?: SelectSubset<T, OutreachSequenceFindFirstOrThrowArgs<ExtArgs>>): Prisma__OutreachSequenceClient<$Result.GetResult<Prisma.$OutreachSequencePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more OutreachSequences that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutreachSequenceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OutreachSequences
     * const outreachSequences = await prisma.outreachSequence.findMany()
     * 
     * // Get first 10 OutreachSequences
     * const outreachSequences = await prisma.outreachSequence.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const outreachSequenceWithIdOnly = await prisma.outreachSequence.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OutreachSequenceFindManyArgs>(args?: SelectSubset<T, OutreachSequenceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OutreachSequencePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a OutreachSequence.
     * @param {OutreachSequenceCreateArgs} args - Arguments to create a OutreachSequence.
     * @example
     * // Create one OutreachSequence
     * const OutreachSequence = await prisma.outreachSequence.create({
     *   data: {
     *     // ... data to create a OutreachSequence
     *   }
     * })
     * 
     */
    create<T extends OutreachSequenceCreateArgs>(args: SelectSubset<T, OutreachSequenceCreateArgs<ExtArgs>>): Prisma__OutreachSequenceClient<$Result.GetResult<Prisma.$OutreachSequencePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many OutreachSequences.
     * @param {OutreachSequenceCreateManyArgs} args - Arguments to create many OutreachSequences.
     * @example
     * // Create many OutreachSequences
     * const outreachSequence = await prisma.outreachSequence.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OutreachSequenceCreateManyArgs>(args?: SelectSubset<T, OutreachSequenceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OutreachSequences and returns the data saved in the database.
     * @param {OutreachSequenceCreateManyAndReturnArgs} args - Arguments to create many OutreachSequences.
     * @example
     * // Create many OutreachSequences
     * const outreachSequence = await prisma.outreachSequence.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OutreachSequences and only return the `id`
     * const outreachSequenceWithIdOnly = await prisma.outreachSequence.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OutreachSequenceCreateManyAndReturnArgs>(args?: SelectSubset<T, OutreachSequenceCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OutreachSequencePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a OutreachSequence.
     * @param {OutreachSequenceDeleteArgs} args - Arguments to delete one OutreachSequence.
     * @example
     * // Delete one OutreachSequence
     * const OutreachSequence = await prisma.outreachSequence.delete({
     *   where: {
     *     // ... filter to delete one OutreachSequence
     *   }
     * })
     * 
     */
    delete<T extends OutreachSequenceDeleteArgs>(args: SelectSubset<T, OutreachSequenceDeleteArgs<ExtArgs>>): Prisma__OutreachSequenceClient<$Result.GetResult<Prisma.$OutreachSequencePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one OutreachSequence.
     * @param {OutreachSequenceUpdateArgs} args - Arguments to update one OutreachSequence.
     * @example
     * // Update one OutreachSequence
     * const outreachSequence = await prisma.outreachSequence.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OutreachSequenceUpdateArgs>(args: SelectSubset<T, OutreachSequenceUpdateArgs<ExtArgs>>): Prisma__OutreachSequenceClient<$Result.GetResult<Prisma.$OutreachSequencePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more OutreachSequences.
     * @param {OutreachSequenceDeleteManyArgs} args - Arguments to filter OutreachSequences to delete.
     * @example
     * // Delete a few OutreachSequences
     * const { count } = await prisma.outreachSequence.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OutreachSequenceDeleteManyArgs>(args?: SelectSubset<T, OutreachSequenceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OutreachSequences.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutreachSequenceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OutreachSequences
     * const outreachSequence = await prisma.outreachSequence.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OutreachSequenceUpdateManyArgs>(args: SelectSubset<T, OutreachSequenceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OutreachSequences and returns the data updated in the database.
     * @param {OutreachSequenceUpdateManyAndReturnArgs} args - Arguments to update many OutreachSequences.
     * @example
     * // Update many OutreachSequences
     * const outreachSequence = await prisma.outreachSequence.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more OutreachSequences and only return the `id`
     * const outreachSequenceWithIdOnly = await prisma.outreachSequence.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OutreachSequenceUpdateManyAndReturnArgs>(args: SelectSubset<T, OutreachSequenceUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OutreachSequencePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one OutreachSequence.
     * @param {OutreachSequenceUpsertArgs} args - Arguments to update or create a OutreachSequence.
     * @example
     * // Update or create a OutreachSequence
     * const outreachSequence = await prisma.outreachSequence.upsert({
     *   create: {
     *     // ... data to create a OutreachSequence
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OutreachSequence we want to update
     *   }
     * })
     */
    upsert<T extends OutreachSequenceUpsertArgs>(args: SelectSubset<T, OutreachSequenceUpsertArgs<ExtArgs>>): Prisma__OutreachSequenceClient<$Result.GetResult<Prisma.$OutreachSequencePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of OutreachSequences.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutreachSequenceCountArgs} args - Arguments to filter OutreachSequences to count.
     * @example
     * // Count the number of OutreachSequences
     * const count = await prisma.outreachSequence.count({
     *   where: {
     *     // ... the filter for the OutreachSequences we want to count
     *   }
     * })
    **/
    count<T extends OutreachSequenceCountArgs>(
      args?: Subset<T, OutreachSequenceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OutreachSequenceCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OutreachSequence.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutreachSequenceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OutreachSequenceAggregateArgs>(args: Subset<T, OutreachSequenceAggregateArgs>): Prisma.PrismaPromise<GetOutreachSequenceAggregateType<T>>

    /**
     * Group by OutreachSequence.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutreachSequenceGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OutreachSequenceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OutreachSequenceGroupByArgs['orderBy'] }
        : { orderBy?: OutreachSequenceGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OutreachSequenceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOutreachSequenceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OutreachSequence model
   */
  readonly fields: OutreachSequenceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OutreachSequence.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OutreachSequenceClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the OutreachSequence model
   */
  interface OutreachSequenceFieldRefs {
    readonly id: FieldRef<"OutreachSequence", 'Int'>
    readonly uuid: FieldRef<"OutreachSequence", 'String'>
    readonly user_uuid: FieldRef<"OutreachSequence", 'String'>
    readonly name: FieldRef<"OutreachSequence", 'String'>
    readonly steps: FieldRef<"OutreachSequence", 'Json'>
    readonly created_at: FieldRef<"OutreachSequence", 'DateTime'>
    readonly updated_at: FieldRef<"OutreachSequence", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * OutreachSequence findUnique
   */
  export type OutreachSequenceFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutreachSequence
     */
    select?: OutreachSequenceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutreachSequence
     */
    omit?: OutreachSequenceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutreachSequenceInclude<ExtArgs> | null
    /**
     * Filter, which OutreachSequence to fetch.
     */
    where: OutreachSequenceWhereUniqueInput
  }

  /**
   * OutreachSequence findUniqueOrThrow
   */
  export type OutreachSequenceFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutreachSequence
     */
    select?: OutreachSequenceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutreachSequence
     */
    omit?: OutreachSequenceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutreachSequenceInclude<ExtArgs> | null
    /**
     * Filter, which OutreachSequence to fetch.
     */
    where: OutreachSequenceWhereUniqueInput
  }

  /**
   * OutreachSequence findFirst
   */
  export type OutreachSequenceFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutreachSequence
     */
    select?: OutreachSequenceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutreachSequence
     */
    omit?: OutreachSequenceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutreachSequenceInclude<ExtArgs> | null
    /**
     * Filter, which OutreachSequence to fetch.
     */
    where?: OutreachSequenceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OutreachSequences to fetch.
     */
    orderBy?: OutreachSequenceOrderByWithRelationInput | OutreachSequenceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OutreachSequences.
     */
    cursor?: OutreachSequenceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OutreachSequences from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OutreachSequences.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OutreachSequences.
     */
    distinct?: OutreachSequenceScalarFieldEnum | OutreachSequenceScalarFieldEnum[]
  }

  /**
   * OutreachSequence findFirstOrThrow
   */
  export type OutreachSequenceFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutreachSequence
     */
    select?: OutreachSequenceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutreachSequence
     */
    omit?: OutreachSequenceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutreachSequenceInclude<ExtArgs> | null
    /**
     * Filter, which OutreachSequence to fetch.
     */
    where?: OutreachSequenceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OutreachSequences to fetch.
     */
    orderBy?: OutreachSequenceOrderByWithRelationInput | OutreachSequenceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OutreachSequences.
     */
    cursor?: OutreachSequenceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OutreachSequences from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OutreachSequences.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OutreachSequences.
     */
    distinct?: OutreachSequenceScalarFieldEnum | OutreachSequenceScalarFieldEnum[]
  }

  /**
   * OutreachSequence findMany
   */
  export type OutreachSequenceFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutreachSequence
     */
    select?: OutreachSequenceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutreachSequence
     */
    omit?: OutreachSequenceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutreachSequenceInclude<ExtArgs> | null
    /**
     * Filter, which OutreachSequences to fetch.
     */
    where?: OutreachSequenceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OutreachSequences to fetch.
     */
    orderBy?: OutreachSequenceOrderByWithRelationInput | OutreachSequenceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OutreachSequences.
     */
    cursor?: OutreachSequenceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OutreachSequences from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OutreachSequences.
     */
    skip?: number
    distinct?: OutreachSequenceScalarFieldEnum | OutreachSequenceScalarFieldEnum[]
  }

  /**
   * OutreachSequence create
   */
  export type OutreachSequenceCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutreachSequence
     */
    select?: OutreachSequenceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutreachSequence
     */
    omit?: OutreachSequenceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutreachSequenceInclude<ExtArgs> | null
    /**
     * The data needed to create a OutreachSequence.
     */
    data: XOR<OutreachSequenceCreateInput, OutreachSequenceUncheckedCreateInput>
  }

  /**
   * OutreachSequence createMany
   */
  export type OutreachSequenceCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OutreachSequences.
     */
    data: OutreachSequenceCreateManyInput | OutreachSequenceCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OutreachSequence createManyAndReturn
   */
  export type OutreachSequenceCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutreachSequence
     */
    select?: OutreachSequenceSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OutreachSequence
     */
    omit?: OutreachSequenceOmit<ExtArgs> | null
    /**
     * The data used to create many OutreachSequences.
     */
    data: OutreachSequenceCreateManyInput | OutreachSequenceCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutreachSequenceIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * OutreachSequence update
   */
  export type OutreachSequenceUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutreachSequence
     */
    select?: OutreachSequenceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutreachSequence
     */
    omit?: OutreachSequenceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutreachSequenceInclude<ExtArgs> | null
    /**
     * The data needed to update a OutreachSequence.
     */
    data: XOR<OutreachSequenceUpdateInput, OutreachSequenceUncheckedUpdateInput>
    /**
     * Choose, which OutreachSequence to update.
     */
    where: OutreachSequenceWhereUniqueInput
  }

  /**
   * OutreachSequence updateMany
   */
  export type OutreachSequenceUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OutreachSequences.
     */
    data: XOR<OutreachSequenceUpdateManyMutationInput, OutreachSequenceUncheckedUpdateManyInput>
    /**
     * Filter which OutreachSequences to update
     */
    where?: OutreachSequenceWhereInput
    /**
     * Limit how many OutreachSequences to update.
     */
    limit?: number
  }

  /**
   * OutreachSequence updateManyAndReturn
   */
  export type OutreachSequenceUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutreachSequence
     */
    select?: OutreachSequenceSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OutreachSequence
     */
    omit?: OutreachSequenceOmit<ExtArgs> | null
    /**
     * The data used to update OutreachSequences.
     */
    data: XOR<OutreachSequenceUpdateManyMutationInput, OutreachSequenceUncheckedUpdateManyInput>
    /**
     * Filter which OutreachSequences to update
     */
    where?: OutreachSequenceWhereInput
    /**
     * Limit how many OutreachSequences to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutreachSequenceIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * OutreachSequence upsert
   */
  export type OutreachSequenceUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutreachSequence
     */
    select?: OutreachSequenceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutreachSequence
     */
    omit?: OutreachSequenceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutreachSequenceInclude<ExtArgs> | null
    /**
     * The filter to search for the OutreachSequence to update in case it exists.
     */
    where: OutreachSequenceWhereUniqueInput
    /**
     * In case the OutreachSequence found by the `where` argument doesn't exist, create a new OutreachSequence with this data.
     */
    create: XOR<OutreachSequenceCreateInput, OutreachSequenceUncheckedCreateInput>
    /**
     * In case the OutreachSequence was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OutreachSequenceUpdateInput, OutreachSequenceUncheckedUpdateInput>
  }

  /**
   * OutreachSequence delete
   */
  export type OutreachSequenceDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutreachSequence
     */
    select?: OutreachSequenceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutreachSequence
     */
    omit?: OutreachSequenceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutreachSequenceInclude<ExtArgs> | null
    /**
     * Filter which OutreachSequence to delete.
     */
    where: OutreachSequenceWhereUniqueInput
  }

  /**
   * OutreachSequence deleteMany
   */
  export type OutreachSequenceDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OutreachSequences to delete
     */
    where?: OutreachSequenceWhereInput
    /**
     * Limit how many OutreachSequences to delete.
     */
    limit?: number
  }

  /**
   * OutreachSequence without action
   */
  export type OutreachSequenceDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutreachSequence
     */
    select?: OutreachSequenceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OutreachSequence
     */
    omit?: OutreachSequenceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutreachSequenceInclude<ExtArgs> | null
  }


  /**
   * Model FilterJob
   */

  export type AggregateFilterJob = {
    _count: FilterJobCountAggregateOutputType | null
    _avg: FilterJobAvgAggregateOutputType | null
    _sum: FilterJobSumAggregateOutputType | null
    _min: FilterJobMinAggregateOutputType | null
    _max: FilterJobMaxAggregateOutputType | null
  }

  export type FilterJobAvgAggregateOutputType = {
    id: number | null
    leads_found: number | null
    duration: number | null
  }

  export type FilterJobSumAggregateOutputType = {
    id: number | null
    leads_found: number | null
    duration: number | null
  }

  export type FilterJobMinAggregateOutputType = {
    id: number | null
    uuid: string | null
    filter_uuid: string | null
    status: $Enums.JobStatus | null
    leads_found: number | null
    duration: number | null
    error: string | null
    started_at: Date | null
    completed_at: Date | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type FilterJobMaxAggregateOutputType = {
    id: number | null
    uuid: string | null
    filter_uuid: string | null
    status: $Enums.JobStatus | null
    leads_found: number | null
    duration: number | null
    error: string | null
    started_at: Date | null
    completed_at: Date | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type FilterJobCountAggregateOutputType = {
    id: number
    uuid: number
    filter_uuid: number
    status: number
    leads_found: number
    duration: number
    error: number
    started_at: number
    completed_at: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type FilterJobAvgAggregateInputType = {
    id?: true
    leads_found?: true
    duration?: true
  }

  export type FilterJobSumAggregateInputType = {
    id?: true
    leads_found?: true
    duration?: true
  }

  export type FilterJobMinAggregateInputType = {
    id?: true
    uuid?: true
    filter_uuid?: true
    status?: true
    leads_found?: true
    duration?: true
    error?: true
    started_at?: true
    completed_at?: true
    created_at?: true
    updated_at?: true
  }

  export type FilterJobMaxAggregateInputType = {
    id?: true
    uuid?: true
    filter_uuid?: true
    status?: true
    leads_found?: true
    duration?: true
    error?: true
    started_at?: true
    completed_at?: true
    created_at?: true
    updated_at?: true
  }

  export type FilterJobCountAggregateInputType = {
    id?: true
    uuid?: true
    filter_uuid?: true
    status?: true
    leads_found?: true
    duration?: true
    error?: true
    started_at?: true
    completed_at?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type FilterJobAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FilterJob to aggregate.
     */
    where?: FilterJobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FilterJobs to fetch.
     */
    orderBy?: FilterJobOrderByWithRelationInput | FilterJobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FilterJobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FilterJobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FilterJobs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned FilterJobs
    **/
    _count?: true | FilterJobCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: FilterJobAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: FilterJobSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FilterJobMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FilterJobMaxAggregateInputType
  }

  export type GetFilterJobAggregateType<T extends FilterJobAggregateArgs> = {
        [P in keyof T & keyof AggregateFilterJob]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFilterJob[P]>
      : GetScalarType<T[P], AggregateFilterJob[P]>
  }




  export type FilterJobGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FilterJobWhereInput
    orderBy?: FilterJobOrderByWithAggregationInput | FilterJobOrderByWithAggregationInput[]
    by: FilterJobScalarFieldEnum[] | FilterJobScalarFieldEnum
    having?: FilterJobScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FilterJobCountAggregateInputType | true
    _avg?: FilterJobAvgAggregateInputType
    _sum?: FilterJobSumAggregateInputType
    _min?: FilterJobMinAggregateInputType
    _max?: FilterJobMaxAggregateInputType
  }

  export type FilterJobGroupByOutputType = {
    id: number
    uuid: string
    filter_uuid: string
    status: $Enums.JobStatus
    leads_found: number
    duration: number
    error: string | null
    started_at: Date
    completed_at: Date | null
    created_at: Date
    updated_at: Date
    _count: FilterJobCountAggregateOutputType | null
    _avg: FilterJobAvgAggregateOutputType | null
    _sum: FilterJobSumAggregateOutputType | null
    _min: FilterJobMinAggregateOutputType | null
    _max: FilterJobMaxAggregateOutputType | null
  }

  type GetFilterJobGroupByPayload<T extends FilterJobGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FilterJobGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FilterJobGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FilterJobGroupByOutputType[P]>
            : GetScalarType<T[P], FilterJobGroupByOutputType[P]>
        }
      >
    >


  export type FilterJobSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    uuid?: boolean
    filter_uuid?: boolean
    status?: boolean
    leads_found?: boolean
    duration?: boolean
    error?: boolean
    started_at?: boolean
    completed_at?: boolean
    created_at?: boolean
    updated_at?: boolean
    filter?: boolean | FilterDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["filterJob"]>

  export type FilterJobSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    uuid?: boolean
    filter_uuid?: boolean
    status?: boolean
    leads_found?: boolean
    duration?: boolean
    error?: boolean
    started_at?: boolean
    completed_at?: boolean
    created_at?: boolean
    updated_at?: boolean
    filter?: boolean | FilterDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["filterJob"]>

  export type FilterJobSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    uuid?: boolean
    filter_uuid?: boolean
    status?: boolean
    leads_found?: boolean
    duration?: boolean
    error?: boolean
    started_at?: boolean
    completed_at?: boolean
    created_at?: boolean
    updated_at?: boolean
    filter?: boolean | FilterDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["filterJob"]>

  export type FilterJobSelectScalar = {
    id?: boolean
    uuid?: boolean
    filter_uuid?: boolean
    status?: boolean
    leads_found?: boolean
    duration?: boolean
    error?: boolean
    started_at?: boolean
    completed_at?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type FilterJobOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "uuid" | "filter_uuid" | "status" | "leads_found" | "duration" | "error" | "started_at" | "completed_at" | "created_at" | "updated_at", ExtArgs["result"]["filterJob"]>
  export type FilterJobInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    filter?: boolean | FilterDefaultArgs<ExtArgs>
  }
  export type FilterJobIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    filter?: boolean | FilterDefaultArgs<ExtArgs>
  }
  export type FilterJobIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    filter?: boolean | FilterDefaultArgs<ExtArgs>
  }

  export type $FilterJobPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "FilterJob"
    objects: {
      filter: Prisma.$FilterPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      uuid: string
      filter_uuid: string
      status: $Enums.JobStatus
      leads_found: number
      duration: number
      error: string | null
      started_at: Date
      completed_at: Date | null
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["filterJob"]>
    composites: {}
  }

  type FilterJobGetPayload<S extends boolean | null | undefined | FilterJobDefaultArgs> = $Result.GetResult<Prisma.$FilterJobPayload, S>

  type FilterJobCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<FilterJobFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: FilterJobCountAggregateInputType | true
    }

  export interface FilterJobDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['FilterJob'], meta: { name: 'FilterJob' } }
    /**
     * Find zero or one FilterJob that matches the filter.
     * @param {FilterJobFindUniqueArgs} args - Arguments to find a FilterJob
     * @example
     * // Get one FilterJob
     * const filterJob = await prisma.filterJob.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FilterJobFindUniqueArgs>(args: SelectSubset<T, FilterJobFindUniqueArgs<ExtArgs>>): Prisma__FilterJobClient<$Result.GetResult<Prisma.$FilterJobPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one FilterJob that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {FilterJobFindUniqueOrThrowArgs} args - Arguments to find a FilterJob
     * @example
     * // Get one FilterJob
     * const filterJob = await prisma.filterJob.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FilterJobFindUniqueOrThrowArgs>(args: SelectSubset<T, FilterJobFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FilterJobClient<$Result.GetResult<Prisma.$FilterJobPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first FilterJob that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FilterJobFindFirstArgs} args - Arguments to find a FilterJob
     * @example
     * // Get one FilterJob
     * const filterJob = await prisma.filterJob.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FilterJobFindFirstArgs>(args?: SelectSubset<T, FilterJobFindFirstArgs<ExtArgs>>): Prisma__FilterJobClient<$Result.GetResult<Prisma.$FilterJobPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first FilterJob that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FilterJobFindFirstOrThrowArgs} args - Arguments to find a FilterJob
     * @example
     * // Get one FilterJob
     * const filterJob = await prisma.filterJob.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FilterJobFindFirstOrThrowArgs>(args?: SelectSubset<T, FilterJobFindFirstOrThrowArgs<ExtArgs>>): Prisma__FilterJobClient<$Result.GetResult<Prisma.$FilterJobPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more FilterJobs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FilterJobFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all FilterJobs
     * const filterJobs = await prisma.filterJob.findMany()
     * 
     * // Get first 10 FilterJobs
     * const filterJobs = await prisma.filterJob.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const filterJobWithIdOnly = await prisma.filterJob.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends FilterJobFindManyArgs>(args?: SelectSubset<T, FilterJobFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FilterJobPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a FilterJob.
     * @param {FilterJobCreateArgs} args - Arguments to create a FilterJob.
     * @example
     * // Create one FilterJob
     * const FilterJob = await prisma.filterJob.create({
     *   data: {
     *     // ... data to create a FilterJob
     *   }
     * })
     * 
     */
    create<T extends FilterJobCreateArgs>(args: SelectSubset<T, FilterJobCreateArgs<ExtArgs>>): Prisma__FilterJobClient<$Result.GetResult<Prisma.$FilterJobPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many FilterJobs.
     * @param {FilterJobCreateManyArgs} args - Arguments to create many FilterJobs.
     * @example
     * // Create many FilterJobs
     * const filterJob = await prisma.filterJob.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FilterJobCreateManyArgs>(args?: SelectSubset<T, FilterJobCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many FilterJobs and returns the data saved in the database.
     * @param {FilterJobCreateManyAndReturnArgs} args - Arguments to create many FilterJobs.
     * @example
     * // Create many FilterJobs
     * const filterJob = await prisma.filterJob.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many FilterJobs and only return the `id`
     * const filterJobWithIdOnly = await prisma.filterJob.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FilterJobCreateManyAndReturnArgs>(args?: SelectSubset<T, FilterJobCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FilterJobPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a FilterJob.
     * @param {FilterJobDeleteArgs} args - Arguments to delete one FilterJob.
     * @example
     * // Delete one FilterJob
     * const FilterJob = await prisma.filterJob.delete({
     *   where: {
     *     // ... filter to delete one FilterJob
     *   }
     * })
     * 
     */
    delete<T extends FilterJobDeleteArgs>(args: SelectSubset<T, FilterJobDeleteArgs<ExtArgs>>): Prisma__FilterJobClient<$Result.GetResult<Prisma.$FilterJobPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one FilterJob.
     * @param {FilterJobUpdateArgs} args - Arguments to update one FilterJob.
     * @example
     * // Update one FilterJob
     * const filterJob = await prisma.filterJob.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FilterJobUpdateArgs>(args: SelectSubset<T, FilterJobUpdateArgs<ExtArgs>>): Prisma__FilterJobClient<$Result.GetResult<Prisma.$FilterJobPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more FilterJobs.
     * @param {FilterJobDeleteManyArgs} args - Arguments to filter FilterJobs to delete.
     * @example
     * // Delete a few FilterJobs
     * const { count } = await prisma.filterJob.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FilterJobDeleteManyArgs>(args?: SelectSubset<T, FilterJobDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more FilterJobs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FilterJobUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many FilterJobs
     * const filterJob = await prisma.filterJob.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FilterJobUpdateManyArgs>(args: SelectSubset<T, FilterJobUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more FilterJobs and returns the data updated in the database.
     * @param {FilterJobUpdateManyAndReturnArgs} args - Arguments to update many FilterJobs.
     * @example
     * // Update many FilterJobs
     * const filterJob = await prisma.filterJob.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more FilterJobs and only return the `id`
     * const filterJobWithIdOnly = await prisma.filterJob.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends FilterJobUpdateManyAndReturnArgs>(args: SelectSubset<T, FilterJobUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FilterJobPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one FilterJob.
     * @param {FilterJobUpsertArgs} args - Arguments to update or create a FilterJob.
     * @example
     * // Update or create a FilterJob
     * const filterJob = await prisma.filterJob.upsert({
     *   create: {
     *     // ... data to create a FilterJob
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the FilterJob we want to update
     *   }
     * })
     */
    upsert<T extends FilterJobUpsertArgs>(args: SelectSubset<T, FilterJobUpsertArgs<ExtArgs>>): Prisma__FilterJobClient<$Result.GetResult<Prisma.$FilterJobPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of FilterJobs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FilterJobCountArgs} args - Arguments to filter FilterJobs to count.
     * @example
     * // Count the number of FilterJobs
     * const count = await prisma.filterJob.count({
     *   where: {
     *     // ... the filter for the FilterJobs we want to count
     *   }
     * })
    **/
    count<T extends FilterJobCountArgs>(
      args?: Subset<T, FilterJobCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FilterJobCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a FilterJob.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FilterJobAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends FilterJobAggregateArgs>(args: Subset<T, FilterJobAggregateArgs>): Prisma.PrismaPromise<GetFilterJobAggregateType<T>>

    /**
     * Group by FilterJob.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FilterJobGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends FilterJobGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FilterJobGroupByArgs['orderBy'] }
        : { orderBy?: FilterJobGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, FilterJobGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFilterJobGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the FilterJob model
   */
  readonly fields: FilterJobFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for FilterJob.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FilterJobClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    filter<T extends FilterDefaultArgs<ExtArgs> = {}>(args?: Subset<T, FilterDefaultArgs<ExtArgs>>): Prisma__FilterClient<$Result.GetResult<Prisma.$FilterPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the FilterJob model
   */
  interface FilterJobFieldRefs {
    readonly id: FieldRef<"FilterJob", 'Int'>
    readonly uuid: FieldRef<"FilterJob", 'String'>
    readonly filter_uuid: FieldRef<"FilterJob", 'String'>
    readonly status: FieldRef<"FilterJob", 'JobStatus'>
    readonly leads_found: FieldRef<"FilterJob", 'Int'>
    readonly duration: FieldRef<"FilterJob", 'Int'>
    readonly error: FieldRef<"FilterJob", 'String'>
    readonly started_at: FieldRef<"FilterJob", 'DateTime'>
    readonly completed_at: FieldRef<"FilterJob", 'DateTime'>
    readonly created_at: FieldRef<"FilterJob", 'DateTime'>
    readonly updated_at: FieldRef<"FilterJob", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * FilterJob findUnique
   */
  export type FilterJobFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FilterJob
     */
    select?: FilterJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FilterJob
     */
    omit?: FilterJobOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FilterJobInclude<ExtArgs> | null
    /**
     * Filter, which FilterJob to fetch.
     */
    where: FilterJobWhereUniqueInput
  }

  /**
   * FilterJob findUniqueOrThrow
   */
  export type FilterJobFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FilterJob
     */
    select?: FilterJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FilterJob
     */
    omit?: FilterJobOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FilterJobInclude<ExtArgs> | null
    /**
     * Filter, which FilterJob to fetch.
     */
    where: FilterJobWhereUniqueInput
  }

  /**
   * FilterJob findFirst
   */
  export type FilterJobFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FilterJob
     */
    select?: FilterJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FilterJob
     */
    omit?: FilterJobOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FilterJobInclude<ExtArgs> | null
    /**
     * Filter, which FilterJob to fetch.
     */
    where?: FilterJobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FilterJobs to fetch.
     */
    orderBy?: FilterJobOrderByWithRelationInput | FilterJobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FilterJobs.
     */
    cursor?: FilterJobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FilterJobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FilterJobs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FilterJobs.
     */
    distinct?: FilterJobScalarFieldEnum | FilterJobScalarFieldEnum[]
  }

  /**
   * FilterJob findFirstOrThrow
   */
  export type FilterJobFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FilterJob
     */
    select?: FilterJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FilterJob
     */
    omit?: FilterJobOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FilterJobInclude<ExtArgs> | null
    /**
     * Filter, which FilterJob to fetch.
     */
    where?: FilterJobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FilterJobs to fetch.
     */
    orderBy?: FilterJobOrderByWithRelationInput | FilterJobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FilterJobs.
     */
    cursor?: FilterJobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FilterJobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FilterJobs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FilterJobs.
     */
    distinct?: FilterJobScalarFieldEnum | FilterJobScalarFieldEnum[]
  }

  /**
   * FilterJob findMany
   */
  export type FilterJobFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FilterJob
     */
    select?: FilterJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FilterJob
     */
    omit?: FilterJobOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FilterJobInclude<ExtArgs> | null
    /**
     * Filter, which FilterJobs to fetch.
     */
    where?: FilterJobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FilterJobs to fetch.
     */
    orderBy?: FilterJobOrderByWithRelationInput | FilterJobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing FilterJobs.
     */
    cursor?: FilterJobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FilterJobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FilterJobs.
     */
    skip?: number
    distinct?: FilterJobScalarFieldEnum | FilterJobScalarFieldEnum[]
  }

  /**
   * FilterJob create
   */
  export type FilterJobCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FilterJob
     */
    select?: FilterJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FilterJob
     */
    omit?: FilterJobOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FilterJobInclude<ExtArgs> | null
    /**
     * The data needed to create a FilterJob.
     */
    data: XOR<FilterJobCreateInput, FilterJobUncheckedCreateInput>
  }

  /**
   * FilterJob createMany
   */
  export type FilterJobCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many FilterJobs.
     */
    data: FilterJobCreateManyInput | FilterJobCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * FilterJob createManyAndReturn
   */
  export type FilterJobCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FilterJob
     */
    select?: FilterJobSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the FilterJob
     */
    omit?: FilterJobOmit<ExtArgs> | null
    /**
     * The data used to create many FilterJobs.
     */
    data: FilterJobCreateManyInput | FilterJobCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FilterJobIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * FilterJob update
   */
  export type FilterJobUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FilterJob
     */
    select?: FilterJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FilterJob
     */
    omit?: FilterJobOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FilterJobInclude<ExtArgs> | null
    /**
     * The data needed to update a FilterJob.
     */
    data: XOR<FilterJobUpdateInput, FilterJobUncheckedUpdateInput>
    /**
     * Choose, which FilterJob to update.
     */
    where: FilterJobWhereUniqueInput
  }

  /**
   * FilterJob updateMany
   */
  export type FilterJobUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update FilterJobs.
     */
    data: XOR<FilterJobUpdateManyMutationInput, FilterJobUncheckedUpdateManyInput>
    /**
     * Filter which FilterJobs to update
     */
    where?: FilterJobWhereInput
    /**
     * Limit how many FilterJobs to update.
     */
    limit?: number
  }

  /**
   * FilterJob updateManyAndReturn
   */
  export type FilterJobUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FilterJob
     */
    select?: FilterJobSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the FilterJob
     */
    omit?: FilterJobOmit<ExtArgs> | null
    /**
     * The data used to update FilterJobs.
     */
    data: XOR<FilterJobUpdateManyMutationInput, FilterJobUncheckedUpdateManyInput>
    /**
     * Filter which FilterJobs to update
     */
    where?: FilterJobWhereInput
    /**
     * Limit how many FilterJobs to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FilterJobIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * FilterJob upsert
   */
  export type FilterJobUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FilterJob
     */
    select?: FilterJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FilterJob
     */
    omit?: FilterJobOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FilterJobInclude<ExtArgs> | null
    /**
     * The filter to search for the FilterJob to update in case it exists.
     */
    where: FilterJobWhereUniqueInput
    /**
     * In case the FilterJob found by the `where` argument doesn't exist, create a new FilterJob with this data.
     */
    create: XOR<FilterJobCreateInput, FilterJobUncheckedCreateInput>
    /**
     * In case the FilterJob was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FilterJobUpdateInput, FilterJobUncheckedUpdateInput>
  }

  /**
   * FilterJob delete
   */
  export type FilterJobDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FilterJob
     */
    select?: FilterJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FilterJob
     */
    omit?: FilterJobOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FilterJobInclude<ExtArgs> | null
    /**
     * Filter which FilterJob to delete.
     */
    where: FilterJobWhereUniqueInput
  }

  /**
   * FilterJob deleteMany
   */
  export type FilterJobDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FilterJobs to delete
     */
    where?: FilterJobWhereInput
    /**
     * Limit how many FilterJobs to delete.
     */
    limit?: number
  }

  /**
   * FilterJob without action
   */
  export type FilterJobDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FilterJob
     */
    select?: FilterJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FilterJob
     */
    omit?: FilterJobOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FilterJobInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    uuid: 'uuid',
    email: 'email',
    phone: 'phone',
    password: 'password',
    role: 'role',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const FilterScalarFieldEnum: {
    id: 'id',
    uuid: 'uuid',
    user_uuid: 'user_uuid',
    name: 'name',
    source_type: 'source_type',
    query_config: 'query_config',
    enabled: 'enabled',
    cron_schedule: 'cron_schedule',
    channels: 'channels',
    ai_instructions: 'ai_instructions',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type FilterScalarFieldEnum = (typeof FilterScalarFieldEnum)[keyof typeof FilterScalarFieldEnum]


  export const RawLeadScalarFieldEnum: {
    id: 'id',
    uuid: 'uuid',
    filter_uuid: 'filter_uuid',
    source_type: 'source_type',
    raw_data: 'raw_data',
    processed_at: 'processed_at',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type RawLeadScalarFieldEnum = (typeof RawLeadScalarFieldEnum)[keyof typeof RawLeadScalarFieldEnum]


  export const LeadScalarFieldEnum: {
    id: 'id',
    uuid: 'uuid',
    raw_lead_uuid: 'raw_lead_uuid',
    name: 'name',
    email: 'email',
    phone: 'phone',
    company: 'company',
    website: 'website',
    linkedin_url: 'linkedin_url',
    title: 'title',
    location: 'location',
    industry: 'industry',
    description: 'description',
    source_type: 'source_type',
    raw_data: 'raw_data',
    enrichment_data: 'enrichment_data',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type LeadScalarFieldEnum = (typeof LeadScalarFieldEnum)[keyof typeof LeadScalarFieldEnum]


  export const ContactScalarFieldEnum: {
    id: 'id',
    uuid: 'uuid',
    user_uuid: 'user_uuid',
    lead_uuid: 'lead_uuid',
    filter_uuid: 'filter_uuid',
    status: 'status',
    score: 'score',
    notes: 'notes',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type ContactScalarFieldEnum = (typeof ContactScalarFieldEnum)[keyof typeof ContactScalarFieldEnum]


  export const ContactTagScalarFieldEnum: {
    id: 'id',
    contact_uuid: 'contact_uuid',
    tag: 'tag',
    created_at: 'created_at'
  };

  export type ContactTagScalarFieldEnum = (typeof ContactTagScalarFieldEnum)[keyof typeof ContactTagScalarFieldEnum]


  export const InteractionScalarFieldEnum: {
    id: 'id',
    uuid: 'uuid',
    contact_uuid: 'contact_uuid',
    user_uuid: 'user_uuid',
    type: 'type',
    content: 'content',
    metadata: 'metadata',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type InteractionScalarFieldEnum = (typeof InteractionScalarFieldEnum)[keyof typeof InteractionScalarFieldEnum]


  export const OutreachMessageScalarFieldEnum: {
    id: 'id',
    uuid: 'uuid',
    user_uuid: 'user_uuid',
    contact_uuid: 'contact_uuid',
    channel: 'channel',
    subject: 'subject',
    content: 'content',
    status: 'status',
    scheduled_at: 'scheduled_at',
    sent_at: 'sent_at',
    metadata: 'metadata',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type OutreachMessageScalarFieldEnum = (typeof OutreachMessageScalarFieldEnum)[keyof typeof OutreachMessageScalarFieldEnum]


  export const OutreachSequenceScalarFieldEnum: {
    id: 'id',
    uuid: 'uuid',
    user_uuid: 'user_uuid',
    name: 'name',
    steps: 'steps',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type OutreachSequenceScalarFieldEnum = (typeof OutreachSequenceScalarFieldEnum)[keyof typeof OutreachSequenceScalarFieldEnum]


  export const FilterJobScalarFieldEnum: {
    id: 'id',
    uuid: 'uuid',
    filter_uuid: 'filter_uuid',
    status: 'status',
    leads_found: 'leads_found',
    duration: 'duration',
    error: 'error',
    started_at: 'started_at',
    completed_at: 'completed_at',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type FilterJobScalarFieldEnum = (typeof FilterJobScalarFieldEnum)[keyof typeof FilterJobScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'AuthRole'
   */
  export type EnumAuthRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AuthRole'>
    


  /**
   * Reference to a field of type 'AuthRole[]'
   */
  export type ListEnumAuthRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AuthRole[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'SourceType'
   */
  export type EnumSourceTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SourceType'>
    


  /**
   * Reference to a field of type 'SourceType[]'
   */
  export type ListEnumSourceTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SourceType[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Channel[]'
   */
  export type ListEnumChannelFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Channel[]'>
    


  /**
   * Reference to a field of type 'Channel'
   */
  export type EnumChannelFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Channel'>
    


  /**
   * Reference to a field of type 'LeadStatus'
   */
  export type EnumLeadStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'LeadStatus'>
    


  /**
   * Reference to a field of type 'LeadStatus[]'
   */
  export type ListEnumLeadStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'LeadStatus[]'>
    


  /**
   * Reference to a field of type 'InteractionType'
   */
  export type EnumInteractionTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'InteractionType'>
    


  /**
   * Reference to a field of type 'InteractionType[]'
   */
  export type ListEnumInteractionTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'InteractionType[]'>
    


  /**
   * Reference to a field of type 'MsgStatus'
   */
  export type EnumMsgStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MsgStatus'>
    


  /**
   * Reference to a field of type 'MsgStatus[]'
   */
  export type ListEnumMsgStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MsgStatus[]'>
    


  /**
   * Reference to a field of type 'JobStatus'
   */
  export type EnumJobStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'JobStatus'>
    


  /**
   * Reference to a field of type 'JobStatus[]'
   */
  export type ListEnumJobStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'JobStatus[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: IntFilter<"User"> | number
    uuid?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    phone?: StringNullableFilter<"User"> | string | null
    password?: StringFilter<"User"> | string
    role?: EnumAuthRoleFilter<"User"> | $Enums.AuthRole
    created_at?: DateTimeFilter<"User"> | Date | string
    updated_at?: DateTimeFilter<"User"> | Date | string
    filters?: FilterListRelationFilter
    contacts?: ContactListRelationFilter
    outreach_messages?: OutreachMessageListRelationFilter
    outreach_sequences?: OutreachSequenceListRelationFilter
    interactions?: InteractionListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    uuid?: SortOrder
    email?: SortOrder
    phone?: SortOrderInput | SortOrder
    password?: SortOrder
    role?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    filters?: FilterOrderByRelationAggregateInput
    contacts?: ContactOrderByRelationAggregateInput
    outreach_messages?: OutreachMessageOrderByRelationAggregateInput
    outreach_sequences?: OutreachSequenceOrderByRelationAggregateInput
    interactions?: InteractionOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    uuid?: string
    email?: string
    phone?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    password?: StringFilter<"User"> | string
    role?: EnumAuthRoleFilter<"User"> | $Enums.AuthRole
    created_at?: DateTimeFilter<"User"> | Date | string
    updated_at?: DateTimeFilter<"User"> | Date | string
    filters?: FilterListRelationFilter
    contacts?: ContactListRelationFilter
    outreach_messages?: OutreachMessageListRelationFilter
    outreach_sequences?: OutreachSequenceListRelationFilter
    interactions?: InteractionListRelationFilter
  }, "id" | "uuid" | "email" | "phone">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    uuid?: SortOrder
    email?: SortOrder
    phone?: SortOrderInput | SortOrder
    password?: SortOrder
    role?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _avg?: UserAvgOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
    _sum?: UserSumOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"User"> | number
    uuid?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    phone?: StringNullableWithAggregatesFilter<"User"> | string | null
    password?: StringWithAggregatesFilter<"User"> | string
    role?: EnumAuthRoleWithAggregatesFilter<"User"> | $Enums.AuthRole
    created_at?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type FilterWhereInput = {
    AND?: FilterWhereInput | FilterWhereInput[]
    OR?: FilterWhereInput[]
    NOT?: FilterWhereInput | FilterWhereInput[]
    id?: IntFilter<"Filter"> | number
    uuid?: StringFilter<"Filter"> | string
    user_uuid?: StringFilter<"Filter"> | string
    name?: StringFilter<"Filter"> | string
    source_type?: EnumSourceTypeFilter<"Filter"> | $Enums.SourceType
    query_config?: JsonFilter<"Filter">
    enabled?: BoolFilter<"Filter"> | boolean
    cron_schedule?: StringNullableFilter<"Filter"> | string | null
    channels?: EnumChannelNullableListFilter<"Filter">
    ai_instructions?: StringNullableFilter<"Filter"> | string | null
    created_at?: DateTimeFilter<"Filter"> | Date | string
    updated_at?: DateTimeFilter<"Filter"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    raw_leads?: RawLeadListRelationFilter
    contacts?: ContactListRelationFilter
    jobs?: FilterJobListRelationFilter
  }

  export type FilterOrderByWithRelationInput = {
    id?: SortOrder
    uuid?: SortOrder
    user_uuid?: SortOrder
    name?: SortOrder
    source_type?: SortOrder
    query_config?: SortOrder
    enabled?: SortOrder
    cron_schedule?: SortOrderInput | SortOrder
    channels?: SortOrder
    ai_instructions?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    user?: UserOrderByWithRelationInput
    raw_leads?: RawLeadOrderByRelationAggregateInput
    contacts?: ContactOrderByRelationAggregateInput
    jobs?: FilterJobOrderByRelationAggregateInput
  }

  export type FilterWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    uuid?: string
    AND?: FilterWhereInput | FilterWhereInput[]
    OR?: FilterWhereInput[]
    NOT?: FilterWhereInput | FilterWhereInput[]
    user_uuid?: StringFilter<"Filter"> | string
    name?: StringFilter<"Filter"> | string
    source_type?: EnumSourceTypeFilter<"Filter"> | $Enums.SourceType
    query_config?: JsonFilter<"Filter">
    enabled?: BoolFilter<"Filter"> | boolean
    cron_schedule?: StringNullableFilter<"Filter"> | string | null
    channels?: EnumChannelNullableListFilter<"Filter">
    ai_instructions?: StringNullableFilter<"Filter"> | string | null
    created_at?: DateTimeFilter<"Filter"> | Date | string
    updated_at?: DateTimeFilter<"Filter"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    raw_leads?: RawLeadListRelationFilter
    contacts?: ContactListRelationFilter
    jobs?: FilterJobListRelationFilter
  }, "id" | "uuid">

  export type FilterOrderByWithAggregationInput = {
    id?: SortOrder
    uuid?: SortOrder
    user_uuid?: SortOrder
    name?: SortOrder
    source_type?: SortOrder
    query_config?: SortOrder
    enabled?: SortOrder
    cron_schedule?: SortOrderInput | SortOrder
    channels?: SortOrder
    ai_instructions?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: FilterCountOrderByAggregateInput
    _avg?: FilterAvgOrderByAggregateInput
    _max?: FilterMaxOrderByAggregateInput
    _min?: FilterMinOrderByAggregateInput
    _sum?: FilterSumOrderByAggregateInput
  }

  export type FilterScalarWhereWithAggregatesInput = {
    AND?: FilterScalarWhereWithAggregatesInput | FilterScalarWhereWithAggregatesInput[]
    OR?: FilterScalarWhereWithAggregatesInput[]
    NOT?: FilterScalarWhereWithAggregatesInput | FilterScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Filter"> | number
    uuid?: StringWithAggregatesFilter<"Filter"> | string
    user_uuid?: StringWithAggregatesFilter<"Filter"> | string
    name?: StringWithAggregatesFilter<"Filter"> | string
    source_type?: EnumSourceTypeWithAggregatesFilter<"Filter"> | $Enums.SourceType
    query_config?: JsonWithAggregatesFilter<"Filter">
    enabled?: BoolWithAggregatesFilter<"Filter"> | boolean
    cron_schedule?: StringNullableWithAggregatesFilter<"Filter"> | string | null
    channels?: EnumChannelNullableListFilter<"Filter">
    ai_instructions?: StringNullableWithAggregatesFilter<"Filter"> | string | null
    created_at?: DateTimeWithAggregatesFilter<"Filter"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"Filter"> | Date | string
  }

  export type RawLeadWhereInput = {
    AND?: RawLeadWhereInput | RawLeadWhereInput[]
    OR?: RawLeadWhereInput[]
    NOT?: RawLeadWhereInput | RawLeadWhereInput[]
    id?: IntFilter<"RawLead"> | number
    uuid?: StringFilter<"RawLead"> | string
    filter_uuid?: StringFilter<"RawLead"> | string
    source_type?: EnumSourceTypeFilter<"RawLead"> | $Enums.SourceType
    raw_data?: JsonFilter<"RawLead">
    processed_at?: DateTimeNullableFilter<"RawLead"> | Date | string | null
    created_at?: DateTimeFilter<"RawLead"> | Date | string
    updated_at?: DateTimeFilter<"RawLead"> | Date | string
    filter?: XOR<FilterScalarRelationFilter, FilterWhereInput>
    lead?: XOR<LeadNullableScalarRelationFilter, LeadWhereInput> | null
  }

  export type RawLeadOrderByWithRelationInput = {
    id?: SortOrder
    uuid?: SortOrder
    filter_uuid?: SortOrder
    source_type?: SortOrder
    raw_data?: SortOrder
    processed_at?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    filter?: FilterOrderByWithRelationInput
    lead?: LeadOrderByWithRelationInput
  }

  export type RawLeadWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    uuid?: string
    AND?: RawLeadWhereInput | RawLeadWhereInput[]
    OR?: RawLeadWhereInput[]
    NOT?: RawLeadWhereInput | RawLeadWhereInput[]
    filter_uuid?: StringFilter<"RawLead"> | string
    source_type?: EnumSourceTypeFilter<"RawLead"> | $Enums.SourceType
    raw_data?: JsonFilter<"RawLead">
    processed_at?: DateTimeNullableFilter<"RawLead"> | Date | string | null
    created_at?: DateTimeFilter<"RawLead"> | Date | string
    updated_at?: DateTimeFilter<"RawLead"> | Date | string
    filter?: XOR<FilterScalarRelationFilter, FilterWhereInput>
    lead?: XOR<LeadNullableScalarRelationFilter, LeadWhereInput> | null
  }, "id" | "uuid">

  export type RawLeadOrderByWithAggregationInput = {
    id?: SortOrder
    uuid?: SortOrder
    filter_uuid?: SortOrder
    source_type?: SortOrder
    raw_data?: SortOrder
    processed_at?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: RawLeadCountOrderByAggregateInput
    _avg?: RawLeadAvgOrderByAggregateInput
    _max?: RawLeadMaxOrderByAggregateInput
    _min?: RawLeadMinOrderByAggregateInput
    _sum?: RawLeadSumOrderByAggregateInput
  }

  export type RawLeadScalarWhereWithAggregatesInput = {
    AND?: RawLeadScalarWhereWithAggregatesInput | RawLeadScalarWhereWithAggregatesInput[]
    OR?: RawLeadScalarWhereWithAggregatesInput[]
    NOT?: RawLeadScalarWhereWithAggregatesInput | RawLeadScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"RawLead"> | number
    uuid?: StringWithAggregatesFilter<"RawLead"> | string
    filter_uuid?: StringWithAggregatesFilter<"RawLead"> | string
    source_type?: EnumSourceTypeWithAggregatesFilter<"RawLead"> | $Enums.SourceType
    raw_data?: JsonWithAggregatesFilter<"RawLead">
    processed_at?: DateTimeNullableWithAggregatesFilter<"RawLead"> | Date | string | null
    created_at?: DateTimeWithAggregatesFilter<"RawLead"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"RawLead"> | Date | string
  }

  export type LeadWhereInput = {
    AND?: LeadWhereInput | LeadWhereInput[]
    OR?: LeadWhereInput[]
    NOT?: LeadWhereInput | LeadWhereInput[]
    id?: IntFilter<"Lead"> | number
    uuid?: StringFilter<"Lead"> | string
    raw_lead_uuid?: StringNullableFilter<"Lead"> | string | null
    name?: StringNullableFilter<"Lead"> | string | null
    email?: StringNullableFilter<"Lead"> | string | null
    phone?: StringNullableFilter<"Lead"> | string | null
    company?: StringNullableFilter<"Lead"> | string | null
    website?: StringNullableFilter<"Lead"> | string | null
    linkedin_url?: StringNullableFilter<"Lead"> | string | null
    title?: StringNullableFilter<"Lead"> | string | null
    location?: StringNullableFilter<"Lead"> | string | null
    industry?: StringNullableFilter<"Lead"> | string | null
    description?: StringNullableFilter<"Lead"> | string | null
    source_type?: EnumSourceTypeFilter<"Lead"> | $Enums.SourceType
    raw_data?: JsonNullableFilter<"Lead">
    enrichment_data?: JsonNullableFilter<"Lead">
    created_at?: DateTimeFilter<"Lead"> | Date | string
    updated_at?: DateTimeFilter<"Lead"> | Date | string
    raw_lead?: XOR<RawLeadNullableScalarRelationFilter, RawLeadWhereInput> | null
    contacts?: ContactListRelationFilter
  }

  export type LeadOrderByWithRelationInput = {
    id?: SortOrder
    uuid?: SortOrder
    raw_lead_uuid?: SortOrderInput | SortOrder
    name?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    phone?: SortOrderInput | SortOrder
    company?: SortOrderInput | SortOrder
    website?: SortOrderInput | SortOrder
    linkedin_url?: SortOrderInput | SortOrder
    title?: SortOrderInput | SortOrder
    location?: SortOrderInput | SortOrder
    industry?: SortOrderInput | SortOrder
    description?: SortOrderInput | SortOrder
    source_type?: SortOrder
    raw_data?: SortOrderInput | SortOrder
    enrichment_data?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    raw_lead?: RawLeadOrderByWithRelationInput
    contacts?: ContactOrderByRelationAggregateInput
  }

  export type LeadWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    uuid?: string
    raw_lead_uuid?: string
    AND?: LeadWhereInput | LeadWhereInput[]
    OR?: LeadWhereInput[]
    NOT?: LeadWhereInput | LeadWhereInput[]
    name?: StringNullableFilter<"Lead"> | string | null
    email?: StringNullableFilter<"Lead"> | string | null
    phone?: StringNullableFilter<"Lead"> | string | null
    company?: StringNullableFilter<"Lead"> | string | null
    website?: StringNullableFilter<"Lead"> | string | null
    linkedin_url?: StringNullableFilter<"Lead"> | string | null
    title?: StringNullableFilter<"Lead"> | string | null
    location?: StringNullableFilter<"Lead"> | string | null
    industry?: StringNullableFilter<"Lead"> | string | null
    description?: StringNullableFilter<"Lead"> | string | null
    source_type?: EnumSourceTypeFilter<"Lead"> | $Enums.SourceType
    raw_data?: JsonNullableFilter<"Lead">
    enrichment_data?: JsonNullableFilter<"Lead">
    created_at?: DateTimeFilter<"Lead"> | Date | string
    updated_at?: DateTimeFilter<"Lead"> | Date | string
    raw_lead?: XOR<RawLeadNullableScalarRelationFilter, RawLeadWhereInput> | null
    contacts?: ContactListRelationFilter
  }, "id" | "uuid" | "raw_lead_uuid">

  export type LeadOrderByWithAggregationInput = {
    id?: SortOrder
    uuid?: SortOrder
    raw_lead_uuid?: SortOrderInput | SortOrder
    name?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    phone?: SortOrderInput | SortOrder
    company?: SortOrderInput | SortOrder
    website?: SortOrderInput | SortOrder
    linkedin_url?: SortOrderInput | SortOrder
    title?: SortOrderInput | SortOrder
    location?: SortOrderInput | SortOrder
    industry?: SortOrderInput | SortOrder
    description?: SortOrderInput | SortOrder
    source_type?: SortOrder
    raw_data?: SortOrderInput | SortOrder
    enrichment_data?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: LeadCountOrderByAggregateInput
    _avg?: LeadAvgOrderByAggregateInput
    _max?: LeadMaxOrderByAggregateInput
    _min?: LeadMinOrderByAggregateInput
    _sum?: LeadSumOrderByAggregateInput
  }

  export type LeadScalarWhereWithAggregatesInput = {
    AND?: LeadScalarWhereWithAggregatesInput | LeadScalarWhereWithAggregatesInput[]
    OR?: LeadScalarWhereWithAggregatesInput[]
    NOT?: LeadScalarWhereWithAggregatesInput | LeadScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Lead"> | number
    uuid?: StringWithAggregatesFilter<"Lead"> | string
    raw_lead_uuid?: StringNullableWithAggregatesFilter<"Lead"> | string | null
    name?: StringNullableWithAggregatesFilter<"Lead"> | string | null
    email?: StringNullableWithAggregatesFilter<"Lead"> | string | null
    phone?: StringNullableWithAggregatesFilter<"Lead"> | string | null
    company?: StringNullableWithAggregatesFilter<"Lead"> | string | null
    website?: StringNullableWithAggregatesFilter<"Lead"> | string | null
    linkedin_url?: StringNullableWithAggregatesFilter<"Lead"> | string | null
    title?: StringNullableWithAggregatesFilter<"Lead"> | string | null
    location?: StringNullableWithAggregatesFilter<"Lead"> | string | null
    industry?: StringNullableWithAggregatesFilter<"Lead"> | string | null
    description?: StringNullableWithAggregatesFilter<"Lead"> | string | null
    source_type?: EnumSourceTypeWithAggregatesFilter<"Lead"> | $Enums.SourceType
    raw_data?: JsonNullableWithAggregatesFilter<"Lead">
    enrichment_data?: JsonNullableWithAggregatesFilter<"Lead">
    created_at?: DateTimeWithAggregatesFilter<"Lead"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"Lead"> | Date | string
  }

  export type ContactWhereInput = {
    AND?: ContactWhereInput | ContactWhereInput[]
    OR?: ContactWhereInput[]
    NOT?: ContactWhereInput | ContactWhereInput[]
    id?: IntFilter<"Contact"> | number
    uuid?: StringFilter<"Contact"> | string
    user_uuid?: StringFilter<"Contact"> | string
    lead_uuid?: StringFilter<"Contact"> | string
    filter_uuid?: StringNullableFilter<"Contact"> | string | null
    status?: EnumLeadStatusFilter<"Contact"> | $Enums.LeadStatus
    score?: IntNullableFilter<"Contact"> | number | null
    notes?: StringNullableFilter<"Contact"> | string | null
    created_at?: DateTimeFilter<"Contact"> | Date | string
    updated_at?: DateTimeFilter<"Contact"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    lead?: XOR<LeadScalarRelationFilter, LeadWhereInput>
    filter?: XOR<FilterNullableScalarRelationFilter, FilterWhereInput> | null
    tags?: ContactTagListRelationFilter
    interactions?: InteractionListRelationFilter
    outreach_messages?: OutreachMessageListRelationFilter
  }

  export type ContactOrderByWithRelationInput = {
    id?: SortOrder
    uuid?: SortOrder
    user_uuid?: SortOrder
    lead_uuid?: SortOrder
    filter_uuid?: SortOrderInput | SortOrder
    status?: SortOrder
    score?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    user?: UserOrderByWithRelationInput
    lead?: LeadOrderByWithRelationInput
    filter?: FilterOrderByWithRelationInput
    tags?: ContactTagOrderByRelationAggregateInput
    interactions?: InteractionOrderByRelationAggregateInput
    outreach_messages?: OutreachMessageOrderByRelationAggregateInput
  }

  export type ContactWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    uuid?: string
    user_uuid_lead_uuid?: ContactUser_uuidLead_uuidCompoundUniqueInput
    AND?: ContactWhereInput | ContactWhereInput[]
    OR?: ContactWhereInput[]
    NOT?: ContactWhereInput | ContactWhereInput[]
    user_uuid?: StringFilter<"Contact"> | string
    lead_uuid?: StringFilter<"Contact"> | string
    filter_uuid?: StringNullableFilter<"Contact"> | string | null
    status?: EnumLeadStatusFilter<"Contact"> | $Enums.LeadStatus
    score?: IntNullableFilter<"Contact"> | number | null
    notes?: StringNullableFilter<"Contact"> | string | null
    created_at?: DateTimeFilter<"Contact"> | Date | string
    updated_at?: DateTimeFilter<"Contact"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    lead?: XOR<LeadScalarRelationFilter, LeadWhereInput>
    filter?: XOR<FilterNullableScalarRelationFilter, FilterWhereInput> | null
    tags?: ContactTagListRelationFilter
    interactions?: InteractionListRelationFilter
    outreach_messages?: OutreachMessageListRelationFilter
  }, "id" | "uuid" | "user_uuid_lead_uuid">

  export type ContactOrderByWithAggregationInput = {
    id?: SortOrder
    uuid?: SortOrder
    user_uuid?: SortOrder
    lead_uuid?: SortOrder
    filter_uuid?: SortOrderInput | SortOrder
    status?: SortOrder
    score?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: ContactCountOrderByAggregateInput
    _avg?: ContactAvgOrderByAggregateInput
    _max?: ContactMaxOrderByAggregateInput
    _min?: ContactMinOrderByAggregateInput
    _sum?: ContactSumOrderByAggregateInput
  }

  export type ContactScalarWhereWithAggregatesInput = {
    AND?: ContactScalarWhereWithAggregatesInput | ContactScalarWhereWithAggregatesInput[]
    OR?: ContactScalarWhereWithAggregatesInput[]
    NOT?: ContactScalarWhereWithAggregatesInput | ContactScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Contact"> | number
    uuid?: StringWithAggregatesFilter<"Contact"> | string
    user_uuid?: StringWithAggregatesFilter<"Contact"> | string
    lead_uuid?: StringWithAggregatesFilter<"Contact"> | string
    filter_uuid?: StringNullableWithAggregatesFilter<"Contact"> | string | null
    status?: EnumLeadStatusWithAggregatesFilter<"Contact"> | $Enums.LeadStatus
    score?: IntNullableWithAggregatesFilter<"Contact"> | number | null
    notes?: StringNullableWithAggregatesFilter<"Contact"> | string | null
    created_at?: DateTimeWithAggregatesFilter<"Contact"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"Contact"> | Date | string
  }

  export type ContactTagWhereInput = {
    AND?: ContactTagWhereInput | ContactTagWhereInput[]
    OR?: ContactTagWhereInput[]
    NOT?: ContactTagWhereInput | ContactTagWhereInput[]
    id?: IntFilter<"ContactTag"> | number
    contact_uuid?: StringFilter<"ContactTag"> | string
    tag?: StringFilter<"ContactTag"> | string
    created_at?: DateTimeFilter<"ContactTag"> | Date | string
    contact?: XOR<ContactScalarRelationFilter, ContactWhereInput>
  }

  export type ContactTagOrderByWithRelationInput = {
    id?: SortOrder
    contact_uuid?: SortOrder
    tag?: SortOrder
    created_at?: SortOrder
    contact?: ContactOrderByWithRelationInput
  }

  export type ContactTagWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    contact_uuid_tag?: ContactTagContact_uuidTagCompoundUniqueInput
    AND?: ContactTagWhereInput | ContactTagWhereInput[]
    OR?: ContactTagWhereInput[]
    NOT?: ContactTagWhereInput | ContactTagWhereInput[]
    contact_uuid?: StringFilter<"ContactTag"> | string
    tag?: StringFilter<"ContactTag"> | string
    created_at?: DateTimeFilter<"ContactTag"> | Date | string
    contact?: XOR<ContactScalarRelationFilter, ContactWhereInput>
  }, "id" | "contact_uuid_tag">

  export type ContactTagOrderByWithAggregationInput = {
    id?: SortOrder
    contact_uuid?: SortOrder
    tag?: SortOrder
    created_at?: SortOrder
    _count?: ContactTagCountOrderByAggregateInput
    _avg?: ContactTagAvgOrderByAggregateInput
    _max?: ContactTagMaxOrderByAggregateInput
    _min?: ContactTagMinOrderByAggregateInput
    _sum?: ContactTagSumOrderByAggregateInput
  }

  export type ContactTagScalarWhereWithAggregatesInput = {
    AND?: ContactTagScalarWhereWithAggregatesInput | ContactTagScalarWhereWithAggregatesInput[]
    OR?: ContactTagScalarWhereWithAggregatesInput[]
    NOT?: ContactTagScalarWhereWithAggregatesInput | ContactTagScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"ContactTag"> | number
    contact_uuid?: StringWithAggregatesFilter<"ContactTag"> | string
    tag?: StringWithAggregatesFilter<"ContactTag"> | string
    created_at?: DateTimeWithAggregatesFilter<"ContactTag"> | Date | string
  }

  export type InteractionWhereInput = {
    AND?: InteractionWhereInput | InteractionWhereInput[]
    OR?: InteractionWhereInput[]
    NOT?: InteractionWhereInput | InteractionWhereInput[]
    id?: IntFilter<"Interaction"> | number
    uuid?: StringFilter<"Interaction"> | string
    contact_uuid?: StringFilter<"Interaction"> | string
    user_uuid?: StringFilter<"Interaction"> | string
    type?: EnumInteractionTypeFilter<"Interaction"> | $Enums.InteractionType
    content?: StringNullableFilter<"Interaction"> | string | null
    metadata?: JsonNullableFilter<"Interaction">
    created_at?: DateTimeFilter<"Interaction"> | Date | string
    updated_at?: DateTimeFilter<"Interaction"> | Date | string
    contact?: XOR<ContactScalarRelationFilter, ContactWhereInput>
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type InteractionOrderByWithRelationInput = {
    id?: SortOrder
    uuid?: SortOrder
    contact_uuid?: SortOrder
    user_uuid?: SortOrder
    type?: SortOrder
    content?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    contact?: ContactOrderByWithRelationInput
    user?: UserOrderByWithRelationInput
  }

  export type InteractionWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    uuid?: string
    AND?: InteractionWhereInput | InteractionWhereInput[]
    OR?: InteractionWhereInput[]
    NOT?: InteractionWhereInput | InteractionWhereInput[]
    contact_uuid?: StringFilter<"Interaction"> | string
    user_uuid?: StringFilter<"Interaction"> | string
    type?: EnumInteractionTypeFilter<"Interaction"> | $Enums.InteractionType
    content?: StringNullableFilter<"Interaction"> | string | null
    metadata?: JsonNullableFilter<"Interaction">
    created_at?: DateTimeFilter<"Interaction"> | Date | string
    updated_at?: DateTimeFilter<"Interaction"> | Date | string
    contact?: XOR<ContactScalarRelationFilter, ContactWhereInput>
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "uuid">

  export type InteractionOrderByWithAggregationInput = {
    id?: SortOrder
    uuid?: SortOrder
    contact_uuid?: SortOrder
    user_uuid?: SortOrder
    type?: SortOrder
    content?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: InteractionCountOrderByAggregateInput
    _avg?: InteractionAvgOrderByAggregateInput
    _max?: InteractionMaxOrderByAggregateInput
    _min?: InteractionMinOrderByAggregateInput
    _sum?: InteractionSumOrderByAggregateInput
  }

  export type InteractionScalarWhereWithAggregatesInput = {
    AND?: InteractionScalarWhereWithAggregatesInput | InteractionScalarWhereWithAggregatesInput[]
    OR?: InteractionScalarWhereWithAggregatesInput[]
    NOT?: InteractionScalarWhereWithAggregatesInput | InteractionScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Interaction"> | number
    uuid?: StringWithAggregatesFilter<"Interaction"> | string
    contact_uuid?: StringWithAggregatesFilter<"Interaction"> | string
    user_uuid?: StringWithAggregatesFilter<"Interaction"> | string
    type?: EnumInteractionTypeWithAggregatesFilter<"Interaction"> | $Enums.InteractionType
    content?: StringNullableWithAggregatesFilter<"Interaction"> | string | null
    metadata?: JsonNullableWithAggregatesFilter<"Interaction">
    created_at?: DateTimeWithAggregatesFilter<"Interaction"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"Interaction"> | Date | string
  }

  export type OutreachMessageWhereInput = {
    AND?: OutreachMessageWhereInput | OutreachMessageWhereInput[]
    OR?: OutreachMessageWhereInput[]
    NOT?: OutreachMessageWhereInput | OutreachMessageWhereInput[]
    id?: IntFilter<"OutreachMessage"> | number
    uuid?: StringFilter<"OutreachMessage"> | string
    user_uuid?: StringFilter<"OutreachMessage"> | string
    contact_uuid?: StringFilter<"OutreachMessage"> | string
    channel?: EnumChannelFilter<"OutreachMessage"> | $Enums.Channel
    subject?: StringNullableFilter<"OutreachMessage"> | string | null
    content?: StringFilter<"OutreachMessage"> | string
    status?: EnumMsgStatusFilter<"OutreachMessage"> | $Enums.MsgStatus
    scheduled_at?: DateTimeNullableFilter<"OutreachMessage"> | Date | string | null
    sent_at?: DateTimeNullableFilter<"OutreachMessage"> | Date | string | null
    metadata?: JsonNullableFilter<"OutreachMessage">
    created_at?: DateTimeFilter<"OutreachMessage"> | Date | string
    updated_at?: DateTimeFilter<"OutreachMessage"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    contact?: XOR<ContactScalarRelationFilter, ContactWhereInput>
  }

  export type OutreachMessageOrderByWithRelationInput = {
    id?: SortOrder
    uuid?: SortOrder
    user_uuid?: SortOrder
    contact_uuid?: SortOrder
    channel?: SortOrder
    subject?: SortOrderInput | SortOrder
    content?: SortOrder
    status?: SortOrder
    scheduled_at?: SortOrderInput | SortOrder
    sent_at?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    user?: UserOrderByWithRelationInput
    contact?: ContactOrderByWithRelationInput
  }

  export type OutreachMessageWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    uuid?: string
    AND?: OutreachMessageWhereInput | OutreachMessageWhereInput[]
    OR?: OutreachMessageWhereInput[]
    NOT?: OutreachMessageWhereInput | OutreachMessageWhereInput[]
    user_uuid?: StringFilter<"OutreachMessage"> | string
    contact_uuid?: StringFilter<"OutreachMessage"> | string
    channel?: EnumChannelFilter<"OutreachMessage"> | $Enums.Channel
    subject?: StringNullableFilter<"OutreachMessage"> | string | null
    content?: StringFilter<"OutreachMessage"> | string
    status?: EnumMsgStatusFilter<"OutreachMessage"> | $Enums.MsgStatus
    scheduled_at?: DateTimeNullableFilter<"OutreachMessage"> | Date | string | null
    sent_at?: DateTimeNullableFilter<"OutreachMessage"> | Date | string | null
    metadata?: JsonNullableFilter<"OutreachMessage">
    created_at?: DateTimeFilter<"OutreachMessage"> | Date | string
    updated_at?: DateTimeFilter<"OutreachMessage"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    contact?: XOR<ContactScalarRelationFilter, ContactWhereInput>
  }, "id" | "uuid">

  export type OutreachMessageOrderByWithAggregationInput = {
    id?: SortOrder
    uuid?: SortOrder
    user_uuid?: SortOrder
    contact_uuid?: SortOrder
    channel?: SortOrder
    subject?: SortOrderInput | SortOrder
    content?: SortOrder
    status?: SortOrder
    scheduled_at?: SortOrderInput | SortOrder
    sent_at?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: OutreachMessageCountOrderByAggregateInput
    _avg?: OutreachMessageAvgOrderByAggregateInput
    _max?: OutreachMessageMaxOrderByAggregateInput
    _min?: OutreachMessageMinOrderByAggregateInput
    _sum?: OutreachMessageSumOrderByAggregateInput
  }

  export type OutreachMessageScalarWhereWithAggregatesInput = {
    AND?: OutreachMessageScalarWhereWithAggregatesInput | OutreachMessageScalarWhereWithAggregatesInput[]
    OR?: OutreachMessageScalarWhereWithAggregatesInput[]
    NOT?: OutreachMessageScalarWhereWithAggregatesInput | OutreachMessageScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"OutreachMessage"> | number
    uuid?: StringWithAggregatesFilter<"OutreachMessage"> | string
    user_uuid?: StringWithAggregatesFilter<"OutreachMessage"> | string
    contact_uuid?: StringWithAggregatesFilter<"OutreachMessage"> | string
    channel?: EnumChannelWithAggregatesFilter<"OutreachMessage"> | $Enums.Channel
    subject?: StringNullableWithAggregatesFilter<"OutreachMessage"> | string | null
    content?: StringWithAggregatesFilter<"OutreachMessage"> | string
    status?: EnumMsgStatusWithAggregatesFilter<"OutreachMessage"> | $Enums.MsgStatus
    scheduled_at?: DateTimeNullableWithAggregatesFilter<"OutreachMessage"> | Date | string | null
    sent_at?: DateTimeNullableWithAggregatesFilter<"OutreachMessage"> | Date | string | null
    metadata?: JsonNullableWithAggregatesFilter<"OutreachMessage">
    created_at?: DateTimeWithAggregatesFilter<"OutreachMessage"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"OutreachMessage"> | Date | string
  }

  export type OutreachSequenceWhereInput = {
    AND?: OutreachSequenceWhereInput | OutreachSequenceWhereInput[]
    OR?: OutreachSequenceWhereInput[]
    NOT?: OutreachSequenceWhereInput | OutreachSequenceWhereInput[]
    id?: IntFilter<"OutreachSequence"> | number
    uuid?: StringFilter<"OutreachSequence"> | string
    user_uuid?: StringFilter<"OutreachSequence"> | string
    name?: StringFilter<"OutreachSequence"> | string
    steps?: JsonFilter<"OutreachSequence">
    created_at?: DateTimeFilter<"OutreachSequence"> | Date | string
    updated_at?: DateTimeFilter<"OutreachSequence"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type OutreachSequenceOrderByWithRelationInput = {
    id?: SortOrder
    uuid?: SortOrder
    user_uuid?: SortOrder
    name?: SortOrder
    steps?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type OutreachSequenceWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    uuid?: string
    AND?: OutreachSequenceWhereInput | OutreachSequenceWhereInput[]
    OR?: OutreachSequenceWhereInput[]
    NOT?: OutreachSequenceWhereInput | OutreachSequenceWhereInput[]
    user_uuid?: StringFilter<"OutreachSequence"> | string
    name?: StringFilter<"OutreachSequence"> | string
    steps?: JsonFilter<"OutreachSequence">
    created_at?: DateTimeFilter<"OutreachSequence"> | Date | string
    updated_at?: DateTimeFilter<"OutreachSequence"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "uuid">

  export type OutreachSequenceOrderByWithAggregationInput = {
    id?: SortOrder
    uuid?: SortOrder
    user_uuid?: SortOrder
    name?: SortOrder
    steps?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: OutreachSequenceCountOrderByAggregateInput
    _avg?: OutreachSequenceAvgOrderByAggregateInput
    _max?: OutreachSequenceMaxOrderByAggregateInput
    _min?: OutreachSequenceMinOrderByAggregateInput
    _sum?: OutreachSequenceSumOrderByAggregateInput
  }

  export type OutreachSequenceScalarWhereWithAggregatesInput = {
    AND?: OutreachSequenceScalarWhereWithAggregatesInput | OutreachSequenceScalarWhereWithAggregatesInput[]
    OR?: OutreachSequenceScalarWhereWithAggregatesInput[]
    NOT?: OutreachSequenceScalarWhereWithAggregatesInput | OutreachSequenceScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"OutreachSequence"> | number
    uuid?: StringWithAggregatesFilter<"OutreachSequence"> | string
    user_uuid?: StringWithAggregatesFilter<"OutreachSequence"> | string
    name?: StringWithAggregatesFilter<"OutreachSequence"> | string
    steps?: JsonWithAggregatesFilter<"OutreachSequence">
    created_at?: DateTimeWithAggregatesFilter<"OutreachSequence"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"OutreachSequence"> | Date | string
  }

  export type FilterJobWhereInput = {
    AND?: FilterJobWhereInput | FilterJobWhereInput[]
    OR?: FilterJobWhereInput[]
    NOT?: FilterJobWhereInput | FilterJobWhereInput[]
    id?: IntFilter<"FilterJob"> | number
    uuid?: StringFilter<"FilterJob"> | string
    filter_uuid?: StringFilter<"FilterJob"> | string
    status?: EnumJobStatusFilter<"FilterJob"> | $Enums.JobStatus
    leads_found?: IntFilter<"FilterJob"> | number
    duration?: IntFilter<"FilterJob"> | number
    error?: StringNullableFilter<"FilterJob"> | string | null
    started_at?: DateTimeFilter<"FilterJob"> | Date | string
    completed_at?: DateTimeNullableFilter<"FilterJob"> | Date | string | null
    created_at?: DateTimeFilter<"FilterJob"> | Date | string
    updated_at?: DateTimeFilter<"FilterJob"> | Date | string
    filter?: XOR<FilterScalarRelationFilter, FilterWhereInput>
  }

  export type FilterJobOrderByWithRelationInput = {
    id?: SortOrder
    uuid?: SortOrder
    filter_uuid?: SortOrder
    status?: SortOrder
    leads_found?: SortOrder
    duration?: SortOrder
    error?: SortOrderInput | SortOrder
    started_at?: SortOrder
    completed_at?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    filter?: FilterOrderByWithRelationInput
  }

  export type FilterJobWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    uuid?: string
    AND?: FilterJobWhereInput | FilterJobWhereInput[]
    OR?: FilterJobWhereInput[]
    NOT?: FilterJobWhereInput | FilterJobWhereInput[]
    filter_uuid?: StringFilter<"FilterJob"> | string
    status?: EnumJobStatusFilter<"FilterJob"> | $Enums.JobStatus
    leads_found?: IntFilter<"FilterJob"> | number
    duration?: IntFilter<"FilterJob"> | number
    error?: StringNullableFilter<"FilterJob"> | string | null
    started_at?: DateTimeFilter<"FilterJob"> | Date | string
    completed_at?: DateTimeNullableFilter<"FilterJob"> | Date | string | null
    created_at?: DateTimeFilter<"FilterJob"> | Date | string
    updated_at?: DateTimeFilter<"FilterJob"> | Date | string
    filter?: XOR<FilterScalarRelationFilter, FilterWhereInput>
  }, "id" | "uuid">

  export type FilterJobOrderByWithAggregationInput = {
    id?: SortOrder
    uuid?: SortOrder
    filter_uuid?: SortOrder
    status?: SortOrder
    leads_found?: SortOrder
    duration?: SortOrder
    error?: SortOrderInput | SortOrder
    started_at?: SortOrder
    completed_at?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: FilterJobCountOrderByAggregateInput
    _avg?: FilterJobAvgOrderByAggregateInput
    _max?: FilterJobMaxOrderByAggregateInput
    _min?: FilterJobMinOrderByAggregateInput
    _sum?: FilterJobSumOrderByAggregateInput
  }

  export type FilterJobScalarWhereWithAggregatesInput = {
    AND?: FilterJobScalarWhereWithAggregatesInput | FilterJobScalarWhereWithAggregatesInput[]
    OR?: FilterJobScalarWhereWithAggregatesInput[]
    NOT?: FilterJobScalarWhereWithAggregatesInput | FilterJobScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"FilterJob"> | number
    uuid?: StringWithAggregatesFilter<"FilterJob"> | string
    filter_uuid?: StringWithAggregatesFilter<"FilterJob"> | string
    status?: EnumJobStatusWithAggregatesFilter<"FilterJob"> | $Enums.JobStatus
    leads_found?: IntWithAggregatesFilter<"FilterJob"> | number
    duration?: IntWithAggregatesFilter<"FilterJob"> | number
    error?: StringNullableWithAggregatesFilter<"FilterJob"> | string | null
    started_at?: DateTimeWithAggregatesFilter<"FilterJob"> | Date | string
    completed_at?: DateTimeNullableWithAggregatesFilter<"FilterJob"> | Date | string | null
    created_at?: DateTimeWithAggregatesFilter<"FilterJob"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"FilterJob"> | Date | string
  }

  export type UserCreateInput = {
    uuid?: string
    email: string
    phone?: string | null
    password: string
    role?: $Enums.AuthRole
    created_at?: Date | string
    updated_at?: Date | string
    filters?: FilterCreateNestedManyWithoutUserInput
    contacts?: ContactCreateNestedManyWithoutUserInput
    outreach_messages?: OutreachMessageCreateNestedManyWithoutUserInput
    outreach_sequences?: OutreachSequenceCreateNestedManyWithoutUserInput
    interactions?: InteractionCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: number
    uuid?: string
    email: string
    phone?: string | null
    password: string
    role?: $Enums.AuthRole
    created_at?: Date | string
    updated_at?: Date | string
    filters?: FilterUncheckedCreateNestedManyWithoutUserInput
    contacts?: ContactUncheckedCreateNestedManyWithoutUserInput
    outreach_messages?: OutreachMessageUncheckedCreateNestedManyWithoutUserInput
    outreach_sequences?: OutreachSequenceUncheckedCreateNestedManyWithoutUserInput
    interactions?: InteractionUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    uuid?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumAuthRoleFieldUpdateOperationsInput | $Enums.AuthRole
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    filters?: FilterUpdateManyWithoutUserNestedInput
    contacts?: ContactUpdateManyWithoutUserNestedInput
    outreach_messages?: OutreachMessageUpdateManyWithoutUserNestedInput
    outreach_sequences?: OutreachSequenceUpdateManyWithoutUserNestedInput
    interactions?: InteractionUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumAuthRoleFieldUpdateOperationsInput | $Enums.AuthRole
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    filters?: FilterUncheckedUpdateManyWithoutUserNestedInput
    contacts?: ContactUncheckedUpdateManyWithoutUserNestedInput
    outreach_messages?: OutreachMessageUncheckedUpdateManyWithoutUserNestedInput
    outreach_sequences?: OutreachSequenceUncheckedUpdateManyWithoutUserNestedInput
    interactions?: InteractionUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: number
    uuid?: string
    email: string
    phone?: string | null
    password: string
    role?: $Enums.AuthRole
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    uuid?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumAuthRoleFieldUpdateOperationsInput | $Enums.AuthRole
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumAuthRoleFieldUpdateOperationsInput | $Enums.AuthRole
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FilterCreateInput = {
    uuid?: string
    name: string
    source_type: $Enums.SourceType
    query_config: JsonNullValueInput | InputJsonValue
    enabled?: boolean
    cron_schedule?: string | null
    channels?: FilterCreatechannelsInput | $Enums.Channel[]
    ai_instructions?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    user: UserCreateNestedOneWithoutFiltersInput
    raw_leads?: RawLeadCreateNestedManyWithoutFilterInput
    contacts?: ContactCreateNestedManyWithoutFilterInput
    jobs?: FilterJobCreateNestedManyWithoutFilterInput
  }

  export type FilterUncheckedCreateInput = {
    id?: number
    uuid?: string
    user_uuid: string
    name: string
    source_type: $Enums.SourceType
    query_config: JsonNullValueInput | InputJsonValue
    enabled?: boolean
    cron_schedule?: string | null
    channels?: FilterCreatechannelsInput | $Enums.Channel[]
    ai_instructions?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    raw_leads?: RawLeadUncheckedCreateNestedManyWithoutFilterInput
    contacts?: ContactUncheckedCreateNestedManyWithoutFilterInput
    jobs?: FilterJobUncheckedCreateNestedManyWithoutFilterInput
  }

  export type FilterUpdateInput = {
    uuid?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    source_type?: EnumSourceTypeFieldUpdateOperationsInput | $Enums.SourceType
    query_config?: JsonNullValueInput | InputJsonValue
    enabled?: BoolFieldUpdateOperationsInput | boolean
    cron_schedule?: NullableStringFieldUpdateOperationsInput | string | null
    channels?: FilterUpdatechannelsInput | $Enums.Channel[]
    ai_instructions?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutFiltersNestedInput
    raw_leads?: RawLeadUpdateManyWithoutFilterNestedInput
    contacts?: ContactUpdateManyWithoutFilterNestedInput
    jobs?: FilterJobUpdateManyWithoutFilterNestedInput
  }

  export type FilterUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    user_uuid?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    source_type?: EnumSourceTypeFieldUpdateOperationsInput | $Enums.SourceType
    query_config?: JsonNullValueInput | InputJsonValue
    enabled?: BoolFieldUpdateOperationsInput | boolean
    cron_schedule?: NullableStringFieldUpdateOperationsInput | string | null
    channels?: FilterUpdatechannelsInput | $Enums.Channel[]
    ai_instructions?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    raw_leads?: RawLeadUncheckedUpdateManyWithoutFilterNestedInput
    contacts?: ContactUncheckedUpdateManyWithoutFilterNestedInput
    jobs?: FilterJobUncheckedUpdateManyWithoutFilterNestedInput
  }

  export type FilterCreateManyInput = {
    id?: number
    uuid?: string
    user_uuid: string
    name: string
    source_type: $Enums.SourceType
    query_config: JsonNullValueInput | InputJsonValue
    enabled?: boolean
    cron_schedule?: string | null
    channels?: FilterCreatechannelsInput | $Enums.Channel[]
    ai_instructions?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type FilterUpdateManyMutationInput = {
    uuid?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    source_type?: EnumSourceTypeFieldUpdateOperationsInput | $Enums.SourceType
    query_config?: JsonNullValueInput | InputJsonValue
    enabled?: BoolFieldUpdateOperationsInput | boolean
    cron_schedule?: NullableStringFieldUpdateOperationsInput | string | null
    channels?: FilterUpdatechannelsInput | $Enums.Channel[]
    ai_instructions?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FilterUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    user_uuid?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    source_type?: EnumSourceTypeFieldUpdateOperationsInput | $Enums.SourceType
    query_config?: JsonNullValueInput | InputJsonValue
    enabled?: BoolFieldUpdateOperationsInput | boolean
    cron_schedule?: NullableStringFieldUpdateOperationsInput | string | null
    channels?: FilterUpdatechannelsInput | $Enums.Channel[]
    ai_instructions?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RawLeadCreateInput = {
    uuid?: string
    source_type: $Enums.SourceType
    raw_data: JsonNullValueInput | InputJsonValue
    processed_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
    filter: FilterCreateNestedOneWithoutRaw_leadsInput
    lead?: LeadCreateNestedOneWithoutRaw_leadInput
  }

  export type RawLeadUncheckedCreateInput = {
    id?: number
    uuid?: string
    filter_uuid: string
    source_type: $Enums.SourceType
    raw_data: JsonNullValueInput | InputJsonValue
    processed_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
    lead?: LeadUncheckedCreateNestedOneWithoutRaw_leadInput
  }

  export type RawLeadUpdateInput = {
    uuid?: StringFieldUpdateOperationsInput | string
    source_type?: EnumSourceTypeFieldUpdateOperationsInput | $Enums.SourceType
    raw_data?: JsonNullValueInput | InputJsonValue
    processed_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    filter?: FilterUpdateOneRequiredWithoutRaw_leadsNestedInput
    lead?: LeadUpdateOneWithoutRaw_leadNestedInput
  }

  export type RawLeadUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    filter_uuid?: StringFieldUpdateOperationsInput | string
    source_type?: EnumSourceTypeFieldUpdateOperationsInput | $Enums.SourceType
    raw_data?: JsonNullValueInput | InputJsonValue
    processed_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    lead?: LeadUncheckedUpdateOneWithoutRaw_leadNestedInput
  }

  export type RawLeadCreateManyInput = {
    id?: number
    uuid?: string
    filter_uuid: string
    source_type: $Enums.SourceType
    raw_data: JsonNullValueInput | InputJsonValue
    processed_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type RawLeadUpdateManyMutationInput = {
    uuid?: StringFieldUpdateOperationsInput | string
    source_type?: EnumSourceTypeFieldUpdateOperationsInput | $Enums.SourceType
    raw_data?: JsonNullValueInput | InputJsonValue
    processed_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RawLeadUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    filter_uuid?: StringFieldUpdateOperationsInput | string
    source_type?: EnumSourceTypeFieldUpdateOperationsInput | $Enums.SourceType
    raw_data?: JsonNullValueInput | InputJsonValue
    processed_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LeadCreateInput = {
    uuid?: string
    name?: string | null
    email?: string | null
    phone?: string | null
    company?: string | null
    website?: string | null
    linkedin_url?: string | null
    title?: string | null
    location?: string | null
    industry?: string | null
    description?: string | null
    source_type: $Enums.SourceType
    raw_data?: NullableJsonNullValueInput | InputJsonValue
    enrichment_data?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
    raw_lead?: RawLeadCreateNestedOneWithoutLeadInput
    contacts?: ContactCreateNestedManyWithoutLeadInput
  }

  export type LeadUncheckedCreateInput = {
    id?: number
    uuid?: string
    raw_lead_uuid?: string | null
    name?: string | null
    email?: string | null
    phone?: string | null
    company?: string | null
    website?: string | null
    linkedin_url?: string | null
    title?: string | null
    location?: string | null
    industry?: string | null
    description?: string | null
    source_type: $Enums.SourceType
    raw_data?: NullableJsonNullValueInput | InputJsonValue
    enrichment_data?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
    contacts?: ContactUncheckedCreateNestedManyWithoutLeadInput
  }

  export type LeadUpdateInput = {
    uuid?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    company?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    linkedin_url?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    industry?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    source_type?: EnumSourceTypeFieldUpdateOperationsInput | $Enums.SourceType
    raw_data?: NullableJsonNullValueInput | InputJsonValue
    enrichment_data?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    raw_lead?: RawLeadUpdateOneWithoutLeadNestedInput
    contacts?: ContactUpdateManyWithoutLeadNestedInput
  }

  export type LeadUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    raw_lead_uuid?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    company?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    linkedin_url?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    industry?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    source_type?: EnumSourceTypeFieldUpdateOperationsInput | $Enums.SourceType
    raw_data?: NullableJsonNullValueInput | InputJsonValue
    enrichment_data?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    contacts?: ContactUncheckedUpdateManyWithoutLeadNestedInput
  }

  export type LeadCreateManyInput = {
    id?: number
    uuid?: string
    raw_lead_uuid?: string | null
    name?: string | null
    email?: string | null
    phone?: string | null
    company?: string | null
    website?: string | null
    linkedin_url?: string | null
    title?: string | null
    location?: string | null
    industry?: string | null
    description?: string | null
    source_type: $Enums.SourceType
    raw_data?: NullableJsonNullValueInput | InputJsonValue
    enrichment_data?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type LeadUpdateManyMutationInput = {
    uuid?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    company?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    linkedin_url?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    industry?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    source_type?: EnumSourceTypeFieldUpdateOperationsInput | $Enums.SourceType
    raw_data?: NullableJsonNullValueInput | InputJsonValue
    enrichment_data?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LeadUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    raw_lead_uuid?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    company?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    linkedin_url?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    industry?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    source_type?: EnumSourceTypeFieldUpdateOperationsInput | $Enums.SourceType
    raw_data?: NullableJsonNullValueInput | InputJsonValue
    enrichment_data?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ContactCreateInput = {
    uuid?: string
    status?: $Enums.LeadStatus
    score?: number | null
    notes?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    user: UserCreateNestedOneWithoutContactsInput
    lead: LeadCreateNestedOneWithoutContactsInput
    filter?: FilterCreateNestedOneWithoutContactsInput
    tags?: ContactTagCreateNestedManyWithoutContactInput
    interactions?: InteractionCreateNestedManyWithoutContactInput
    outreach_messages?: OutreachMessageCreateNestedManyWithoutContactInput
  }

  export type ContactUncheckedCreateInput = {
    id?: number
    uuid?: string
    user_uuid: string
    lead_uuid: string
    filter_uuid?: string | null
    status?: $Enums.LeadStatus
    score?: number | null
    notes?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    tags?: ContactTagUncheckedCreateNestedManyWithoutContactInput
    interactions?: InteractionUncheckedCreateNestedManyWithoutContactInput
    outreach_messages?: OutreachMessageUncheckedCreateNestedManyWithoutContactInput
  }

  export type ContactUpdateInput = {
    uuid?: StringFieldUpdateOperationsInput | string
    status?: EnumLeadStatusFieldUpdateOperationsInput | $Enums.LeadStatus
    score?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutContactsNestedInput
    lead?: LeadUpdateOneRequiredWithoutContactsNestedInput
    filter?: FilterUpdateOneWithoutContactsNestedInput
    tags?: ContactTagUpdateManyWithoutContactNestedInput
    interactions?: InteractionUpdateManyWithoutContactNestedInput
    outreach_messages?: OutreachMessageUpdateManyWithoutContactNestedInput
  }

  export type ContactUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    user_uuid?: StringFieldUpdateOperationsInput | string
    lead_uuid?: StringFieldUpdateOperationsInput | string
    filter_uuid?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumLeadStatusFieldUpdateOperationsInput | $Enums.LeadStatus
    score?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tags?: ContactTagUncheckedUpdateManyWithoutContactNestedInput
    interactions?: InteractionUncheckedUpdateManyWithoutContactNestedInput
    outreach_messages?: OutreachMessageUncheckedUpdateManyWithoutContactNestedInput
  }

  export type ContactCreateManyInput = {
    id?: number
    uuid?: string
    user_uuid: string
    lead_uuid: string
    filter_uuid?: string | null
    status?: $Enums.LeadStatus
    score?: number | null
    notes?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ContactUpdateManyMutationInput = {
    uuid?: StringFieldUpdateOperationsInput | string
    status?: EnumLeadStatusFieldUpdateOperationsInput | $Enums.LeadStatus
    score?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ContactUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    user_uuid?: StringFieldUpdateOperationsInput | string
    lead_uuid?: StringFieldUpdateOperationsInput | string
    filter_uuid?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumLeadStatusFieldUpdateOperationsInput | $Enums.LeadStatus
    score?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ContactTagCreateInput = {
    tag: string
    created_at?: Date | string
    contact: ContactCreateNestedOneWithoutTagsInput
  }

  export type ContactTagUncheckedCreateInput = {
    id?: number
    contact_uuid: string
    tag: string
    created_at?: Date | string
  }

  export type ContactTagUpdateInput = {
    tag?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    contact?: ContactUpdateOneRequiredWithoutTagsNestedInput
  }

  export type ContactTagUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    contact_uuid?: StringFieldUpdateOperationsInput | string
    tag?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ContactTagCreateManyInput = {
    id?: number
    contact_uuid: string
    tag: string
    created_at?: Date | string
  }

  export type ContactTagUpdateManyMutationInput = {
    tag?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ContactTagUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    contact_uuid?: StringFieldUpdateOperationsInput | string
    tag?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InteractionCreateInput = {
    uuid?: string
    type: $Enums.InteractionType
    content?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
    contact: ContactCreateNestedOneWithoutInteractionsInput
    user: UserCreateNestedOneWithoutInteractionsInput
  }

  export type InteractionUncheckedCreateInput = {
    id?: number
    uuid?: string
    contact_uuid: string
    user_uuid: string
    type: $Enums.InteractionType
    content?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type InteractionUpdateInput = {
    uuid?: StringFieldUpdateOperationsInput | string
    type?: EnumInteractionTypeFieldUpdateOperationsInput | $Enums.InteractionType
    content?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    contact?: ContactUpdateOneRequiredWithoutInteractionsNestedInput
    user?: UserUpdateOneRequiredWithoutInteractionsNestedInput
  }

  export type InteractionUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    contact_uuid?: StringFieldUpdateOperationsInput | string
    user_uuid?: StringFieldUpdateOperationsInput | string
    type?: EnumInteractionTypeFieldUpdateOperationsInput | $Enums.InteractionType
    content?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InteractionCreateManyInput = {
    id?: number
    uuid?: string
    contact_uuid: string
    user_uuid: string
    type: $Enums.InteractionType
    content?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type InteractionUpdateManyMutationInput = {
    uuid?: StringFieldUpdateOperationsInput | string
    type?: EnumInteractionTypeFieldUpdateOperationsInput | $Enums.InteractionType
    content?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InteractionUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    contact_uuid?: StringFieldUpdateOperationsInput | string
    user_uuid?: StringFieldUpdateOperationsInput | string
    type?: EnumInteractionTypeFieldUpdateOperationsInput | $Enums.InteractionType
    content?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OutreachMessageCreateInput = {
    uuid?: string
    channel: $Enums.Channel
    subject?: string | null
    content: string
    status?: $Enums.MsgStatus
    scheduled_at?: Date | string | null
    sent_at?: Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
    user: UserCreateNestedOneWithoutOutreach_messagesInput
    contact: ContactCreateNestedOneWithoutOutreach_messagesInput
  }

  export type OutreachMessageUncheckedCreateInput = {
    id?: number
    uuid?: string
    user_uuid: string
    contact_uuid: string
    channel: $Enums.Channel
    subject?: string | null
    content: string
    status?: $Enums.MsgStatus
    scheduled_at?: Date | string | null
    sent_at?: Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type OutreachMessageUpdateInput = {
    uuid?: StringFieldUpdateOperationsInput | string
    channel?: EnumChannelFieldUpdateOperationsInput | $Enums.Channel
    subject?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    status?: EnumMsgStatusFieldUpdateOperationsInput | $Enums.MsgStatus
    scheduled_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sent_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutOutreach_messagesNestedInput
    contact?: ContactUpdateOneRequiredWithoutOutreach_messagesNestedInput
  }

  export type OutreachMessageUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    user_uuid?: StringFieldUpdateOperationsInput | string
    contact_uuid?: StringFieldUpdateOperationsInput | string
    channel?: EnumChannelFieldUpdateOperationsInput | $Enums.Channel
    subject?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    status?: EnumMsgStatusFieldUpdateOperationsInput | $Enums.MsgStatus
    scheduled_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sent_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OutreachMessageCreateManyInput = {
    id?: number
    uuid?: string
    user_uuid: string
    contact_uuid: string
    channel: $Enums.Channel
    subject?: string | null
    content: string
    status?: $Enums.MsgStatus
    scheduled_at?: Date | string | null
    sent_at?: Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type OutreachMessageUpdateManyMutationInput = {
    uuid?: StringFieldUpdateOperationsInput | string
    channel?: EnumChannelFieldUpdateOperationsInput | $Enums.Channel
    subject?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    status?: EnumMsgStatusFieldUpdateOperationsInput | $Enums.MsgStatus
    scheduled_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sent_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OutreachMessageUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    user_uuid?: StringFieldUpdateOperationsInput | string
    contact_uuid?: StringFieldUpdateOperationsInput | string
    channel?: EnumChannelFieldUpdateOperationsInput | $Enums.Channel
    subject?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    status?: EnumMsgStatusFieldUpdateOperationsInput | $Enums.MsgStatus
    scheduled_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sent_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OutreachSequenceCreateInput = {
    uuid?: string
    name: string
    steps: JsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
    user: UserCreateNestedOneWithoutOutreach_sequencesInput
  }

  export type OutreachSequenceUncheckedCreateInput = {
    id?: number
    uuid?: string
    user_uuid: string
    name: string
    steps: JsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type OutreachSequenceUpdateInput = {
    uuid?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    steps?: JsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutOutreach_sequencesNestedInput
  }

  export type OutreachSequenceUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    user_uuid?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    steps?: JsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OutreachSequenceCreateManyInput = {
    id?: number
    uuid?: string
    user_uuid: string
    name: string
    steps: JsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type OutreachSequenceUpdateManyMutationInput = {
    uuid?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    steps?: JsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OutreachSequenceUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    user_uuid?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    steps?: JsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FilterJobCreateInput = {
    uuid?: string
    status?: $Enums.JobStatus
    leads_found?: number
    duration?: number
    error?: string | null
    started_at?: Date | string
    completed_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
    filter: FilterCreateNestedOneWithoutJobsInput
  }

  export type FilterJobUncheckedCreateInput = {
    id?: number
    uuid?: string
    filter_uuid: string
    status?: $Enums.JobStatus
    leads_found?: number
    duration?: number
    error?: string | null
    started_at?: Date | string
    completed_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type FilterJobUpdateInput = {
    uuid?: StringFieldUpdateOperationsInput | string
    status?: EnumJobStatusFieldUpdateOperationsInput | $Enums.JobStatus
    leads_found?: IntFieldUpdateOperationsInput | number
    duration?: IntFieldUpdateOperationsInput | number
    error?: NullableStringFieldUpdateOperationsInput | string | null
    started_at?: DateTimeFieldUpdateOperationsInput | Date | string
    completed_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    filter?: FilterUpdateOneRequiredWithoutJobsNestedInput
  }

  export type FilterJobUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    filter_uuid?: StringFieldUpdateOperationsInput | string
    status?: EnumJobStatusFieldUpdateOperationsInput | $Enums.JobStatus
    leads_found?: IntFieldUpdateOperationsInput | number
    duration?: IntFieldUpdateOperationsInput | number
    error?: NullableStringFieldUpdateOperationsInput | string | null
    started_at?: DateTimeFieldUpdateOperationsInput | Date | string
    completed_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FilterJobCreateManyInput = {
    id?: number
    uuid?: string
    filter_uuid: string
    status?: $Enums.JobStatus
    leads_found?: number
    duration?: number
    error?: string | null
    started_at?: Date | string
    completed_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type FilterJobUpdateManyMutationInput = {
    uuid?: StringFieldUpdateOperationsInput | string
    status?: EnumJobStatusFieldUpdateOperationsInput | $Enums.JobStatus
    leads_found?: IntFieldUpdateOperationsInput | number
    duration?: IntFieldUpdateOperationsInput | number
    error?: NullableStringFieldUpdateOperationsInput | string | null
    started_at?: DateTimeFieldUpdateOperationsInput | Date | string
    completed_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FilterJobUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    filter_uuid?: StringFieldUpdateOperationsInput | string
    status?: EnumJobStatusFieldUpdateOperationsInput | $Enums.JobStatus
    leads_found?: IntFieldUpdateOperationsInput | number
    duration?: IntFieldUpdateOperationsInput | number
    error?: NullableStringFieldUpdateOperationsInput | string | null
    started_at?: DateTimeFieldUpdateOperationsInput | Date | string
    completed_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type EnumAuthRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.AuthRole | EnumAuthRoleFieldRefInput<$PrismaModel>
    in?: $Enums.AuthRole[] | ListEnumAuthRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.AuthRole[] | ListEnumAuthRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumAuthRoleFilter<$PrismaModel> | $Enums.AuthRole
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type FilterListRelationFilter = {
    every?: FilterWhereInput
    some?: FilterWhereInput
    none?: FilterWhereInput
  }

  export type ContactListRelationFilter = {
    every?: ContactWhereInput
    some?: ContactWhereInput
    none?: ContactWhereInput
  }

  export type OutreachMessageListRelationFilter = {
    every?: OutreachMessageWhereInput
    some?: OutreachMessageWhereInput
    none?: OutreachMessageWhereInput
  }

  export type OutreachSequenceListRelationFilter = {
    every?: OutreachSequenceWhereInput
    some?: OutreachSequenceWhereInput
    none?: OutreachSequenceWhereInput
  }

  export type InteractionListRelationFilter = {
    every?: InteractionWhereInput
    some?: InteractionWhereInput
    none?: InteractionWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type FilterOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ContactOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OutreachMessageOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OutreachSequenceOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type InteractionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    uuid?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    password?: SortOrder
    role?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type UserAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    uuid?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    password?: SortOrder
    role?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    uuid?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    password?: SortOrder
    role?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type UserSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type EnumAuthRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AuthRole | EnumAuthRoleFieldRefInput<$PrismaModel>
    in?: $Enums.AuthRole[] | ListEnumAuthRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.AuthRole[] | ListEnumAuthRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumAuthRoleWithAggregatesFilter<$PrismaModel> | $Enums.AuthRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAuthRoleFilter<$PrismaModel>
    _max?: NestedEnumAuthRoleFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type EnumSourceTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.SourceType | EnumSourceTypeFieldRefInput<$PrismaModel>
    in?: $Enums.SourceType[] | ListEnumSourceTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.SourceType[] | ListEnumSourceTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumSourceTypeFilter<$PrismaModel> | $Enums.SourceType
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type EnumChannelNullableListFilter<$PrismaModel = never> = {
    equals?: $Enums.Channel[] | ListEnumChannelFieldRefInput<$PrismaModel> | null
    has?: $Enums.Channel | EnumChannelFieldRefInput<$PrismaModel> | null
    hasEvery?: $Enums.Channel[] | ListEnumChannelFieldRefInput<$PrismaModel>
    hasSome?: $Enums.Channel[] | ListEnumChannelFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type RawLeadListRelationFilter = {
    every?: RawLeadWhereInput
    some?: RawLeadWhereInput
    none?: RawLeadWhereInput
  }

  export type FilterJobListRelationFilter = {
    every?: FilterJobWhereInput
    some?: FilterJobWhereInput
    none?: FilterJobWhereInput
  }

  export type RawLeadOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type FilterJobOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type FilterCountOrderByAggregateInput = {
    id?: SortOrder
    uuid?: SortOrder
    user_uuid?: SortOrder
    name?: SortOrder
    source_type?: SortOrder
    query_config?: SortOrder
    enabled?: SortOrder
    cron_schedule?: SortOrder
    channels?: SortOrder
    ai_instructions?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type FilterAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type FilterMaxOrderByAggregateInput = {
    id?: SortOrder
    uuid?: SortOrder
    user_uuid?: SortOrder
    name?: SortOrder
    source_type?: SortOrder
    enabled?: SortOrder
    cron_schedule?: SortOrder
    ai_instructions?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type FilterMinOrderByAggregateInput = {
    id?: SortOrder
    uuid?: SortOrder
    user_uuid?: SortOrder
    name?: SortOrder
    source_type?: SortOrder
    enabled?: SortOrder
    cron_schedule?: SortOrder
    ai_instructions?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type FilterSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type EnumSourceTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SourceType | EnumSourceTypeFieldRefInput<$PrismaModel>
    in?: $Enums.SourceType[] | ListEnumSourceTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.SourceType[] | ListEnumSourceTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumSourceTypeWithAggregatesFilter<$PrismaModel> | $Enums.SourceType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSourceTypeFilter<$PrismaModel>
    _max?: NestedEnumSourceTypeFilter<$PrismaModel>
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type FilterScalarRelationFilter = {
    is?: FilterWhereInput
    isNot?: FilterWhereInput
  }

  export type LeadNullableScalarRelationFilter = {
    is?: LeadWhereInput | null
    isNot?: LeadWhereInput | null
  }

  export type RawLeadCountOrderByAggregateInput = {
    id?: SortOrder
    uuid?: SortOrder
    filter_uuid?: SortOrder
    source_type?: SortOrder
    raw_data?: SortOrder
    processed_at?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type RawLeadAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type RawLeadMaxOrderByAggregateInput = {
    id?: SortOrder
    uuid?: SortOrder
    filter_uuid?: SortOrder
    source_type?: SortOrder
    processed_at?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type RawLeadMinOrderByAggregateInput = {
    id?: SortOrder
    uuid?: SortOrder
    filter_uuid?: SortOrder
    source_type?: SortOrder
    processed_at?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type RawLeadSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type RawLeadNullableScalarRelationFilter = {
    is?: RawLeadWhereInput | null
    isNot?: RawLeadWhereInput | null
  }

  export type LeadCountOrderByAggregateInput = {
    id?: SortOrder
    uuid?: SortOrder
    raw_lead_uuid?: SortOrder
    name?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    company?: SortOrder
    website?: SortOrder
    linkedin_url?: SortOrder
    title?: SortOrder
    location?: SortOrder
    industry?: SortOrder
    description?: SortOrder
    source_type?: SortOrder
    raw_data?: SortOrder
    enrichment_data?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type LeadAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type LeadMaxOrderByAggregateInput = {
    id?: SortOrder
    uuid?: SortOrder
    raw_lead_uuid?: SortOrder
    name?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    company?: SortOrder
    website?: SortOrder
    linkedin_url?: SortOrder
    title?: SortOrder
    location?: SortOrder
    industry?: SortOrder
    description?: SortOrder
    source_type?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type LeadMinOrderByAggregateInput = {
    id?: SortOrder
    uuid?: SortOrder
    raw_lead_uuid?: SortOrder
    name?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    company?: SortOrder
    website?: SortOrder
    linkedin_url?: SortOrder
    title?: SortOrder
    location?: SortOrder
    industry?: SortOrder
    description?: SortOrder
    source_type?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type LeadSumOrderByAggregateInput = {
    id?: SortOrder
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type EnumLeadStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.LeadStatus | EnumLeadStatusFieldRefInput<$PrismaModel>
    in?: $Enums.LeadStatus[] | ListEnumLeadStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.LeadStatus[] | ListEnumLeadStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumLeadStatusFilter<$PrismaModel> | $Enums.LeadStatus
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type LeadScalarRelationFilter = {
    is?: LeadWhereInput
    isNot?: LeadWhereInput
  }

  export type FilterNullableScalarRelationFilter = {
    is?: FilterWhereInput | null
    isNot?: FilterWhereInput | null
  }

  export type ContactTagListRelationFilter = {
    every?: ContactTagWhereInput
    some?: ContactTagWhereInput
    none?: ContactTagWhereInput
  }

  export type ContactTagOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ContactUser_uuidLead_uuidCompoundUniqueInput = {
    user_uuid: string
    lead_uuid: string
  }

  export type ContactCountOrderByAggregateInput = {
    id?: SortOrder
    uuid?: SortOrder
    user_uuid?: SortOrder
    lead_uuid?: SortOrder
    filter_uuid?: SortOrder
    status?: SortOrder
    score?: SortOrder
    notes?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ContactAvgOrderByAggregateInput = {
    id?: SortOrder
    score?: SortOrder
  }

  export type ContactMaxOrderByAggregateInput = {
    id?: SortOrder
    uuid?: SortOrder
    user_uuid?: SortOrder
    lead_uuid?: SortOrder
    filter_uuid?: SortOrder
    status?: SortOrder
    score?: SortOrder
    notes?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ContactMinOrderByAggregateInput = {
    id?: SortOrder
    uuid?: SortOrder
    user_uuid?: SortOrder
    lead_uuid?: SortOrder
    filter_uuid?: SortOrder
    status?: SortOrder
    score?: SortOrder
    notes?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type ContactSumOrderByAggregateInput = {
    id?: SortOrder
    score?: SortOrder
  }

  export type EnumLeadStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.LeadStatus | EnumLeadStatusFieldRefInput<$PrismaModel>
    in?: $Enums.LeadStatus[] | ListEnumLeadStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.LeadStatus[] | ListEnumLeadStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumLeadStatusWithAggregatesFilter<$PrismaModel> | $Enums.LeadStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumLeadStatusFilter<$PrismaModel>
    _max?: NestedEnumLeadStatusFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type ContactScalarRelationFilter = {
    is?: ContactWhereInput
    isNot?: ContactWhereInput
  }

  export type ContactTagContact_uuidTagCompoundUniqueInput = {
    contact_uuid: string
    tag: string
  }

  export type ContactTagCountOrderByAggregateInput = {
    id?: SortOrder
    contact_uuid?: SortOrder
    tag?: SortOrder
    created_at?: SortOrder
  }

  export type ContactTagAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type ContactTagMaxOrderByAggregateInput = {
    id?: SortOrder
    contact_uuid?: SortOrder
    tag?: SortOrder
    created_at?: SortOrder
  }

  export type ContactTagMinOrderByAggregateInput = {
    id?: SortOrder
    contact_uuid?: SortOrder
    tag?: SortOrder
    created_at?: SortOrder
  }

  export type ContactTagSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type EnumInteractionTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.InteractionType | EnumInteractionTypeFieldRefInput<$PrismaModel>
    in?: $Enums.InteractionType[] | ListEnumInteractionTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.InteractionType[] | ListEnumInteractionTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumInteractionTypeFilter<$PrismaModel> | $Enums.InteractionType
  }

  export type InteractionCountOrderByAggregateInput = {
    id?: SortOrder
    uuid?: SortOrder
    contact_uuid?: SortOrder
    user_uuid?: SortOrder
    type?: SortOrder
    content?: SortOrder
    metadata?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type InteractionAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type InteractionMaxOrderByAggregateInput = {
    id?: SortOrder
    uuid?: SortOrder
    contact_uuid?: SortOrder
    user_uuid?: SortOrder
    type?: SortOrder
    content?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type InteractionMinOrderByAggregateInput = {
    id?: SortOrder
    uuid?: SortOrder
    contact_uuid?: SortOrder
    user_uuid?: SortOrder
    type?: SortOrder
    content?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type InteractionSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type EnumInteractionTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.InteractionType | EnumInteractionTypeFieldRefInput<$PrismaModel>
    in?: $Enums.InteractionType[] | ListEnumInteractionTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.InteractionType[] | ListEnumInteractionTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumInteractionTypeWithAggregatesFilter<$PrismaModel> | $Enums.InteractionType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumInteractionTypeFilter<$PrismaModel>
    _max?: NestedEnumInteractionTypeFilter<$PrismaModel>
  }

  export type EnumChannelFilter<$PrismaModel = never> = {
    equals?: $Enums.Channel | EnumChannelFieldRefInput<$PrismaModel>
    in?: $Enums.Channel[] | ListEnumChannelFieldRefInput<$PrismaModel>
    notIn?: $Enums.Channel[] | ListEnumChannelFieldRefInput<$PrismaModel>
    not?: NestedEnumChannelFilter<$PrismaModel> | $Enums.Channel
  }

  export type EnumMsgStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.MsgStatus | EnumMsgStatusFieldRefInput<$PrismaModel>
    in?: $Enums.MsgStatus[] | ListEnumMsgStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.MsgStatus[] | ListEnumMsgStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumMsgStatusFilter<$PrismaModel> | $Enums.MsgStatus
  }

  export type OutreachMessageCountOrderByAggregateInput = {
    id?: SortOrder
    uuid?: SortOrder
    user_uuid?: SortOrder
    contact_uuid?: SortOrder
    channel?: SortOrder
    subject?: SortOrder
    content?: SortOrder
    status?: SortOrder
    scheduled_at?: SortOrder
    sent_at?: SortOrder
    metadata?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type OutreachMessageAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type OutreachMessageMaxOrderByAggregateInput = {
    id?: SortOrder
    uuid?: SortOrder
    user_uuid?: SortOrder
    contact_uuid?: SortOrder
    channel?: SortOrder
    subject?: SortOrder
    content?: SortOrder
    status?: SortOrder
    scheduled_at?: SortOrder
    sent_at?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type OutreachMessageMinOrderByAggregateInput = {
    id?: SortOrder
    uuid?: SortOrder
    user_uuid?: SortOrder
    contact_uuid?: SortOrder
    channel?: SortOrder
    subject?: SortOrder
    content?: SortOrder
    status?: SortOrder
    scheduled_at?: SortOrder
    sent_at?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type OutreachMessageSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type EnumChannelWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Channel | EnumChannelFieldRefInput<$PrismaModel>
    in?: $Enums.Channel[] | ListEnumChannelFieldRefInput<$PrismaModel>
    notIn?: $Enums.Channel[] | ListEnumChannelFieldRefInput<$PrismaModel>
    not?: NestedEnumChannelWithAggregatesFilter<$PrismaModel> | $Enums.Channel
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumChannelFilter<$PrismaModel>
    _max?: NestedEnumChannelFilter<$PrismaModel>
  }

  export type EnumMsgStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MsgStatus | EnumMsgStatusFieldRefInput<$PrismaModel>
    in?: $Enums.MsgStatus[] | ListEnumMsgStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.MsgStatus[] | ListEnumMsgStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumMsgStatusWithAggregatesFilter<$PrismaModel> | $Enums.MsgStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMsgStatusFilter<$PrismaModel>
    _max?: NestedEnumMsgStatusFilter<$PrismaModel>
  }

  export type OutreachSequenceCountOrderByAggregateInput = {
    id?: SortOrder
    uuid?: SortOrder
    user_uuid?: SortOrder
    name?: SortOrder
    steps?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type OutreachSequenceAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type OutreachSequenceMaxOrderByAggregateInput = {
    id?: SortOrder
    uuid?: SortOrder
    user_uuid?: SortOrder
    name?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type OutreachSequenceMinOrderByAggregateInput = {
    id?: SortOrder
    uuid?: SortOrder
    user_uuid?: SortOrder
    name?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type OutreachSequenceSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type EnumJobStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.JobStatus | EnumJobStatusFieldRefInput<$PrismaModel>
    in?: $Enums.JobStatus[] | ListEnumJobStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.JobStatus[] | ListEnumJobStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumJobStatusFilter<$PrismaModel> | $Enums.JobStatus
  }

  export type FilterJobCountOrderByAggregateInput = {
    id?: SortOrder
    uuid?: SortOrder
    filter_uuid?: SortOrder
    status?: SortOrder
    leads_found?: SortOrder
    duration?: SortOrder
    error?: SortOrder
    started_at?: SortOrder
    completed_at?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type FilterJobAvgOrderByAggregateInput = {
    id?: SortOrder
    leads_found?: SortOrder
    duration?: SortOrder
  }

  export type FilterJobMaxOrderByAggregateInput = {
    id?: SortOrder
    uuid?: SortOrder
    filter_uuid?: SortOrder
    status?: SortOrder
    leads_found?: SortOrder
    duration?: SortOrder
    error?: SortOrder
    started_at?: SortOrder
    completed_at?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type FilterJobMinOrderByAggregateInput = {
    id?: SortOrder
    uuid?: SortOrder
    filter_uuid?: SortOrder
    status?: SortOrder
    leads_found?: SortOrder
    duration?: SortOrder
    error?: SortOrder
    started_at?: SortOrder
    completed_at?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type FilterJobSumOrderByAggregateInput = {
    id?: SortOrder
    leads_found?: SortOrder
    duration?: SortOrder
  }

  export type EnumJobStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.JobStatus | EnumJobStatusFieldRefInput<$PrismaModel>
    in?: $Enums.JobStatus[] | ListEnumJobStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.JobStatus[] | ListEnumJobStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumJobStatusWithAggregatesFilter<$PrismaModel> | $Enums.JobStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumJobStatusFilter<$PrismaModel>
    _max?: NestedEnumJobStatusFilter<$PrismaModel>
  }

  export type FilterCreateNestedManyWithoutUserInput = {
    create?: XOR<FilterCreateWithoutUserInput, FilterUncheckedCreateWithoutUserInput> | FilterCreateWithoutUserInput[] | FilterUncheckedCreateWithoutUserInput[]
    connectOrCreate?: FilterCreateOrConnectWithoutUserInput | FilterCreateOrConnectWithoutUserInput[]
    createMany?: FilterCreateManyUserInputEnvelope
    connect?: FilterWhereUniqueInput | FilterWhereUniqueInput[]
  }

  export type ContactCreateNestedManyWithoutUserInput = {
    create?: XOR<ContactCreateWithoutUserInput, ContactUncheckedCreateWithoutUserInput> | ContactCreateWithoutUserInput[] | ContactUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ContactCreateOrConnectWithoutUserInput | ContactCreateOrConnectWithoutUserInput[]
    createMany?: ContactCreateManyUserInputEnvelope
    connect?: ContactWhereUniqueInput | ContactWhereUniqueInput[]
  }

  export type OutreachMessageCreateNestedManyWithoutUserInput = {
    create?: XOR<OutreachMessageCreateWithoutUserInput, OutreachMessageUncheckedCreateWithoutUserInput> | OutreachMessageCreateWithoutUserInput[] | OutreachMessageUncheckedCreateWithoutUserInput[]
    connectOrCreate?: OutreachMessageCreateOrConnectWithoutUserInput | OutreachMessageCreateOrConnectWithoutUserInput[]
    createMany?: OutreachMessageCreateManyUserInputEnvelope
    connect?: OutreachMessageWhereUniqueInput | OutreachMessageWhereUniqueInput[]
  }

  export type OutreachSequenceCreateNestedManyWithoutUserInput = {
    create?: XOR<OutreachSequenceCreateWithoutUserInput, OutreachSequenceUncheckedCreateWithoutUserInput> | OutreachSequenceCreateWithoutUserInput[] | OutreachSequenceUncheckedCreateWithoutUserInput[]
    connectOrCreate?: OutreachSequenceCreateOrConnectWithoutUserInput | OutreachSequenceCreateOrConnectWithoutUserInput[]
    createMany?: OutreachSequenceCreateManyUserInputEnvelope
    connect?: OutreachSequenceWhereUniqueInput | OutreachSequenceWhereUniqueInput[]
  }

  export type InteractionCreateNestedManyWithoutUserInput = {
    create?: XOR<InteractionCreateWithoutUserInput, InteractionUncheckedCreateWithoutUserInput> | InteractionCreateWithoutUserInput[] | InteractionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: InteractionCreateOrConnectWithoutUserInput | InteractionCreateOrConnectWithoutUserInput[]
    createMany?: InteractionCreateManyUserInputEnvelope
    connect?: InteractionWhereUniqueInput | InteractionWhereUniqueInput[]
  }

  export type FilterUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<FilterCreateWithoutUserInput, FilterUncheckedCreateWithoutUserInput> | FilterCreateWithoutUserInput[] | FilterUncheckedCreateWithoutUserInput[]
    connectOrCreate?: FilterCreateOrConnectWithoutUserInput | FilterCreateOrConnectWithoutUserInput[]
    createMany?: FilterCreateManyUserInputEnvelope
    connect?: FilterWhereUniqueInput | FilterWhereUniqueInput[]
  }

  export type ContactUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<ContactCreateWithoutUserInput, ContactUncheckedCreateWithoutUserInput> | ContactCreateWithoutUserInput[] | ContactUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ContactCreateOrConnectWithoutUserInput | ContactCreateOrConnectWithoutUserInput[]
    createMany?: ContactCreateManyUserInputEnvelope
    connect?: ContactWhereUniqueInput | ContactWhereUniqueInput[]
  }

  export type OutreachMessageUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<OutreachMessageCreateWithoutUserInput, OutreachMessageUncheckedCreateWithoutUserInput> | OutreachMessageCreateWithoutUserInput[] | OutreachMessageUncheckedCreateWithoutUserInput[]
    connectOrCreate?: OutreachMessageCreateOrConnectWithoutUserInput | OutreachMessageCreateOrConnectWithoutUserInput[]
    createMany?: OutreachMessageCreateManyUserInputEnvelope
    connect?: OutreachMessageWhereUniqueInput | OutreachMessageWhereUniqueInput[]
  }

  export type OutreachSequenceUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<OutreachSequenceCreateWithoutUserInput, OutreachSequenceUncheckedCreateWithoutUserInput> | OutreachSequenceCreateWithoutUserInput[] | OutreachSequenceUncheckedCreateWithoutUserInput[]
    connectOrCreate?: OutreachSequenceCreateOrConnectWithoutUserInput | OutreachSequenceCreateOrConnectWithoutUserInput[]
    createMany?: OutreachSequenceCreateManyUserInputEnvelope
    connect?: OutreachSequenceWhereUniqueInput | OutreachSequenceWhereUniqueInput[]
  }

  export type InteractionUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<InteractionCreateWithoutUserInput, InteractionUncheckedCreateWithoutUserInput> | InteractionCreateWithoutUserInput[] | InteractionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: InteractionCreateOrConnectWithoutUserInput | InteractionCreateOrConnectWithoutUserInput[]
    createMany?: InteractionCreateManyUserInputEnvelope
    connect?: InteractionWhereUniqueInput | InteractionWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type EnumAuthRoleFieldUpdateOperationsInput = {
    set?: $Enums.AuthRole
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type FilterUpdateManyWithoutUserNestedInput = {
    create?: XOR<FilterCreateWithoutUserInput, FilterUncheckedCreateWithoutUserInput> | FilterCreateWithoutUserInput[] | FilterUncheckedCreateWithoutUserInput[]
    connectOrCreate?: FilterCreateOrConnectWithoutUserInput | FilterCreateOrConnectWithoutUserInput[]
    upsert?: FilterUpsertWithWhereUniqueWithoutUserInput | FilterUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: FilterCreateManyUserInputEnvelope
    set?: FilterWhereUniqueInput | FilterWhereUniqueInput[]
    disconnect?: FilterWhereUniqueInput | FilterWhereUniqueInput[]
    delete?: FilterWhereUniqueInput | FilterWhereUniqueInput[]
    connect?: FilterWhereUniqueInput | FilterWhereUniqueInput[]
    update?: FilterUpdateWithWhereUniqueWithoutUserInput | FilterUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: FilterUpdateManyWithWhereWithoutUserInput | FilterUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: FilterScalarWhereInput | FilterScalarWhereInput[]
  }

  export type ContactUpdateManyWithoutUserNestedInput = {
    create?: XOR<ContactCreateWithoutUserInput, ContactUncheckedCreateWithoutUserInput> | ContactCreateWithoutUserInput[] | ContactUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ContactCreateOrConnectWithoutUserInput | ContactCreateOrConnectWithoutUserInput[]
    upsert?: ContactUpsertWithWhereUniqueWithoutUserInput | ContactUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ContactCreateManyUserInputEnvelope
    set?: ContactWhereUniqueInput | ContactWhereUniqueInput[]
    disconnect?: ContactWhereUniqueInput | ContactWhereUniqueInput[]
    delete?: ContactWhereUniqueInput | ContactWhereUniqueInput[]
    connect?: ContactWhereUniqueInput | ContactWhereUniqueInput[]
    update?: ContactUpdateWithWhereUniqueWithoutUserInput | ContactUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ContactUpdateManyWithWhereWithoutUserInput | ContactUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ContactScalarWhereInput | ContactScalarWhereInput[]
  }

  export type OutreachMessageUpdateManyWithoutUserNestedInput = {
    create?: XOR<OutreachMessageCreateWithoutUserInput, OutreachMessageUncheckedCreateWithoutUserInput> | OutreachMessageCreateWithoutUserInput[] | OutreachMessageUncheckedCreateWithoutUserInput[]
    connectOrCreate?: OutreachMessageCreateOrConnectWithoutUserInput | OutreachMessageCreateOrConnectWithoutUserInput[]
    upsert?: OutreachMessageUpsertWithWhereUniqueWithoutUserInput | OutreachMessageUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: OutreachMessageCreateManyUserInputEnvelope
    set?: OutreachMessageWhereUniqueInput | OutreachMessageWhereUniqueInput[]
    disconnect?: OutreachMessageWhereUniqueInput | OutreachMessageWhereUniqueInput[]
    delete?: OutreachMessageWhereUniqueInput | OutreachMessageWhereUniqueInput[]
    connect?: OutreachMessageWhereUniqueInput | OutreachMessageWhereUniqueInput[]
    update?: OutreachMessageUpdateWithWhereUniqueWithoutUserInput | OutreachMessageUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: OutreachMessageUpdateManyWithWhereWithoutUserInput | OutreachMessageUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: OutreachMessageScalarWhereInput | OutreachMessageScalarWhereInput[]
  }

  export type OutreachSequenceUpdateManyWithoutUserNestedInput = {
    create?: XOR<OutreachSequenceCreateWithoutUserInput, OutreachSequenceUncheckedCreateWithoutUserInput> | OutreachSequenceCreateWithoutUserInput[] | OutreachSequenceUncheckedCreateWithoutUserInput[]
    connectOrCreate?: OutreachSequenceCreateOrConnectWithoutUserInput | OutreachSequenceCreateOrConnectWithoutUserInput[]
    upsert?: OutreachSequenceUpsertWithWhereUniqueWithoutUserInput | OutreachSequenceUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: OutreachSequenceCreateManyUserInputEnvelope
    set?: OutreachSequenceWhereUniqueInput | OutreachSequenceWhereUniqueInput[]
    disconnect?: OutreachSequenceWhereUniqueInput | OutreachSequenceWhereUniqueInput[]
    delete?: OutreachSequenceWhereUniqueInput | OutreachSequenceWhereUniqueInput[]
    connect?: OutreachSequenceWhereUniqueInput | OutreachSequenceWhereUniqueInput[]
    update?: OutreachSequenceUpdateWithWhereUniqueWithoutUserInput | OutreachSequenceUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: OutreachSequenceUpdateManyWithWhereWithoutUserInput | OutreachSequenceUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: OutreachSequenceScalarWhereInput | OutreachSequenceScalarWhereInput[]
  }

  export type InteractionUpdateManyWithoutUserNestedInput = {
    create?: XOR<InteractionCreateWithoutUserInput, InteractionUncheckedCreateWithoutUserInput> | InteractionCreateWithoutUserInput[] | InteractionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: InteractionCreateOrConnectWithoutUserInput | InteractionCreateOrConnectWithoutUserInput[]
    upsert?: InteractionUpsertWithWhereUniqueWithoutUserInput | InteractionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: InteractionCreateManyUserInputEnvelope
    set?: InteractionWhereUniqueInput | InteractionWhereUniqueInput[]
    disconnect?: InteractionWhereUniqueInput | InteractionWhereUniqueInput[]
    delete?: InteractionWhereUniqueInput | InteractionWhereUniqueInput[]
    connect?: InteractionWhereUniqueInput | InteractionWhereUniqueInput[]
    update?: InteractionUpdateWithWhereUniqueWithoutUserInput | InteractionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: InteractionUpdateManyWithWhereWithoutUserInput | InteractionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: InteractionScalarWhereInput | InteractionScalarWhereInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type FilterUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<FilterCreateWithoutUserInput, FilterUncheckedCreateWithoutUserInput> | FilterCreateWithoutUserInput[] | FilterUncheckedCreateWithoutUserInput[]
    connectOrCreate?: FilterCreateOrConnectWithoutUserInput | FilterCreateOrConnectWithoutUserInput[]
    upsert?: FilterUpsertWithWhereUniqueWithoutUserInput | FilterUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: FilterCreateManyUserInputEnvelope
    set?: FilterWhereUniqueInput | FilterWhereUniqueInput[]
    disconnect?: FilterWhereUniqueInput | FilterWhereUniqueInput[]
    delete?: FilterWhereUniqueInput | FilterWhereUniqueInput[]
    connect?: FilterWhereUniqueInput | FilterWhereUniqueInput[]
    update?: FilterUpdateWithWhereUniqueWithoutUserInput | FilterUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: FilterUpdateManyWithWhereWithoutUserInput | FilterUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: FilterScalarWhereInput | FilterScalarWhereInput[]
  }

  export type ContactUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<ContactCreateWithoutUserInput, ContactUncheckedCreateWithoutUserInput> | ContactCreateWithoutUserInput[] | ContactUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ContactCreateOrConnectWithoutUserInput | ContactCreateOrConnectWithoutUserInput[]
    upsert?: ContactUpsertWithWhereUniqueWithoutUserInput | ContactUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ContactCreateManyUserInputEnvelope
    set?: ContactWhereUniqueInput | ContactWhereUniqueInput[]
    disconnect?: ContactWhereUniqueInput | ContactWhereUniqueInput[]
    delete?: ContactWhereUniqueInput | ContactWhereUniqueInput[]
    connect?: ContactWhereUniqueInput | ContactWhereUniqueInput[]
    update?: ContactUpdateWithWhereUniqueWithoutUserInput | ContactUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ContactUpdateManyWithWhereWithoutUserInput | ContactUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ContactScalarWhereInput | ContactScalarWhereInput[]
  }

  export type OutreachMessageUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<OutreachMessageCreateWithoutUserInput, OutreachMessageUncheckedCreateWithoutUserInput> | OutreachMessageCreateWithoutUserInput[] | OutreachMessageUncheckedCreateWithoutUserInput[]
    connectOrCreate?: OutreachMessageCreateOrConnectWithoutUserInput | OutreachMessageCreateOrConnectWithoutUserInput[]
    upsert?: OutreachMessageUpsertWithWhereUniqueWithoutUserInput | OutreachMessageUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: OutreachMessageCreateManyUserInputEnvelope
    set?: OutreachMessageWhereUniqueInput | OutreachMessageWhereUniqueInput[]
    disconnect?: OutreachMessageWhereUniqueInput | OutreachMessageWhereUniqueInput[]
    delete?: OutreachMessageWhereUniqueInput | OutreachMessageWhereUniqueInput[]
    connect?: OutreachMessageWhereUniqueInput | OutreachMessageWhereUniqueInput[]
    update?: OutreachMessageUpdateWithWhereUniqueWithoutUserInput | OutreachMessageUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: OutreachMessageUpdateManyWithWhereWithoutUserInput | OutreachMessageUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: OutreachMessageScalarWhereInput | OutreachMessageScalarWhereInput[]
  }

  export type OutreachSequenceUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<OutreachSequenceCreateWithoutUserInput, OutreachSequenceUncheckedCreateWithoutUserInput> | OutreachSequenceCreateWithoutUserInput[] | OutreachSequenceUncheckedCreateWithoutUserInput[]
    connectOrCreate?: OutreachSequenceCreateOrConnectWithoutUserInput | OutreachSequenceCreateOrConnectWithoutUserInput[]
    upsert?: OutreachSequenceUpsertWithWhereUniqueWithoutUserInput | OutreachSequenceUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: OutreachSequenceCreateManyUserInputEnvelope
    set?: OutreachSequenceWhereUniqueInput | OutreachSequenceWhereUniqueInput[]
    disconnect?: OutreachSequenceWhereUniqueInput | OutreachSequenceWhereUniqueInput[]
    delete?: OutreachSequenceWhereUniqueInput | OutreachSequenceWhereUniqueInput[]
    connect?: OutreachSequenceWhereUniqueInput | OutreachSequenceWhereUniqueInput[]
    update?: OutreachSequenceUpdateWithWhereUniqueWithoutUserInput | OutreachSequenceUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: OutreachSequenceUpdateManyWithWhereWithoutUserInput | OutreachSequenceUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: OutreachSequenceScalarWhereInput | OutreachSequenceScalarWhereInput[]
  }

  export type InteractionUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<InteractionCreateWithoutUserInput, InteractionUncheckedCreateWithoutUserInput> | InteractionCreateWithoutUserInput[] | InteractionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: InteractionCreateOrConnectWithoutUserInput | InteractionCreateOrConnectWithoutUserInput[]
    upsert?: InteractionUpsertWithWhereUniqueWithoutUserInput | InteractionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: InteractionCreateManyUserInputEnvelope
    set?: InteractionWhereUniqueInput | InteractionWhereUniqueInput[]
    disconnect?: InteractionWhereUniqueInput | InteractionWhereUniqueInput[]
    delete?: InteractionWhereUniqueInput | InteractionWhereUniqueInput[]
    connect?: InteractionWhereUniqueInput | InteractionWhereUniqueInput[]
    update?: InteractionUpdateWithWhereUniqueWithoutUserInput | InteractionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: InteractionUpdateManyWithWhereWithoutUserInput | InteractionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: InteractionScalarWhereInput | InteractionScalarWhereInput[]
  }

  export type FilterCreatechannelsInput = {
    set: $Enums.Channel[]
  }

  export type UserCreateNestedOneWithoutFiltersInput = {
    create?: XOR<UserCreateWithoutFiltersInput, UserUncheckedCreateWithoutFiltersInput>
    connectOrCreate?: UserCreateOrConnectWithoutFiltersInput
    connect?: UserWhereUniqueInput
  }

  export type RawLeadCreateNestedManyWithoutFilterInput = {
    create?: XOR<RawLeadCreateWithoutFilterInput, RawLeadUncheckedCreateWithoutFilterInput> | RawLeadCreateWithoutFilterInput[] | RawLeadUncheckedCreateWithoutFilterInput[]
    connectOrCreate?: RawLeadCreateOrConnectWithoutFilterInput | RawLeadCreateOrConnectWithoutFilterInput[]
    createMany?: RawLeadCreateManyFilterInputEnvelope
    connect?: RawLeadWhereUniqueInput | RawLeadWhereUniqueInput[]
  }

  export type ContactCreateNestedManyWithoutFilterInput = {
    create?: XOR<ContactCreateWithoutFilterInput, ContactUncheckedCreateWithoutFilterInput> | ContactCreateWithoutFilterInput[] | ContactUncheckedCreateWithoutFilterInput[]
    connectOrCreate?: ContactCreateOrConnectWithoutFilterInput | ContactCreateOrConnectWithoutFilterInput[]
    createMany?: ContactCreateManyFilterInputEnvelope
    connect?: ContactWhereUniqueInput | ContactWhereUniqueInput[]
  }

  export type FilterJobCreateNestedManyWithoutFilterInput = {
    create?: XOR<FilterJobCreateWithoutFilterInput, FilterJobUncheckedCreateWithoutFilterInput> | FilterJobCreateWithoutFilterInput[] | FilterJobUncheckedCreateWithoutFilterInput[]
    connectOrCreate?: FilterJobCreateOrConnectWithoutFilterInput | FilterJobCreateOrConnectWithoutFilterInput[]
    createMany?: FilterJobCreateManyFilterInputEnvelope
    connect?: FilterJobWhereUniqueInput | FilterJobWhereUniqueInput[]
  }

  export type RawLeadUncheckedCreateNestedManyWithoutFilterInput = {
    create?: XOR<RawLeadCreateWithoutFilterInput, RawLeadUncheckedCreateWithoutFilterInput> | RawLeadCreateWithoutFilterInput[] | RawLeadUncheckedCreateWithoutFilterInput[]
    connectOrCreate?: RawLeadCreateOrConnectWithoutFilterInput | RawLeadCreateOrConnectWithoutFilterInput[]
    createMany?: RawLeadCreateManyFilterInputEnvelope
    connect?: RawLeadWhereUniqueInput | RawLeadWhereUniqueInput[]
  }

  export type ContactUncheckedCreateNestedManyWithoutFilterInput = {
    create?: XOR<ContactCreateWithoutFilterInput, ContactUncheckedCreateWithoutFilterInput> | ContactCreateWithoutFilterInput[] | ContactUncheckedCreateWithoutFilterInput[]
    connectOrCreate?: ContactCreateOrConnectWithoutFilterInput | ContactCreateOrConnectWithoutFilterInput[]
    createMany?: ContactCreateManyFilterInputEnvelope
    connect?: ContactWhereUniqueInput | ContactWhereUniqueInput[]
  }

  export type FilterJobUncheckedCreateNestedManyWithoutFilterInput = {
    create?: XOR<FilterJobCreateWithoutFilterInput, FilterJobUncheckedCreateWithoutFilterInput> | FilterJobCreateWithoutFilterInput[] | FilterJobUncheckedCreateWithoutFilterInput[]
    connectOrCreate?: FilterJobCreateOrConnectWithoutFilterInput | FilterJobCreateOrConnectWithoutFilterInput[]
    createMany?: FilterJobCreateManyFilterInputEnvelope
    connect?: FilterJobWhereUniqueInput | FilterJobWhereUniqueInput[]
  }

  export type EnumSourceTypeFieldUpdateOperationsInput = {
    set?: $Enums.SourceType
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type FilterUpdatechannelsInput = {
    set?: $Enums.Channel[]
    push?: $Enums.Channel | $Enums.Channel[]
  }

  export type UserUpdateOneRequiredWithoutFiltersNestedInput = {
    create?: XOR<UserCreateWithoutFiltersInput, UserUncheckedCreateWithoutFiltersInput>
    connectOrCreate?: UserCreateOrConnectWithoutFiltersInput
    upsert?: UserUpsertWithoutFiltersInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutFiltersInput, UserUpdateWithoutFiltersInput>, UserUncheckedUpdateWithoutFiltersInput>
  }

  export type RawLeadUpdateManyWithoutFilterNestedInput = {
    create?: XOR<RawLeadCreateWithoutFilterInput, RawLeadUncheckedCreateWithoutFilterInput> | RawLeadCreateWithoutFilterInput[] | RawLeadUncheckedCreateWithoutFilterInput[]
    connectOrCreate?: RawLeadCreateOrConnectWithoutFilterInput | RawLeadCreateOrConnectWithoutFilterInput[]
    upsert?: RawLeadUpsertWithWhereUniqueWithoutFilterInput | RawLeadUpsertWithWhereUniqueWithoutFilterInput[]
    createMany?: RawLeadCreateManyFilterInputEnvelope
    set?: RawLeadWhereUniqueInput | RawLeadWhereUniqueInput[]
    disconnect?: RawLeadWhereUniqueInput | RawLeadWhereUniqueInput[]
    delete?: RawLeadWhereUniqueInput | RawLeadWhereUniqueInput[]
    connect?: RawLeadWhereUniqueInput | RawLeadWhereUniqueInput[]
    update?: RawLeadUpdateWithWhereUniqueWithoutFilterInput | RawLeadUpdateWithWhereUniqueWithoutFilterInput[]
    updateMany?: RawLeadUpdateManyWithWhereWithoutFilterInput | RawLeadUpdateManyWithWhereWithoutFilterInput[]
    deleteMany?: RawLeadScalarWhereInput | RawLeadScalarWhereInput[]
  }

  export type ContactUpdateManyWithoutFilterNestedInput = {
    create?: XOR<ContactCreateWithoutFilterInput, ContactUncheckedCreateWithoutFilterInput> | ContactCreateWithoutFilterInput[] | ContactUncheckedCreateWithoutFilterInput[]
    connectOrCreate?: ContactCreateOrConnectWithoutFilterInput | ContactCreateOrConnectWithoutFilterInput[]
    upsert?: ContactUpsertWithWhereUniqueWithoutFilterInput | ContactUpsertWithWhereUniqueWithoutFilterInput[]
    createMany?: ContactCreateManyFilterInputEnvelope
    set?: ContactWhereUniqueInput | ContactWhereUniqueInput[]
    disconnect?: ContactWhereUniqueInput | ContactWhereUniqueInput[]
    delete?: ContactWhereUniqueInput | ContactWhereUniqueInput[]
    connect?: ContactWhereUniqueInput | ContactWhereUniqueInput[]
    update?: ContactUpdateWithWhereUniqueWithoutFilterInput | ContactUpdateWithWhereUniqueWithoutFilterInput[]
    updateMany?: ContactUpdateManyWithWhereWithoutFilterInput | ContactUpdateManyWithWhereWithoutFilterInput[]
    deleteMany?: ContactScalarWhereInput | ContactScalarWhereInput[]
  }

  export type FilterJobUpdateManyWithoutFilterNestedInput = {
    create?: XOR<FilterJobCreateWithoutFilterInput, FilterJobUncheckedCreateWithoutFilterInput> | FilterJobCreateWithoutFilterInput[] | FilterJobUncheckedCreateWithoutFilterInput[]
    connectOrCreate?: FilterJobCreateOrConnectWithoutFilterInput | FilterJobCreateOrConnectWithoutFilterInput[]
    upsert?: FilterJobUpsertWithWhereUniqueWithoutFilterInput | FilterJobUpsertWithWhereUniqueWithoutFilterInput[]
    createMany?: FilterJobCreateManyFilterInputEnvelope
    set?: FilterJobWhereUniqueInput | FilterJobWhereUniqueInput[]
    disconnect?: FilterJobWhereUniqueInput | FilterJobWhereUniqueInput[]
    delete?: FilterJobWhereUniqueInput | FilterJobWhereUniqueInput[]
    connect?: FilterJobWhereUniqueInput | FilterJobWhereUniqueInput[]
    update?: FilterJobUpdateWithWhereUniqueWithoutFilterInput | FilterJobUpdateWithWhereUniqueWithoutFilterInput[]
    updateMany?: FilterJobUpdateManyWithWhereWithoutFilterInput | FilterJobUpdateManyWithWhereWithoutFilterInput[]
    deleteMany?: FilterJobScalarWhereInput | FilterJobScalarWhereInput[]
  }

  export type RawLeadUncheckedUpdateManyWithoutFilterNestedInput = {
    create?: XOR<RawLeadCreateWithoutFilterInput, RawLeadUncheckedCreateWithoutFilterInput> | RawLeadCreateWithoutFilterInput[] | RawLeadUncheckedCreateWithoutFilterInput[]
    connectOrCreate?: RawLeadCreateOrConnectWithoutFilterInput | RawLeadCreateOrConnectWithoutFilterInput[]
    upsert?: RawLeadUpsertWithWhereUniqueWithoutFilterInput | RawLeadUpsertWithWhereUniqueWithoutFilterInput[]
    createMany?: RawLeadCreateManyFilterInputEnvelope
    set?: RawLeadWhereUniqueInput | RawLeadWhereUniqueInput[]
    disconnect?: RawLeadWhereUniqueInput | RawLeadWhereUniqueInput[]
    delete?: RawLeadWhereUniqueInput | RawLeadWhereUniqueInput[]
    connect?: RawLeadWhereUniqueInput | RawLeadWhereUniqueInput[]
    update?: RawLeadUpdateWithWhereUniqueWithoutFilterInput | RawLeadUpdateWithWhereUniqueWithoutFilterInput[]
    updateMany?: RawLeadUpdateManyWithWhereWithoutFilterInput | RawLeadUpdateManyWithWhereWithoutFilterInput[]
    deleteMany?: RawLeadScalarWhereInput | RawLeadScalarWhereInput[]
  }

  export type ContactUncheckedUpdateManyWithoutFilterNestedInput = {
    create?: XOR<ContactCreateWithoutFilterInput, ContactUncheckedCreateWithoutFilterInput> | ContactCreateWithoutFilterInput[] | ContactUncheckedCreateWithoutFilterInput[]
    connectOrCreate?: ContactCreateOrConnectWithoutFilterInput | ContactCreateOrConnectWithoutFilterInput[]
    upsert?: ContactUpsertWithWhereUniqueWithoutFilterInput | ContactUpsertWithWhereUniqueWithoutFilterInput[]
    createMany?: ContactCreateManyFilterInputEnvelope
    set?: ContactWhereUniqueInput | ContactWhereUniqueInput[]
    disconnect?: ContactWhereUniqueInput | ContactWhereUniqueInput[]
    delete?: ContactWhereUniqueInput | ContactWhereUniqueInput[]
    connect?: ContactWhereUniqueInput | ContactWhereUniqueInput[]
    update?: ContactUpdateWithWhereUniqueWithoutFilterInput | ContactUpdateWithWhereUniqueWithoutFilterInput[]
    updateMany?: ContactUpdateManyWithWhereWithoutFilterInput | ContactUpdateManyWithWhereWithoutFilterInput[]
    deleteMany?: ContactScalarWhereInput | ContactScalarWhereInput[]
  }

  export type FilterJobUncheckedUpdateManyWithoutFilterNestedInput = {
    create?: XOR<FilterJobCreateWithoutFilterInput, FilterJobUncheckedCreateWithoutFilterInput> | FilterJobCreateWithoutFilterInput[] | FilterJobUncheckedCreateWithoutFilterInput[]
    connectOrCreate?: FilterJobCreateOrConnectWithoutFilterInput | FilterJobCreateOrConnectWithoutFilterInput[]
    upsert?: FilterJobUpsertWithWhereUniqueWithoutFilterInput | FilterJobUpsertWithWhereUniqueWithoutFilterInput[]
    createMany?: FilterJobCreateManyFilterInputEnvelope
    set?: FilterJobWhereUniqueInput | FilterJobWhereUniqueInput[]
    disconnect?: FilterJobWhereUniqueInput | FilterJobWhereUniqueInput[]
    delete?: FilterJobWhereUniqueInput | FilterJobWhereUniqueInput[]
    connect?: FilterJobWhereUniqueInput | FilterJobWhereUniqueInput[]
    update?: FilterJobUpdateWithWhereUniqueWithoutFilterInput | FilterJobUpdateWithWhereUniqueWithoutFilterInput[]
    updateMany?: FilterJobUpdateManyWithWhereWithoutFilterInput | FilterJobUpdateManyWithWhereWithoutFilterInput[]
    deleteMany?: FilterJobScalarWhereInput | FilterJobScalarWhereInput[]
  }

  export type FilterCreateNestedOneWithoutRaw_leadsInput = {
    create?: XOR<FilterCreateWithoutRaw_leadsInput, FilterUncheckedCreateWithoutRaw_leadsInput>
    connectOrCreate?: FilterCreateOrConnectWithoutRaw_leadsInput
    connect?: FilterWhereUniqueInput
  }

  export type LeadCreateNestedOneWithoutRaw_leadInput = {
    create?: XOR<LeadCreateWithoutRaw_leadInput, LeadUncheckedCreateWithoutRaw_leadInput>
    connectOrCreate?: LeadCreateOrConnectWithoutRaw_leadInput
    connect?: LeadWhereUniqueInput
  }

  export type LeadUncheckedCreateNestedOneWithoutRaw_leadInput = {
    create?: XOR<LeadCreateWithoutRaw_leadInput, LeadUncheckedCreateWithoutRaw_leadInput>
    connectOrCreate?: LeadCreateOrConnectWithoutRaw_leadInput
    connect?: LeadWhereUniqueInput
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type FilterUpdateOneRequiredWithoutRaw_leadsNestedInput = {
    create?: XOR<FilterCreateWithoutRaw_leadsInput, FilterUncheckedCreateWithoutRaw_leadsInput>
    connectOrCreate?: FilterCreateOrConnectWithoutRaw_leadsInput
    upsert?: FilterUpsertWithoutRaw_leadsInput
    connect?: FilterWhereUniqueInput
    update?: XOR<XOR<FilterUpdateToOneWithWhereWithoutRaw_leadsInput, FilterUpdateWithoutRaw_leadsInput>, FilterUncheckedUpdateWithoutRaw_leadsInput>
  }

  export type LeadUpdateOneWithoutRaw_leadNestedInput = {
    create?: XOR<LeadCreateWithoutRaw_leadInput, LeadUncheckedCreateWithoutRaw_leadInput>
    connectOrCreate?: LeadCreateOrConnectWithoutRaw_leadInput
    upsert?: LeadUpsertWithoutRaw_leadInput
    disconnect?: LeadWhereInput | boolean
    delete?: LeadWhereInput | boolean
    connect?: LeadWhereUniqueInput
    update?: XOR<XOR<LeadUpdateToOneWithWhereWithoutRaw_leadInput, LeadUpdateWithoutRaw_leadInput>, LeadUncheckedUpdateWithoutRaw_leadInput>
  }

  export type LeadUncheckedUpdateOneWithoutRaw_leadNestedInput = {
    create?: XOR<LeadCreateWithoutRaw_leadInput, LeadUncheckedCreateWithoutRaw_leadInput>
    connectOrCreate?: LeadCreateOrConnectWithoutRaw_leadInput
    upsert?: LeadUpsertWithoutRaw_leadInput
    disconnect?: LeadWhereInput | boolean
    delete?: LeadWhereInput | boolean
    connect?: LeadWhereUniqueInput
    update?: XOR<XOR<LeadUpdateToOneWithWhereWithoutRaw_leadInput, LeadUpdateWithoutRaw_leadInput>, LeadUncheckedUpdateWithoutRaw_leadInput>
  }

  export type RawLeadCreateNestedOneWithoutLeadInput = {
    create?: XOR<RawLeadCreateWithoutLeadInput, RawLeadUncheckedCreateWithoutLeadInput>
    connectOrCreate?: RawLeadCreateOrConnectWithoutLeadInput
    connect?: RawLeadWhereUniqueInput
  }

  export type ContactCreateNestedManyWithoutLeadInput = {
    create?: XOR<ContactCreateWithoutLeadInput, ContactUncheckedCreateWithoutLeadInput> | ContactCreateWithoutLeadInput[] | ContactUncheckedCreateWithoutLeadInput[]
    connectOrCreate?: ContactCreateOrConnectWithoutLeadInput | ContactCreateOrConnectWithoutLeadInput[]
    createMany?: ContactCreateManyLeadInputEnvelope
    connect?: ContactWhereUniqueInput | ContactWhereUniqueInput[]
  }

  export type ContactUncheckedCreateNestedManyWithoutLeadInput = {
    create?: XOR<ContactCreateWithoutLeadInput, ContactUncheckedCreateWithoutLeadInput> | ContactCreateWithoutLeadInput[] | ContactUncheckedCreateWithoutLeadInput[]
    connectOrCreate?: ContactCreateOrConnectWithoutLeadInput | ContactCreateOrConnectWithoutLeadInput[]
    createMany?: ContactCreateManyLeadInputEnvelope
    connect?: ContactWhereUniqueInput | ContactWhereUniqueInput[]
  }

  export type RawLeadUpdateOneWithoutLeadNestedInput = {
    create?: XOR<RawLeadCreateWithoutLeadInput, RawLeadUncheckedCreateWithoutLeadInput>
    connectOrCreate?: RawLeadCreateOrConnectWithoutLeadInput
    upsert?: RawLeadUpsertWithoutLeadInput
    disconnect?: RawLeadWhereInput | boolean
    delete?: RawLeadWhereInput | boolean
    connect?: RawLeadWhereUniqueInput
    update?: XOR<XOR<RawLeadUpdateToOneWithWhereWithoutLeadInput, RawLeadUpdateWithoutLeadInput>, RawLeadUncheckedUpdateWithoutLeadInput>
  }

  export type ContactUpdateManyWithoutLeadNestedInput = {
    create?: XOR<ContactCreateWithoutLeadInput, ContactUncheckedCreateWithoutLeadInput> | ContactCreateWithoutLeadInput[] | ContactUncheckedCreateWithoutLeadInput[]
    connectOrCreate?: ContactCreateOrConnectWithoutLeadInput | ContactCreateOrConnectWithoutLeadInput[]
    upsert?: ContactUpsertWithWhereUniqueWithoutLeadInput | ContactUpsertWithWhereUniqueWithoutLeadInput[]
    createMany?: ContactCreateManyLeadInputEnvelope
    set?: ContactWhereUniqueInput | ContactWhereUniqueInput[]
    disconnect?: ContactWhereUniqueInput | ContactWhereUniqueInput[]
    delete?: ContactWhereUniqueInput | ContactWhereUniqueInput[]
    connect?: ContactWhereUniqueInput | ContactWhereUniqueInput[]
    update?: ContactUpdateWithWhereUniqueWithoutLeadInput | ContactUpdateWithWhereUniqueWithoutLeadInput[]
    updateMany?: ContactUpdateManyWithWhereWithoutLeadInput | ContactUpdateManyWithWhereWithoutLeadInput[]
    deleteMany?: ContactScalarWhereInput | ContactScalarWhereInput[]
  }

  export type ContactUncheckedUpdateManyWithoutLeadNestedInput = {
    create?: XOR<ContactCreateWithoutLeadInput, ContactUncheckedCreateWithoutLeadInput> | ContactCreateWithoutLeadInput[] | ContactUncheckedCreateWithoutLeadInput[]
    connectOrCreate?: ContactCreateOrConnectWithoutLeadInput | ContactCreateOrConnectWithoutLeadInput[]
    upsert?: ContactUpsertWithWhereUniqueWithoutLeadInput | ContactUpsertWithWhereUniqueWithoutLeadInput[]
    createMany?: ContactCreateManyLeadInputEnvelope
    set?: ContactWhereUniqueInput | ContactWhereUniqueInput[]
    disconnect?: ContactWhereUniqueInput | ContactWhereUniqueInput[]
    delete?: ContactWhereUniqueInput | ContactWhereUniqueInput[]
    connect?: ContactWhereUniqueInput | ContactWhereUniqueInput[]
    update?: ContactUpdateWithWhereUniqueWithoutLeadInput | ContactUpdateWithWhereUniqueWithoutLeadInput[]
    updateMany?: ContactUpdateManyWithWhereWithoutLeadInput | ContactUpdateManyWithWhereWithoutLeadInput[]
    deleteMany?: ContactScalarWhereInput | ContactScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutContactsInput = {
    create?: XOR<UserCreateWithoutContactsInput, UserUncheckedCreateWithoutContactsInput>
    connectOrCreate?: UserCreateOrConnectWithoutContactsInput
    connect?: UserWhereUniqueInput
  }

  export type LeadCreateNestedOneWithoutContactsInput = {
    create?: XOR<LeadCreateWithoutContactsInput, LeadUncheckedCreateWithoutContactsInput>
    connectOrCreate?: LeadCreateOrConnectWithoutContactsInput
    connect?: LeadWhereUniqueInput
  }

  export type FilterCreateNestedOneWithoutContactsInput = {
    create?: XOR<FilterCreateWithoutContactsInput, FilterUncheckedCreateWithoutContactsInput>
    connectOrCreate?: FilterCreateOrConnectWithoutContactsInput
    connect?: FilterWhereUniqueInput
  }

  export type ContactTagCreateNestedManyWithoutContactInput = {
    create?: XOR<ContactTagCreateWithoutContactInput, ContactTagUncheckedCreateWithoutContactInput> | ContactTagCreateWithoutContactInput[] | ContactTagUncheckedCreateWithoutContactInput[]
    connectOrCreate?: ContactTagCreateOrConnectWithoutContactInput | ContactTagCreateOrConnectWithoutContactInput[]
    createMany?: ContactTagCreateManyContactInputEnvelope
    connect?: ContactTagWhereUniqueInput | ContactTagWhereUniqueInput[]
  }

  export type InteractionCreateNestedManyWithoutContactInput = {
    create?: XOR<InteractionCreateWithoutContactInput, InteractionUncheckedCreateWithoutContactInput> | InteractionCreateWithoutContactInput[] | InteractionUncheckedCreateWithoutContactInput[]
    connectOrCreate?: InteractionCreateOrConnectWithoutContactInput | InteractionCreateOrConnectWithoutContactInput[]
    createMany?: InteractionCreateManyContactInputEnvelope
    connect?: InteractionWhereUniqueInput | InteractionWhereUniqueInput[]
  }

  export type OutreachMessageCreateNestedManyWithoutContactInput = {
    create?: XOR<OutreachMessageCreateWithoutContactInput, OutreachMessageUncheckedCreateWithoutContactInput> | OutreachMessageCreateWithoutContactInput[] | OutreachMessageUncheckedCreateWithoutContactInput[]
    connectOrCreate?: OutreachMessageCreateOrConnectWithoutContactInput | OutreachMessageCreateOrConnectWithoutContactInput[]
    createMany?: OutreachMessageCreateManyContactInputEnvelope
    connect?: OutreachMessageWhereUniqueInput | OutreachMessageWhereUniqueInput[]
  }

  export type ContactTagUncheckedCreateNestedManyWithoutContactInput = {
    create?: XOR<ContactTagCreateWithoutContactInput, ContactTagUncheckedCreateWithoutContactInput> | ContactTagCreateWithoutContactInput[] | ContactTagUncheckedCreateWithoutContactInput[]
    connectOrCreate?: ContactTagCreateOrConnectWithoutContactInput | ContactTagCreateOrConnectWithoutContactInput[]
    createMany?: ContactTagCreateManyContactInputEnvelope
    connect?: ContactTagWhereUniqueInput | ContactTagWhereUniqueInput[]
  }

  export type InteractionUncheckedCreateNestedManyWithoutContactInput = {
    create?: XOR<InteractionCreateWithoutContactInput, InteractionUncheckedCreateWithoutContactInput> | InteractionCreateWithoutContactInput[] | InteractionUncheckedCreateWithoutContactInput[]
    connectOrCreate?: InteractionCreateOrConnectWithoutContactInput | InteractionCreateOrConnectWithoutContactInput[]
    createMany?: InteractionCreateManyContactInputEnvelope
    connect?: InteractionWhereUniqueInput | InteractionWhereUniqueInput[]
  }

  export type OutreachMessageUncheckedCreateNestedManyWithoutContactInput = {
    create?: XOR<OutreachMessageCreateWithoutContactInput, OutreachMessageUncheckedCreateWithoutContactInput> | OutreachMessageCreateWithoutContactInput[] | OutreachMessageUncheckedCreateWithoutContactInput[]
    connectOrCreate?: OutreachMessageCreateOrConnectWithoutContactInput | OutreachMessageCreateOrConnectWithoutContactInput[]
    createMany?: OutreachMessageCreateManyContactInputEnvelope
    connect?: OutreachMessageWhereUniqueInput | OutreachMessageWhereUniqueInput[]
  }

  export type EnumLeadStatusFieldUpdateOperationsInput = {
    set?: $Enums.LeadStatus
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type UserUpdateOneRequiredWithoutContactsNestedInput = {
    create?: XOR<UserCreateWithoutContactsInput, UserUncheckedCreateWithoutContactsInput>
    connectOrCreate?: UserCreateOrConnectWithoutContactsInput
    upsert?: UserUpsertWithoutContactsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutContactsInput, UserUpdateWithoutContactsInput>, UserUncheckedUpdateWithoutContactsInput>
  }

  export type LeadUpdateOneRequiredWithoutContactsNestedInput = {
    create?: XOR<LeadCreateWithoutContactsInput, LeadUncheckedCreateWithoutContactsInput>
    connectOrCreate?: LeadCreateOrConnectWithoutContactsInput
    upsert?: LeadUpsertWithoutContactsInput
    connect?: LeadWhereUniqueInput
    update?: XOR<XOR<LeadUpdateToOneWithWhereWithoutContactsInput, LeadUpdateWithoutContactsInput>, LeadUncheckedUpdateWithoutContactsInput>
  }

  export type FilterUpdateOneWithoutContactsNestedInput = {
    create?: XOR<FilterCreateWithoutContactsInput, FilterUncheckedCreateWithoutContactsInput>
    connectOrCreate?: FilterCreateOrConnectWithoutContactsInput
    upsert?: FilterUpsertWithoutContactsInput
    disconnect?: FilterWhereInput | boolean
    delete?: FilterWhereInput | boolean
    connect?: FilterWhereUniqueInput
    update?: XOR<XOR<FilterUpdateToOneWithWhereWithoutContactsInput, FilterUpdateWithoutContactsInput>, FilterUncheckedUpdateWithoutContactsInput>
  }

  export type ContactTagUpdateManyWithoutContactNestedInput = {
    create?: XOR<ContactTagCreateWithoutContactInput, ContactTagUncheckedCreateWithoutContactInput> | ContactTagCreateWithoutContactInput[] | ContactTagUncheckedCreateWithoutContactInput[]
    connectOrCreate?: ContactTagCreateOrConnectWithoutContactInput | ContactTagCreateOrConnectWithoutContactInput[]
    upsert?: ContactTagUpsertWithWhereUniqueWithoutContactInput | ContactTagUpsertWithWhereUniqueWithoutContactInput[]
    createMany?: ContactTagCreateManyContactInputEnvelope
    set?: ContactTagWhereUniqueInput | ContactTagWhereUniqueInput[]
    disconnect?: ContactTagWhereUniqueInput | ContactTagWhereUniqueInput[]
    delete?: ContactTagWhereUniqueInput | ContactTagWhereUniqueInput[]
    connect?: ContactTagWhereUniqueInput | ContactTagWhereUniqueInput[]
    update?: ContactTagUpdateWithWhereUniqueWithoutContactInput | ContactTagUpdateWithWhereUniqueWithoutContactInput[]
    updateMany?: ContactTagUpdateManyWithWhereWithoutContactInput | ContactTagUpdateManyWithWhereWithoutContactInput[]
    deleteMany?: ContactTagScalarWhereInput | ContactTagScalarWhereInput[]
  }

  export type InteractionUpdateManyWithoutContactNestedInput = {
    create?: XOR<InteractionCreateWithoutContactInput, InteractionUncheckedCreateWithoutContactInput> | InteractionCreateWithoutContactInput[] | InteractionUncheckedCreateWithoutContactInput[]
    connectOrCreate?: InteractionCreateOrConnectWithoutContactInput | InteractionCreateOrConnectWithoutContactInput[]
    upsert?: InteractionUpsertWithWhereUniqueWithoutContactInput | InteractionUpsertWithWhereUniqueWithoutContactInput[]
    createMany?: InteractionCreateManyContactInputEnvelope
    set?: InteractionWhereUniqueInput | InteractionWhereUniqueInput[]
    disconnect?: InteractionWhereUniqueInput | InteractionWhereUniqueInput[]
    delete?: InteractionWhereUniqueInput | InteractionWhereUniqueInput[]
    connect?: InteractionWhereUniqueInput | InteractionWhereUniqueInput[]
    update?: InteractionUpdateWithWhereUniqueWithoutContactInput | InteractionUpdateWithWhereUniqueWithoutContactInput[]
    updateMany?: InteractionUpdateManyWithWhereWithoutContactInput | InteractionUpdateManyWithWhereWithoutContactInput[]
    deleteMany?: InteractionScalarWhereInput | InteractionScalarWhereInput[]
  }

  export type OutreachMessageUpdateManyWithoutContactNestedInput = {
    create?: XOR<OutreachMessageCreateWithoutContactInput, OutreachMessageUncheckedCreateWithoutContactInput> | OutreachMessageCreateWithoutContactInput[] | OutreachMessageUncheckedCreateWithoutContactInput[]
    connectOrCreate?: OutreachMessageCreateOrConnectWithoutContactInput | OutreachMessageCreateOrConnectWithoutContactInput[]
    upsert?: OutreachMessageUpsertWithWhereUniqueWithoutContactInput | OutreachMessageUpsertWithWhereUniqueWithoutContactInput[]
    createMany?: OutreachMessageCreateManyContactInputEnvelope
    set?: OutreachMessageWhereUniqueInput | OutreachMessageWhereUniqueInput[]
    disconnect?: OutreachMessageWhereUniqueInput | OutreachMessageWhereUniqueInput[]
    delete?: OutreachMessageWhereUniqueInput | OutreachMessageWhereUniqueInput[]
    connect?: OutreachMessageWhereUniqueInput | OutreachMessageWhereUniqueInput[]
    update?: OutreachMessageUpdateWithWhereUniqueWithoutContactInput | OutreachMessageUpdateWithWhereUniqueWithoutContactInput[]
    updateMany?: OutreachMessageUpdateManyWithWhereWithoutContactInput | OutreachMessageUpdateManyWithWhereWithoutContactInput[]
    deleteMany?: OutreachMessageScalarWhereInput | OutreachMessageScalarWhereInput[]
  }

  export type ContactTagUncheckedUpdateManyWithoutContactNestedInput = {
    create?: XOR<ContactTagCreateWithoutContactInput, ContactTagUncheckedCreateWithoutContactInput> | ContactTagCreateWithoutContactInput[] | ContactTagUncheckedCreateWithoutContactInput[]
    connectOrCreate?: ContactTagCreateOrConnectWithoutContactInput | ContactTagCreateOrConnectWithoutContactInput[]
    upsert?: ContactTagUpsertWithWhereUniqueWithoutContactInput | ContactTagUpsertWithWhereUniqueWithoutContactInput[]
    createMany?: ContactTagCreateManyContactInputEnvelope
    set?: ContactTagWhereUniqueInput | ContactTagWhereUniqueInput[]
    disconnect?: ContactTagWhereUniqueInput | ContactTagWhereUniqueInput[]
    delete?: ContactTagWhereUniqueInput | ContactTagWhereUniqueInput[]
    connect?: ContactTagWhereUniqueInput | ContactTagWhereUniqueInput[]
    update?: ContactTagUpdateWithWhereUniqueWithoutContactInput | ContactTagUpdateWithWhereUniqueWithoutContactInput[]
    updateMany?: ContactTagUpdateManyWithWhereWithoutContactInput | ContactTagUpdateManyWithWhereWithoutContactInput[]
    deleteMany?: ContactTagScalarWhereInput | ContactTagScalarWhereInput[]
  }

  export type InteractionUncheckedUpdateManyWithoutContactNestedInput = {
    create?: XOR<InteractionCreateWithoutContactInput, InteractionUncheckedCreateWithoutContactInput> | InteractionCreateWithoutContactInput[] | InteractionUncheckedCreateWithoutContactInput[]
    connectOrCreate?: InteractionCreateOrConnectWithoutContactInput | InteractionCreateOrConnectWithoutContactInput[]
    upsert?: InteractionUpsertWithWhereUniqueWithoutContactInput | InteractionUpsertWithWhereUniqueWithoutContactInput[]
    createMany?: InteractionCreateManyContactInputEnvelope
    set?: InteractionWhereUniqueInput | InteractionWhereUniqueInput[]
    disconnect?: InteractionWhereUniqueInput | InteractionWhereUniqueInput[]
    delete?: InteractionWhereUniqueInput | InteractionWhereUniqueInput[]
    connect?: InteractionWhereUniqueInput | InteractionWhereUniqueInput[]
    update?: InteractionUpdateWithWhereUniqueWithoutContactInput | InteractionUpdateWithWhereUniqueWithoutContactInput[]
    updateMany?: InteractionUpdateManyWithWhereWithoutContactInput | InteractionUpdateManyWithWhereWithoutContactInput[]
    deleteMany?: InteractionScalarWhereInput | InteractionScalarWhereInput[]
  }

  export type OutreachMessageUncheckedUpdateManyWithoutContactNestedInput = {
    create?: XOR<OutreachMessageCreateWithoutContactInput, OutreachMessageUncheckedCreateWithoutContactInput> | OutreachMessageCreateWithoutContactInput[] | OutreachMessageUncheckedCreateWithoutContactInput[]
    connectOrCreate?: OutreachMessageCreateOrConnectWithoutContactInput | OutreachMessageCreateOrConnectWithoutContactInput[]
    upsert?: OutreachMessageUpsertWithWhereUniqueWithoutContactInput | OutreachMessageUpsertWithWhereUniqueWithoutContactInput[]
    createMany?: OutreachMessageCreateManyContactInputEnvelope
    set?: OutreachMessageWhereUniqueInput | OutreachMessageWhereUniqueInput[]
    disconnect?: OutreachMessageWhereUniqueInput | OutreachMessageWhereUniqueInput[]
    delete?: OutreachMessageWhereUniqueInput | OutreachMessageWhereUniqueInput[]
    connect?: OutreachMessageWhereUniqueInput | OutreachMessageWhereUniqueInput[]
    update?: OutreachMessageUpdateWithWhereUniqueWithoutContactInput | OutreachMessageUpdateWithWhereUniqueWithoutContactInput[]
    updateMany?: OutreachMessageUpdateManyWithWhereWithoutContactInput | OutreachMessageUpdateManyWithWhereWithoutContactInput[]
    deleteMany?: OutreachMessageScalarWhereInput | OutreachMessageScalarWhereInput[]
  }

  export type ContactCreateNestedOneWithoutTagsInput = {
    create?: XOR<ContactCreateWithoutTagsInput, ContactUncheckedCreateWithoutTagsInput>
    connectOrCreate?: ContactCreateOrConnectWithoutTagsInput
    connect?: ContactWhereUniqueInput
  }

  export type ContactUpdateOneRequiredWithoutTagsNestedInput = {
    create?: XOR<ContactCreateWithoutTagsInput, ContactUncheckedCreateWithoutTagsInput>
    connectOrCreate?: ContactCreateOrConnectWithoutTagsInput
    upsert?: ContactUpsertWithoutTagsInput
    connect?: ContactWhereUniqueInput
    update?: XOR<XOR<ContactUpdateToOneWithWhereWithoutTagsInput, ContactUpdateWithoutTagsInput>, ContactUncheckedUpdateWithoutTagsInput>
  }

  export type ContactCreateNestedOneWithoutInteractionsInput = {
    create?: XOR<ContactCreateWithoutInteractionsInput, ContactUncheckedCreateWithoutInteractionsInput>
    connectOrCreate?: ContactCreateOrConnectWithoutInteractionsInput
    connect?: ContactWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutInteractionsInput = {
    create?: XOR<UserCreateWithoutInteractionsInput, UserUncheckedCreateWithoutInteractionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutInteractionsInput
    connect?: UserWhereUniqueInput
  }

  export type EnumInteractionTypeFieldUpdateOperationsInput = {
    set?: $Enums.InteractionType
  }

  export type ContactUpdateOneRequiredWithoutInteractionsNestedInput = {
    create?: XOR<ContactCreateWithoutInteractionsInput, ContactUncheckedCreateWithoutInteractionsInput>
    connectOrCreate?: ContactCreateOrConnectWithoutInteractionsInput
    upsert?: ContactUpsertWithoutInteractionsInput
    connect?: ContactWhereUniqueInput
    update?: XOR<XOR<ContactUpdateToOneWithWhereWithoutInteractionsInput, ContactUpdateWithoutInteractionsInput>, ContactUncheckedUpdateWithoutInteractionsInput>
  }

  export type UserUpdateOneRequiredWithoutInteractionsNestedInput = {
    create?: XOR<UserCreateWithoutInteractionsInput, UserUncheckedCreateWithoutInteractionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutInteractionsInput
    upsert?: UserUpsertWithoutInteractionsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutInteractionsInput, UserUpdateWithoutInteractionsInput>, UserUncheckedUpdateWithoutInteractionsInput>
  }

  export type UserCreateNestedOneWithoutOutreach_messagesInput = {
    create?: XOR<UserCreateWithoutOutreach_messagesInput, UserUncheckedCreateWithoutOutreach_messagesInput>
    connectOrCreate?: UserCreateOrConnectWithoutOutreach_messagesInput
    connect?: UserWhereUniqueInput
  }

  export type ContactCreateNestedOneWithoutOutreach_messagesInput = {
    create?: XOR<ContactCreateWithoutOutreach_messagesInput, ContactUncheckedCreateWithoutOutreach_messagesInput>
    connectOrCreate?: ContactCreateOrConnectWithoutOutreach_messagesInput
    connect?: ContactWhereUniqueInput
  }

  export type EnumChannelFieldUpdateOperationsInput = {
    set?: $Enums.Channel
  }

  export type EnumMsgStatusFieldUpdateOperationsInput = {
    set?: $Enums.MsgStatus
  }

  export type UserUpdateOneRequiredWithoutOutreach_messagesNestedInput = {
    create?: XOR<UserCreateWithoutOutreach_messagesInput, UserUncheckedCreateWithoutOutreach_messagesInput>
    connectOrCreate?: UserCreateOrConnectWithoutOutreach_messagesInput
    upsert?: UserUpsertWithoutOutreach_messagesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutOutreach_messagesInput, UserUpdateWithoutOutreach_messagesInput>, UserUncheckedUpdateWithoutOutreach_messagesInput>
  }

  export type ContactUpdateOneRequiredWithoutOutreach_messagesNestedInput = {
    create?: XOR<ContactCreateWithoutOutreach_messagesInput, ContactUncheckedCreateWithoutOutreach_messagesInput>
    connectOrCreate?: ContactCreateOrConnectWithoutOutreach_messagesInput
    upsert?: ContactUpsertWithoutOutreach_messagesInput
    connect?: ContactWhereUniqueInput
    update?: XOR<XOR<ContactUpdateToOneWithWhereWithoutOutreach_messagesInput, ContactUpdateWithoutOutreach_messagesInput>, ContactUncheckedUpdateWithoutOutreach_messagesInput>
  }

  export type UserCreateNestedOneWithoutOutreach_sequencesInput = {
    create?: XOR<UserCreateWithoutOutreach_sequencesInput, UserUncheckedCreateWithoutOutreach_sequencesInput>
    connectOrCreate?: UserCreateOrConnectWithoutOutreach_sequencesInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutOutreach_sequencesNestedInput = {
    create?: XOR<UserCreateWithoutOutreach_sequencesInput, UserUncheckedCreateWithoutOutreach_sequencesInput>
    connectOrCreate?: UserCreateOrConnectWithoutOutreach_sequencesInput
    upsert?: UserUpsertWithoutOutreach_sequencesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutOutreach_sequencesInput, UserUpdateWithoutOutreach_sequencesInput>, UserUncheckedUpdateWithoutOutreach_sequencesInput>
  }

  export type FilterCreateNestedOneWithoutJobsInput = {
    create?: XOR<FilterCreateWithoutJobsInput, FilterUncheckedCreateWithoutJobsInput>
    connectOrCreate?: FilterCreateOrConnectWithoutJobsInput
    connect?: FilterWhereUniqueInput
  }

  export type EnumJobStatusFieldUpdateOperationsInput = {
    set?: $Enums.JobStatus
  }

  export type FilterUpdateOneRequiredWithoutJobsNestedInput = {
    create?: XOR<FilterCreateWithoutJobsInput, FilterUncheckedCreateWithoutJobsInput>
    connectOrCreate?: FilterCreateOrConnectWithoutJobsInput
    upsert?: FilterUpsertWithoutJobsInput
    connect?: FilterWhereUniqueInput
    update?: XOR<XOR<FilterUpdateToOneWithWhereWithoutJobsInput, FilterUpdateWithoutJobsInput>, FilterUncheckedUpdateWithoutJobsInput>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedEnumAuthRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.AuthRole | EnumAuthRoleFieldRefInput<$PrismaModel>
    in?: $Enums.AuthRole[] | ListEnumAuthRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.AuthRole[] | ListEnumAuthRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumAuthRoleFilter<$PrismaModel> | $Enums.AuthRole
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumAuthRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AuthRole | EnumAuthRoleFieldRefInput<$PrismaModel>
    in?: $Enums.AuthRole[] | ListEnumAuthRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.AuthRole[] | ListEnumAuthRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumAuthRoleWithAggregatesFilter<$PrismaModel> | $Enums.AuthRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAuthRoleFilter<$PrismaModel>
    _max?: NestedEnumAuthRoleFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumSourceTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.SourceType | EnumSourceTypeFieldRefInput<$PrismaModel>
    in?: $Enums.SourceType[] | ListEnumSourceTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.SourceType[] | ListEnumSourceTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumSourceTypeFilter<$PrismaModel> | $Enums.SourceType
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedEnumSourceTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SourceType | EnumSourceTypeFieldRefInput<$PrismaModel>
    in?: $Enums.SourceType[] | ListEnumSourceTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.SourceType[] | ListEnumSourceTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumSourceTypeWithAggregatesFilter<$PrismaModel> | $Enums.SourceType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSourceTypeFilter<$PrismaModel>
    _max?: NestedEnumSourceTypeFilter<$PrismaModel>
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedEnumLeadStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.LeadStatus | EnumLeadStatusFieldRefInput<$PrismaModel>
    in?: $Enums.LeadStatus[] | ListEnumLeadStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.LeadStatus[] | ListEnumLeadStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumLeadStatusFilter<$PrismaModel> | $Enums.LeadStatus
  }

  export type NestedEnumLeadStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.LeadStatus | EnumLeadStatusFieldRefInput<$PrismaModel>
    in?: $Enums.LeadStatus[] | ListEnumLeadStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.LeadStatus[] | ListEnumLeadStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumLeadStatusWithAggregatesFilter<$PrismaModel> | $Enums.LeadStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumLeadStatusFilter<$PrismaModel>
    _max?: NestedEnumLeadStatusFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumInteractionTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.InteractionType | EnumInteractionTypeFieldRefInput<$PrismaModel>
    in?: $Enums.InteractionType[] | ListEnumInteractionTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.InteractionType[] | ListEnumInteractionTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumInteractionTypeFilter<$PrismaModel> | $Enums.InteractionType
  }

  export type NestedEnumInteractionTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.InteractionType | EnumInteractionTypeFieldRefInput<$PrismaModel>
    in?: $Enums.InteractionType[] | ListEnumInteractionTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.InteractionType[] | ListEnumInteractionTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumInteractionTypeWithAggregatesFilter<$PrismaModel> | $Enums.InteractionType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumInteractionTypeFilter<$PrismaModel>
    _max?: NestedEnumInteractionTypeFilter<$PrismaModel>
  }

  export type NestedEnumChannelFilter<$PrismaModel = never> = {
    equals?: $Enums.Channel | EnumChannelFieldRefInput<$PrismaModel>
    in?: $Enums.Channel[] | ListEnumChannelFieldRefInput<$PrismaModel>
    notIn?: $Enums.Channel[] | ListEnumChannelFieldRefInput<$PrismaModel>
    not?: NestedEnumChannelFilter<$PrismaModel> | $Enums.Channel
  }

  export type NestedEnumMsgStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.MsgStatus | EnumMsgStatusFieldRefInput<$PrismaModel>
    in?: $Enums.MsgStatus[] | ListEnumMsgStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.MsgStatus[] | ListEnumMsgStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumMsgStatusFilter<$PrismaModel> | $Enums.MsgStatus
  }

  export type NestedEnumChannelWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Channel | EnumChannelFieldRefInput<$PrismaModel>
    in?: $Enums.Channel[] | ListEnumChannelFieldRefInput<$PrismaModel>
    notIn?: $Enums.Channel[] | ListEnumChannelFieldRefInput<$PrismaModel>
    not?: NestedEnumChannelWithAggregatesFilter<$PrismaModel> | $Enums.Channel
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumChannelFilter<$PrismaModel>
    _max?: NestedEnumChannelFilter<$PrismaModel>
  }

  export type NestedEnumMsgStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MsgStatus | EnumMsgStatusFieldRefInput<$PrismaModel>
    in?: $Enums.MsgStatus[] | ListEnumMsgStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.MsgStatus[] | ListEnumMsgStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumMsgStatusWithAggregatesFilter<$PrismaModel> | $Enums.MsgStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMsgStatusFilter<$PrismaModel>
    _max?: NestedEnumMsgStatusFilter<$PrismaModel>
  }

  export type NestedEnumJobStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.JobStatus | EnumJobStatusFieldRefInput<$PrismaModel>
    in?: $Enums.JobStatus[] | ListEnumJobStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.JobStatus[] | ListEnumJobStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumJobStatusFilter<$PrismaModel> | $Enums.JobStatus
  }

  export type NestedEnumJobStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.JobStatus | EnumJobStatusFieldRefInput<$PrismaModel>
    in?: $Enums.JobStatus[] | ListEnumJobStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.JobStatus[] | ListEnumJobStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumJobStatusWithAggregatesFilter<$PrismaModel> | $Enums.JobStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumJobStatusFilter<$PrismaModel>
    _max?: NestedEnumJobStatusFilter<$PrismaModel>
  }

  export type FilterCreateWithoutUserInput = {
    uuid?: string
    name: string
    source_type: $Enums.SourceType
    query_config: JsonNullValueInput | InputJsonValue
    enabled?: boolean
    cron_schedule?: string | null
    channels?: FilterCreatechannelsInput | $Enums.Channel[]
    ai_instructions?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    raw_leads?: RawLeadCreateNestedManyWithoutFilterInput
    contacts?: ContactCreateNestedManyWithoutFilterInput
    jobs?: FilterJobCreateNestedManyWithoutFilterInput
  }

  export type FilterUncheckedCreateWithoutUserInput = {
    id?: number
    uuid?: string
    name: string
    source_type: $Enums.SourceType
    query_config: JsonNullValueInput | InputJsonValue
    enabled?: boolean
    cron_schedule?: string | null
    channels?: FilterCreatechannelsInput | $Enums.Channel[]
    ai_instructions?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    raw_leads?: RawLeadUncheckedCreateNestedManyWithoutFilterInput
    contacts?: ContactUncheckedCreateNestedManyWithoutFilterInput
    jobs?: FilterJobUncheckedCreateNestedManyWithoutFilterInput
  }

  export type FilterCreateOrConnectWithoutUserInput = {
    where: FilterWhereUniqueInput
    create: XOR<FilterCreateWithoutUserInput, FilterUncheckedCreateWithoutUserInput>
  }

  export type FilterCreateManyUserInputEnvelope = {
    data: FilterCreateManyUserInput | FilterCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type ContactCreateWithoutUserInput = {
    uuid?: string
    status?: $Enums.LeadStatus
    score?: number | null
    notes?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    lead: LeadCreateNestedOneWithoutContactsInput
    filter?: FilterCreateNestedOneWithoutContactsInput
    tags?: ContactTagCreateNestedManyWithoutContactInput
    interactions?: InteractionCreateNestedManyWithoutContactInput
    outreach_messages?: OutreachMessageCreateNestedManyWithoutContactInput
  }

  export type ContactUncheckedCreateWithoutUserInput = {
    id?: number
    uuid?: string
    lead_uuid: string
    filter_uuid?: string | null
    status?: $Enums.LeadStatus
    score?: number | null
    notes?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    tags?: ContactTagUncheckedCreateNestedManyWithoutContactInput
    interactions?: InteractionUncheckedCreateNestedManyWithoutContactInput
    outreach_messages?: OutreachMessageUncheckedCreateNestedManyWithoutContactInput
  }

  export type ContactCreateOrConnectWithoutUserInput = {
    where: ContactWhereUniqueInput
    create: XOR<ContactCreateWithoutUserInput, ContactUncheckedCreateWithoutUserInput>
  }

  export type ContactCreateManyUserInputEnvelope = {
    data: ContactCreateManyUserInput | ContactCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type OutreachMessageCreateWithoutUserInput = {
    uuid?: string
    channel: $Enums.Channel
    subject?: string | null
    content: string
    status?: $Enums.MsgStatus
    scheduled_at?: Date | string | null
    sent_at?: Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
    contact: ContactCreateNestedOneWithoutOutreach_messagesInput
  }

  export type OutreachMessageUncheckedCreateWithoutUserInput = {
    id?: number
    uuid?: string
    contact_uuid: string
    channel: $Enums.Channel
    subject?: string | null
    content: string
    status?: $Enums.MsgStatus
    scheduled_at?: Date | string | null
    sent_at?: Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type OutreachMessageCreateOrConnectWithoutUserInput = {
    where: OutreachMessageWhereUniqueInput
    create: XOR<OutreachMessageCreateWithoutUserInput, OutreachMessageUncheckedCreateWithoutUserInput>
  }

  export type OutreachMessageCreateManyUserInputEnvelope = {
    data: OutreachMessageCreateManyUserInput | OutreachMessageCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type OutreachSequenceCreateWithoutUserInput = {
    uuid?: string
    name: string
    steps: JsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type OutreachSequenceUncheckedCreateWithoutUserInput = {
    id?: number
    uuid?: string
    name: string
    steps: JsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type OutreachSequenceCreateOrConnectWithoutUserInput = {
    where: OutreachSequenceWhereUniqueInput
    create: XOR<OutreachSequenceCreateWithoutUserInput, OutreachSequenceUncheckedCreateWithoutUserInput>
  }

  export type OutreachSequenceCreateManyUserInputEnvelope = {
    data: OutreachSequenceCreateManyUserInput | OutreachSequenceCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type InteractionCreateWithoutUserInput = {
    uuid?: string
    type: $Enums.InteractionType
    content?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
    contact: ContactCreateNestedOneWithoutInteractionsInput
  }

  export type InteractionUncheckedCreateWithoutUserInput = {
    id?: number
    uuid?: string
    contact_uuid: string
    type: $Enums.InteractionType
    content?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type InteractionCreateOrConnectWithoutUserInput = {
    where: InteractionWhereUniqueInput
    create: XOR<InteractionCreateWithoutUserInput, InteractionUncheckedCreateWithoutUserInput>
  }

  export type InteractionCreateManyUserInputEnvelope = {
    data: InteractionCreateManyUserInput | InteractionCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type FilterUpsertWithWhereUniqueWithoutUserInput = {
    where: FilterWhereUniqueInput
    update: XOR<FilterUpdateWithoutUserInput, FilterUncheckedUpdateWithoutUserInput>
    create: XOR<FilterCreateWithoutUserInput, FilterUncheckedCreateWithoutUserInput>
  }

  export type FilterUpdateWithWhereUniqueWithoutUserInput = {
    where: FilterWhereUniqueInput
    data: XOR<FilterUpdateWithoutUserInput, FilterUncheckedUpdateWithoutUserInput>
  }

  export type FilterUpdateManyWithWhereWithoutUserInput = {
    where: FilterScalarWhereInput
    data: XOR<FilterUpdateManyMutationInput, FilterUncheckedUpdateManyWithoutUserInput>
  }

  export type FilterScalarWhereInput = {
    AND?: FilterScalarWhereInput | FilterScalarWhereInput[]
    OR?: FilterScalarWhereInput[]
    NOT?: FilterScalarWhereInput | FilterScalarWhereInput[]
    id?: IntFilter<"Filter"> | number
    uuid?: StringFilter<"Filter"> | string
    user_uuid?: StringFilter<"Filter"> | string
    name?: StringFilter<"Filter"> | string
    source_type?: EnumSourceTypeFilter<"Filter"> | $Enums.SourceType
    query_config?: JsonFilter<"Filter">
    enabled?: BoolFilter<"Filter"> | boolean
    cron_schedule?: StringNullableFilter<"Filter"> | string | null
    channels?: EnumChannelNullableListFilter<"Filter">
    ai_instructions?: StringNullableFilter<"Filter"> | string | null
    created_at?: DateTimeFilter<"Filter"> | Date | string
    updated_at?: DateTimeFilter<"Filter"> | Date | string
  }

  export type ContactUpsertWithWhereUniqueWithoutUserInput = {
    where: ContactWhereUniqueInput
    update: XOR<ContactUpdateWithoutUserInput, ContactUncheckedUpdateWithoutUserInput>
    create: XOR<ContactCreateWithoutUserInput, ContactUncheckedCreateWithoutUserInput>
  }

  export type ContactUpdateWithWhereUniqueWithoutUserInput = {
    where: ContactWhereUniqueInput
    data: XOR<ContactUpdateWithoutUserInput, ContactUncheckedUpdateWithoutUserInput>
  }

  export type ContactUpdateManyWithWhereWithoutUserInput = {
    where: ContactScalarWhereInput
    data: XOR<ContactUpdateManyMutationInput, ContactUncheckedUpdateManyWithoutUserInput>
  }

  export type ContactScalarWhereInput = {
    AND?: ContactScalarWhereInput | ContactScalarWhereInput[]
    OR?: ContactScalarWhereInput[]
    NOT?: ContactScalarWhereInput | ContactScalarWhereInput[]
    id?: IntFilter<"Contact"> | number
    uuid?: StringFilter<"Contact"> | string
    user_uuid?: StringFilter<"Contact"> | string
    lead_uuid?: StringFilter<"Contact"> | string
    filter_uuid?: StringNullableFilter<"Contact"> | string | null
    status?: EnumLeadStatusFilter<"Contact"> | $Enums.LeadStatus
    score?: IntNullableFilter<"Contact"> | number | null
    notes?: StringNullableFilter<"Contact"> | string | null
    created_at?: DateTimeFilter<"Contact"> | Date | string
    updated_at?: DateTimeFilter<"Contact"> | Date | string
  }

  export type OutreachMessageUpsertWithWhereUniqueWithoutUserInput = {
    where: OutreachMessageWhereUniqueInput
    update: XOR<OutreachMessageUpdateWithoutUserInput, OutreachMessageUncheckedUpdateWithoutUserInput>
    create: XOR<OutreachMessageCreateWithoutUserInput, OutreachMessageUncheckedCreateWithoutUserInput>
  }

  export type OutreachMessageUpdateWithWhereUniqueWithoutUserInput = {
    where: OutreachMessageWhereUniqueInput
    data: XOR<OutreachMessageUpdateWithoutUserInput, OutreachMessageUncheckedUpdateWithoutUserInput>
  }

  export type OutreachMessageUpdateManyWithWhereWithoutUserInput = {
    where: OutreachMessageScalarWhereInput
    data: XOR<OutreachMessageUpdateManyMutationInput, OutreachMessageUncheckedUpdateManyWithoutUserInput>
  }

  export type OutreachMessageScalarWhereInput = {
    AND?: OutreachMessageScalarWhereInput | OutreachMessageScalarWhereInput[]
    OR?: OutreachMessageScalarWhereInput[]
    NOT?: OutreachMessageScalarWhereInput | OutreachMessageScalarWhereInput[]
    id?: IntFilter<"OutreachMessage"> | number
    uuid?: StringFilter<"OutreachMessage"> | string
    user_uuid?: StringFilter<"OutreachMessage"> | string
    contact_uuid?: StringFilter<"OutreachMessage"> | string
    channel?: EnumChannelFilter<"OutreachMessage"> | $Enums.Channel
    subject?: StringNullableFilter<"OutreachMessage"> | string | null
    content?: StringFilter<"OutreachMessage"> | string
    status?: EnumMsgStatusFilter<"OutreachMessage"> | $Enums.MsgStatus
    scheduled_at?: DateTimeNullableFilter<"OutreachMessage"> | Date | string | null
    sent_at?: DateTimeNullableFilter<"OutreachMessage"> | Date | string | null
    metadata?: JsonNullableFilter<"OutreachMessage">
    created_at?: DateTimeFilter<"OutreachMessage"> | Date | string
    updated_at?: DateTimeFilter<"OutreachMessage"> | Date | string
  }

  export type OutreachSequenceUpsertWithWhereUniqueWithoutUserInput = {
    where: OutreachSequenceWhereUniqueInput
    update: XOR<OutreachSequenceUpdateWithoutUserInput, OutreachSequenceUncheckedUpdateWithoutUserInput>
    create: XOR<OutreachSequenceCreateWithoutUserInput, OutreachSequenceUncheckedCreateWithoutUserInput>
  }

  export type OutreachSequenceUpdateWithWhereUniqueWithoutUserInput = {
    where: OutreachSequenceWhereUniqueInput
    data: XOR<OutreachSequenceUpdateWithoutUserInput, OutreachSequenceUncheckedUpdateWithoutUserInput>
  }

  export type OutreachSequenceUpdateManyWithWhereWithoutUserInput = {
    where: OutreachSequenceScalarWhereInput
    data: XOR<OutreachSequenceUpdateManyMutationInput, OutreachSequenceUncheckedUpdateManyWithoutUserInput>
  }

  export type OutreachSequenceScalarWhereInput = {
    AND?: OutreachSequenceScalarWhereInput | OutreachSequenceScalarWhereInput[]
    OR?: OutreachSequenceScalarWhereInput[]
    NOT?: OutreachSequenceScalarWhereInput | OutreachSequenceScalarWhereInput[]
    id?: IntFilter<"OutreachSequence"> | number
    uuid?: StringFilter<"OutreachSequence"> | string
    user_uuid?: StringFilter<"OutreachSequence"> | string
    name?: StringFilter<"OutreachSequence"> | string
    steps?: JsonFilter<"OutreachSequence">
    created_at?: DateTimeFilter<"OutreachSequence"> | Date | string
    updated_at?: DateTimeFilter<"OutreachSequence"> | Date | string
  }

  export type InteractionUpsertWithWhereUniqueWithoutUserInput = {
    where: InteractionWhereUniqueInput
    update: XOR<InteractionUpdateWithoutUserInput, InteractionUncheckedUpdateWithoutUserInput>
    create: XOR<InteractionCreateWithoutUserInput, InteractionUncheckedCreateWithoutUserInput>
  }

  export type InteractionUpdateWithWhereUniqueWithoutUserInput = {
    where: InteractionWhereUniqueInput
    data: XOR<InteractionUpdateWithoutUserInput, InteractionUncheckedUpdateWithoutUserInput>
  }

  export type InteractionUpdateManyWithWhereWithoutUserInput = {
    where: InteractionScalarWhereInput
    data: XOR<InteractionUpdateManyMutationInput, InteractionUncheckedUpdateManyWithoutUserInput>
  }

  export type InteractionScalarWhereInput = {
    AND?: InteractionScalarWhereInput | InteractionScalarWhereInput[]
    OR?: InteractionScalarWhereInput[]
    NOT?: InteractionScalarWhereInput | InteractionScalarWhereInput[]
    id?: IntFilter<"Interaction"> | number
    uuid?: StringFilter<"Interaction"> | string
    contact_uuid?: StringFilter<"Interaction"> | string
    user_uuid?: StringFilter<"Interaction"> | string
    type?: EnumInteractionTypeFilter<"Interaction"> | $Enums.InteractionType
    content?: StringNullableFilter<"Interaction"> | string | null
    metadata?: JsonNullableFilter<"Interaction">
    created_at?: DateTimeFilter<"Interaction"> | Date | string
    updated_at?: DateTimeFilter<"Interaction"> | Date | string
  }

  export type UserCreateWithoutFiltersInput = {
    uuid?: string
    email: string
    phone?: string | null
    password: string
    role?: $Enums.AuthRole
    created_at?: Date | string
    updated_at?: Date | string
    contacts?: ContactCreateNestedManyWithoutUserInput
    outreach_messages?: OutreachMessageCreateNestedManyWithoutUserInput
    outreach_sequences?: OutreachSequenceCreateNestedManyWithoutUserInput
    interactions?: InteractionCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutFiltersInput = {
    id?: number
    uuid?: string
    email: string
    phone?: string | null
    password: string
    role?: $Enums.AuthRole
    created_at?: Date | string
    updated_at?: Date | string
    contacts?: ContactUncheckedCreateNestedManyWithoutUserInput
    outreach_messages?: OutreachMessageUncheckedCreateNestedManyWithoutUserInput
    outreach_sequences?: OutreachSequenceUncheckedCreateNestedManyWithoutUserInput
    interactions?: InteractionUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutFiltersInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutFiltersInput, UserUncheckedCreateWithoutFiltersInput>
  }

  export type RawLeadCreateWithoutFilterInput = {
    uuid?: string
    source_type: $Enums.SourceType
    raw_data: JsonNullValueInput | InputJsonValue
    processed_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
    lead?: LeadCreateNestedOneWithoutRaw_leadInput
  }

  export type RawLeadUncheckedCreateWithoutFilterInput = {
    id?: number
    uuid?: string
    source_type: $Enums.SourceType
    raw_data: JsonNullValueInput | InputJsonValue
    processed_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
    lead?: LeadUncheckedCreateNestedOneWithoutRaw_leadInput
  }

  export type RawLeadCreateOrConnectWithoutFilterInput = {
    where: RawLeadWhereUniqueInput
    create: XOR<RawLeadCreateWithoutFilterInput, RawLeadUncheckedCreateWithoutFilterInput>
  }

  export type RawLeadCreateManyFilterInputEnvelope = {
    data: RawLeadCreateManyFilterInput | RawLeadCreateManyFilterInput[]
    skipDuplicates?: boolean
  }

  export type ContactCreateWithoutFilterInput = {
    uuid?: string
    status?: $Enums.LeadStatus
    score?: number | null
    notes?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    user: UserCreateNestedOneWithoutContactsInput
    lead: LeadCreateNestedOneWithoutContactsInput
    tags?: ContactTagCreateNestedManyWithoutContactInput
    interactions?: InteractionCreateNestedManyWithoutContactInput
    outreach_messages?: OutreachMessageCreateNestedManyWithoutContactInput
  }

  export type ContactUncheckedCreateWithoutFilterInput = {
    id?: number
    uuid?: string
    user_uuid: string
    lead_uuid: string
    status?: $Enums.LeadStatus
    score?: number | null
    notes?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    tags?: ContactTagUncheckedCreateNestedManyWithoutContactInput
    interactions?: InteractionUncheckedCreateNestedManyWithoutContactInput
    outreach_messages?: OutreachMessageUncheckedCreateNestedManyWithoutContactInput
  }

  export type ContactCreateOrConnectWithoutFilterInput = {
    where: ContactWhereUniqueInput
    create: XOR<ContactCreateWithoutFilterInput, ContactUncheckedCreateWithoutFilterInput>
  }

  export type ContactCreateManyFilterInputEnvelope = {
    data: ContactCreateManyFilterInput | ContactCreateManyFilterInput[]
    skipDuplicates?: boolean
  }

  export type FilterJobCreateWithoutFilterInput = {
    uuid?: string
    status?: $Enums.JobStatus
    leads_found?: number
    duration?: number
    error?: string | null
    started_at?: Date | string
    completed_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type FilterJobUncheckedCreateWithoutFilterInput = {
    id?: number
    uuid?: string
    status?: $Enums.JobStatus
    leads_found?: number
    duration?: number
    error?: string | null
    started_at?: Date | string
    completed_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type FilterJobCreateOrConnectWithoutFilterInput = {
    where: FilterJobWhereUniqueInput
    create: XOR<FilterJobCreateWithoutFilterInput, FilterJobUncheckedCreateWithoutFilterInput>
  }

  export type FilterJobCreateManyFilterInputEnvelope = {
    data: FilterJobCreateManyFilterInput | FilterJobCreateManyFilterInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutFiltersInput = {
    update: XOR<UserUpdateWithoutFiltersInput, UserUncheckedUpdateWithoutFiltersInput>
    create: XOR<UserCreateWithoutFiltersInput, UserUncheckedCreateWithoutFiltersInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutFiltersInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutFiltersInput, UserUncheckedUpdateWithoutFiltersInput>
  }

  export type UserUpdateWithoutFiltersInput = {
    uuid?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumAuthRoleFieldUpdateOperationsInput | $Enums.AuthRole
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    contacts?: ContactUpdateManyWithoutUserNestedInput
    outreach_messages?: OutreachMessageUpdateManyWithoutUserNestedInput
    outreach_sequences?: OutreachSequenceUpdateManyWithoutUserNestedInput
    interactions?: InteractionUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutFiltersInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumAuthRoleFieldUpdateOperationsInput | $Enums.AuthRole
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    contacts?: ContactUncheckedUpdateManyWithoutUserNestedInput
    outreach_messages?: OutreachMessageUncheckedUpdateManyWithoutUserNestedInput
    outreach_sequences?: OutreachSequenceUncheckedUpdateManyWithoutUserNestedInput
    interactions?: InteractionUncheckedUpdateManyWithoutUserNestedInput
  }

  export type RawLeadUpsertWithWhereUniqueWithoutFilterInput = {
    where: RawLeadWhereUniqueInput
    update: XOR<RawLeadUpdateWithoutFilterInput, RawLeadUncheckedUpdateWithoutFilterInput>
    create: XOR<RawLeadCreateWithoutFilterInput, RawLeadUncheckedCreateWithoutFilterInput>
  }

  export type RawLeadUpdateWithWhereUniqueWithoutFilterInput = {
    where: RawLeadWhereUniqueInput
    data: XOR<RawLeadUpdateWithoutFilterInput, RawLeadUncheckedUpdateWithoutFilterInput>
  }

  export type RawLeadUpdateManyWithWhereWithoutFilterInput = {
    where: RawLeadScalarWhereInput
    data: XOR<RawLeadUpdateManyMutationInput, RawLeadUncheckedUpdateManyWithoutFilterInput>
  }

  export type RawLeadScalarWhereInput = {
    AND?: RawLeadScalarWhereInput | RawLeadScalarWhereInput[]
    OR?: RawLeadScalarWhereInput[]
    NOT?: RawLeadScalarWhereInput | RawLeadScalarWhereInput[]
    id?: IntFilter<"RawLead"> | number
    uuid?: StringFilter<"RawLead"> | string
    filter_uuid?: StringFilter<"RawLead"> | string
    source_type?: EnumSourceTypeFilter<"RawLead"> | $Enums.SourceType
    raw_data?: JsonFilter<"RawLead">
    processed_at?: DateTimeNullableFilter<"RawLead"> | Date | string | null
    created_at?: DateTimeFilter<"RawLead"> | Date | string
    updated_at?: DateTimeFilter<"RawLead"> | Date | string
  }

  export type ContactUpsertWithWhereUniqueWithoutFilterInput = {
    where: ContactWhereUniqueInput
    update: XOR<ContactUpdateWithoutFilterInput, ContactUncheckedUpdateWithoutFilterInput>
    create: XOR<ContactCreateWithoutFilterInput, ContactUncheckedCreateWithoutFilterInput>
  }

  export type ContactUpdateWithWhereUniqueWithoutFilterInput = {
    where: ContactWhereUniqueInput
    data: XOR<ContactUpdateWithoutFilterInput, ContactUncheckedUpdateWithoutFilterInput>
  }

  export type ContactUpdateManyWithWhereWithoutFilterInput = {
    where: ContactScalarWhereInput
    data: XOR<ContactUpdateManyMutationInput, ContactUncheckedUpdateManyWithoutFilterInput>
  }

  export type FilterJobUpsertWithWhereUniqueWithoutFilterInput = {
    where: FilterJobWhereUniqueInput
    update: XOR<FilterJobUpdateWithoutFilterInput, FilterJobUncheckedUpdateWithoutFilterInput>
    create: XOR<FilterJobCreateWithoutFilterInput, FilterJobUncheckedCreateWithoutFilterInput>
  }

  export type FilterJobUpdateWithWhereUniqueWithoutFilterInput = {
    where: FilterJobWhereUniqueInput
    data: XOR<FilterJobUpdateWithoutFilterInput, FilterJobUncheckedUpdateWithoutFilterInput>
  }

  export type FilterJobUpdateManyWithWhereWithoutFilterInput = {
    where: FilterJobScalarWhereInput
    data: XOR<FilterJobUpdateManyMutationInput, FilterJobUncheckedUpdateManyWithoutFilterInput>
  }

  export type FilterJobScalarWhereInput = {
    AND?: FilterJobScalarWhereInput | FilterJobScalarWhereInput[]
    OR?: FilterJobScalarWhereInput[]
    NOT?: FilterJobScalarWhereInput | FilterJobScalarWhereInput[]
    id?: IntFilter<"FilterJob"> | number
    uuid?: StringFilter<"FilterJob"> | string
    filter_uuid?: StringFilter<"FilterJob"> | string
    status?: EnumJobStatusFilter<"FilterJob"> | $Enums.JobStatus
    leads_found?: IntFilter<"FilterJob"> | number
    duration?: IntFilter<"FilterJob"> | number
    error?: StringNullableFilter<"FilterJob"> | string | null
    started_at?: DateTimeFilter<"FilterJob"> | Date | string
    completed_at?: DateTimeNullableFilter<"FilterJob"> | Date | string | null
    created_at?: DateTimeFilter<"FilterJob"> | Date | string
    updated_at?: DateTimeFilter<"FilterJob"> | Date | string
  }

  export type FilterCreateWithoutRaw_leadsInput = {
    uuid?: string
    name: string
    source_type: $Enums.SourceType
    query_config: JsonNullValueInput | InputJsonValue
    enabled?: boolean
    cron_schedule?: string | null
    channels?: FilterCreatechannelsInput | $Enums.Channel[]
    ai_instructions?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    user: UserCreateNestedOneWithoutFiltersInput
    contacts?: ContactCreateNestedManyWithoutFilterInput
    jobs?: FilterJobCreateNestedManyWithoutFilterInput
  }

  export type FilterUncheckedCreateWithoutRaw_leadsInput = {
    id?: number
    uuid?: string
    user_uuid: string
    name: string
    source_type: $Enums.SourceType
    query_config: JsonNullValueInput | InputJsonValue
    enabled?: boolean
    cron_schedule?: string | null
    channels?: FilterCreatechannelsInput | $Enums.Channel[]
    ai_instructions?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    contacts?: ContactUncheckedCreateNestedManyWithoutFilterInput
    jobs?: FilterJobUncheckedCreateNestedManyWithoutFilterInput
  }

  export type FilterCreateOrConnectWithoutRaw_leadsInput = {
    where: FilterWhereUniqueInput
    create: XOR<FilterCreateWithoutRaw_leadsInput, FilterUncheckedCreateWithoutRaw_leadsInput>
  }

  export type LeadCreateWithoutRaw_leadInput = {
    uuid?: string
    name?: string | null
    email?: string | null
    phone?: string | null
    company?: string | null
    website?: string | null
    linkedin_url?: string | null
    title?: string | null
    location?: string | null
    industry?: string | null
    description?: string | null
    source_type: $Enums.SourceType
    raw_data?: NullableJsonNullValueInput | InputJsonValue
    enrichment_data?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
    contacts?: ContactCreateNestedManyWithoutLeadInput
  }

  export type LeadUncheckedCreateWithoutRaw_leadInput = {
    id?: number
    uuid?: string
    name?: string | null
    email?: string | null
    phone?: string | null
    company?: string | null
    website?: string | null
    linkedin_url?: string | null
    title?: string | null
    location?: string | null
    industry?: string | null
    description?: string | null
    source_type: $Enums.SourceType
    raw_data?: NullableJsonNullValueInput | InputJsonValue
    enrichment_data?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
    contacts?: ContactUncheckedCreateNestedManyWithoutLeadInput
  }

  export type LeadCreateOrConnectWithoutRaw_leadInput = {
    where: LeadWhereUniqueInput
    create: XOR<LeadCreateWithoutRaw_leadInput, LeadUncheckedCreateWithoutRaw_leadInput>
  }

  export type FilterUpsertWithoutRaw_leadsInput = {
    update: XOR<FilterUpdateWithoutRaw_leadsInput, FilterUncheckedUpdateWithoutRaw_leadsInput>
    create: XOR<FilterCreateWithoutRaw_leadsInput, FilterUncheckedCreateWithoutRaw_leadsInput>
    where?: FilterWhereInput
  }

  export type FilterUpdateToOneWithWhereWithoutRaw_leadsInput = {
    where?: FilterWhereInput
    data: XOR<FilterUpdateWithoutRaw_leadsInput, FilterUncheckedUpdateWithoutRaw_leadsInput>
  }

  export type FilterUpdateWithoutRaw_leadsInput = {
    uuid?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    source_type?: EnumSourceTypeFieldUpdateOperationsInput | $Enums.SourceType
    query_config?: JsonNullValueInput | InputJsonValue
    enabled?: BoolFieldUpdateOperationsInput | boolean
    cron_schedule?: NullableStringFieldUpdateOperationsInput | string | null
    channels?: FilterUpdatechannelsInput | $Enums.Channel[]
    ai_instructions?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutFiltersNestedInput
    contacts?: ContactUpdateManyWithoutFilterNestedInput
    jobs?: FilterJobUpdateManyWithoutFilterNestedInput
  }

  export type FilterUncheckedUpdateWithoutRaw_leadsInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    user_uuid?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    source_type?: EnumSourceTypeFieldUpdateOperationsInput | $Enums.SourceType
    query_config?: JsonNullValueInput | InputJsonValue
    enabled?: BoolFieldUpdateOperationsInput | boolean
    cron_schedule?: NullableStringFieldUpdateOperationsInput | string | null
    channels?: FilterUpdatechannelsInput | $Enums.Channel[]
    ai_instructions?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    contacts?: ContactUncheckedUpdateManyWithoutFilterNestedInput
    jobs?: FilterJobUncheckedUpdateManyWithoutFilterNestedInput
  }

  export type LeadUpsertWithoutRaw_leadInput = {
    update: XOR<LeadUpdateWithoutRaw_leadInput, LeadUncheckedUpdateWithoutRaw_leadInput>
    create: XOR<LeadCreateWithoutRaw_leadInput, LeadUncheckedCreateWithoutRaw_leadInput>
    where?: LeadWhereInput
  }

  export type LeadUpdateToOneWithWhereWithoutRaw_leadInput = {
    where?: LeadWhereInput
    data: XOR<LeadUpdateWithoutRaw_leadInput, LeadUncheckedUpdateWithoutRaw_leadInput>
  }

  export type LeadUpdateWithoutRaw_leadInput = {
    uuid?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    company?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    linkedin_url?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    industry?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    source_type?: EnumSourceTypeFieldUpdateOperationsInput | $Enums.SourceType
    raw_data?: NullableJsonNullValueInput | InputJsonValue
    enrichment_data?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    contacts?: ContactUpdateManyWithoutLeadNestedInput
  }

  export type LeadUncheckedUpdateWithoutRaw_leadInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    company?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    linkedin_url?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    industry?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    source_type?: EnumSourceTypeFieldUpdateOperationsInput | $Enums.SourceType
    raw_data?: NullableJsonNullValueInput | InputJsonValue
    enrichment_data?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    contacts?: ContactUncheckedUpdateManyWithoutLeadNestedInput
  }

  export type RawLeadCreateWithoutLeadInput = {
    uuid?: string
    source_type: $Enums.SourceType
    raw_data: JsonNullValueInput | InputJsonValue
    processed_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
    filter: FilterCreateNestedOneWithoutRaw_leadsInput
  }

  export type RawLeadUncheckedCreateWithoutLeadInput = {
    id?: number
    uuid?: string
    filter_uuid: string
    source_type: $Enums.SourceType
    raw_data: JsonNullValueInput | InputJsonValue
    processed_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type RawLeadCreateOrConnectWithoutLeadInput = {
    where: RawLeadWhereUniqueInput
    create: XOR<RawLeadCreateWithoutLeadInput, RawLeadUncheckedCreateWithoutLeadInput>
  }

  export type ContactCreateWithoutLeadInput = {
    uuid?: string
    status?: $Enums.LeadStatus
    score?: number | null
    notes?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    user: UserCreateNestedOneWithoutContactsInput
    filter?: FilterCreateNestedOneWithoutContactsInput
    tags?: ContactTagCreateNestedManyWithoutContactInput
    interactions?: InteractionCreateNestedManyWithoutContactInput
    outreach_messages?: OutreachMessageCreateNestedManyWithoutContactInput
  }

  export type ContactUncheckedCreateWithoutLeadInput = {
    id?: number
    uuid?: string
    user_uuid: string
    filter_uuid?: string | null
    status?: $Enums.LeadStatus
    score?: number | null
    notes?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    tags?: ContactTagUncheckedCreateNestedManyWithoutContactInput
    interactions?: InteractionUncheckedCreateNestedManyWithoutContactInput
    outreach_messages?: OutreachMessageUncheckedCreateNestedManyWithoutContactInput
  }

  export type ContactCreateOrConnectWithoutLeadInput = {
    where: ContactWhereUniqueInput
    create: XOR<ContactCreateWithoutLeadInput, ContactUncheckedCreateWithoutLeadInput>
  }

  export type ContactCreateManyLeadInputEnvelope = {
    data: ContactCreateManyLeadInput | ContactCreateManyLeadInput[]
    skipDuplicates?: boolean
  }

  export type RawLeadUpsertWithoutLeadInput = {
    update: XOR<RawLeadUpdateWithoutLeadInput, RawLeadUncheckedUpdateWithoutLeadInput>
    create: XOR<RawLeadCreateWithoutLeadInput, RawLeadUncheckedCreateWithoutLeadInput>
    where?: RawLeadWhereInput
  }

  export type RawLeadUpdateToOneWithWhereWithoutLeadInput = {
    where?: RawLeadWhereInput
    data: XOR<RawLeadUpdateWithoutLeadInput, RawLeadUncheckedUpdateWithoutLeadInput>
  }

  export type RawLeadUpdateWithoutLeadInput = {
    uuid?: StringFieldUpdateOperationsInput | string
    source_type?: EnumSourceTypeFieldUpdateOperationsInput | $Enums.SourceType
    raw_data?: JsonNullValueInput | InputJsonValue
    processed_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    filter?: FilterUpdateOneRequiredWithoutRaw_leadsNestedInput
  }

  export type RawLeadUncheckedUpdateWithoutLeadInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    filter_uuid?: StringFieldUpdateOperationsInput | string
    source_type?: EnumSourceTypeFieldUpdateOperationsInput | $Enums.SourceType
    raw_data?: JsonNullValueInput | InputJsonValue
    processed_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ContactUpsertWithWhereUniqueWithoutLeadInput = {
    where: ContactWhereUniqueInput
    update: XOR<ContactUpdateWithoutLeadInput, ContactUncheckedUpdateWithoutLeadInput>
    create: XOR<ContactCreateWithoutLeadInput, ContactUncheckedCreateWithoutLeadInput>
  }

  export type ContactUpdateWithWhereUniqueWithoutLeadInput = {
    where: ContactWhereUniqueInput
    data: XOR<ContactUpdateWithoutLeadInput, ContactUncheckedUpdateWithoutLeadInput>
  }

  export type ContactUpdateManyWithWhereWithoutLeadInput = {
    where: ContactScalarWhereInput
    data: XOR<ContactUpdateManyMutationInput, ContactUncheckedUpdateManyWithoutLeadInput>
  }

  export type UserCreateWithoutContactsInput = {
    uuid?: string
    email: string
    phone?: string | null
    password: string
    role?: $Enums.AuthRole
    created_at?: Date | string
    updated_at?: Date | string
    filters?: FilterCreateNestedManyWithoutUserInput
    outreach_messages?: OutreachMessageCreateNestedManyWithoutUserInput
    outreach_sequences?: OutreachSequenceCreateNestedManyWithoutUserInput
    interactions?: InteractionCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutContactsInput = {
    id?: number
    uuid?: string
    email: string
    phone?: string | null
    password: string
    role?: $Enums.AuthRole
    created_at?: Date | string
    updated_at?: Date | string
    filters?: FilterUncheckedCreateNestedManyWithoutUserInput
    outreach_messages?: OutreachMessageUncheckedCreateNestedManyWithoutUserInput
    outreach_sequences?: OutreachSequenceUncheckedCreateNestedManyWithoutUserInput
    interactions?: InteractionUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutContactsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutContactsInput, UserUncheckedCreateWithoutContactsInput>
  }

  export type LeadCreateWithoutContactsInput = {
    uuid?: string
    name?: string | null
    email?: string | null
    phone?: string | null
    company?: string | null
    website?: string | null
    linkedin_url?: string | null
    title?: string | null
    location?: string | null
    industry?: string | null
    description?: string | null
    source_type: $Enums.SourceType
    raw_data?: NullableJsonNullValueInput | InputJsonValue
    enrichment_data?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
    raw_lead?: RawLeadCreateNestedOneWithoutLeadInput
  }

  export type LeadUncheckedCreateWithoutContactsInput = {
    id?: number
    uuid?: string
    raw_lead_uuid?: string | null
    name?: string | null
    email?: string | null
    phone?: string | null
    company?: string | null
    website?: string | null
    linkedin_url?: string | null
    title?: string | null
    location?: string | null
    industry?: string | null
    description?: string | null
    source_type: $Enums.SourceType
    raw_data?: NullableJsonNullValueInput | InputJsonValue
    enrichment_data?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type LeadCreateOrConnectWithoutContactsInput = {
    where: LeadWhereUniqueInput
    create: XOR<LeadCreateWithoutContactsInput, LeadUncheckedCreateWithoutContactsInput>
  }

  export type FilterCreateWithoutContactsInput = {
    uuid?: string
    name: string
    source_type: $Enums.SourceType
    query_config: JsonNullValueInput | InputJsonValue
    enabled?: boolean
    cron_schedule?: string | null
    channels?: FilterCreatechannelsInput | $Enums.Channel[]
    ai_instructions?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    user: UserCreateNestedOneWithoutFiltersInput
    raw_leads?: RawLeadCreateNestedManyWithoutFilterInput
    jobs?: FilterJobCreateNestedManyWithoutFilterInput
  }

  export type FilterUncheckedCreateWithoutContactsInput = {
    id?: number
    uuid?: string
    user_uuid: string
    name: string
    source_type: $Enums.SourceType
    query_config: JsonNullValueInput | InputJsonValue
    enabled?: boolean
    cron_schedule?: string | null
    channels?: FilterCreatechannelsInput | $Enums.Channel[]
    ai_instructions?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    raw_leads?: RawLeadUncheckedCreateNestedManyWithoutFilterInput
    jobs?: FilterJobUncheckedCreateNestedManyWithoutFilterInput
  }

  export type FilterCreateOrConnectWithoutContactsInput = {
    where: FilterWhereUniqueInput
    create: XOR<FilterCreateWithoutContactsInput, FilterUncheckedCreateWithoutContactsInput>
  }

  export type ContactTagCreateWithoutContactInput = {
    tag: string
    created_at?: Date | string
  }

  export type ContactTagUncheckedCreateWithoutContactInput = {
    id?: number
    tag: string
    created_at?: Date | string
  }

  export type ContactTagCreateOrConnectWithoutContactInput = {
    where: ContactTagWhereUniqueInput
    create: XOR<ContactTagCreateWithoutContactInput, ContactTagUncheckedCreateWithoutContactInput>
  }

  export type ContactTagCreateManyContactInputEnvelope = {
    data: ContactTagCreateManyContactInput | ContactTagCreateManyContactInput[]
    skipDuplicates?: boolean
  }

  export type InteractionCreateWithoutContactInput = {
    uuid?: string
    type: $Enums.InteractionType
    content?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
    user: UserCreateNestedOneWithoutInteractionsInput
  }

  export type InteractionUncheckedCreateWithoutContactInput = {
    id?: number
    uuid?: string
    user_uuid: string
    type: $Enums.InteractionType
    content?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type InteractionCreateOrConnectWithoutContactInput = {
    where: InteractionWhereUniqueInput
    create: XOR<InteractionCreateWithoutContactInput, InteractionUncheckedCreateWithoutContactInput>
  }

  export type InteractionCreateManyContactInputEnvelope = {
    data: InteractionCreateManyContactInput | InteractionCreateManyContactInput[]
    skipDuplicates?: boolean
  }

  export type OutreachMessageCreateWithoutContactInput = {
    uuid?: string
    channel: $Enums.Channel
    subject?: string | null
    content: string
    status?: $Enums.MsgStatus
    scheduled_at?: Date | string | null
    sent_at?: Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
    user: UserCreateNestedOneWithoutOutreach_messagesInput
  }

  export type OutreachMessageUncheckedCreateWithoutContactInput = {
    id?: number
    uuid?: string
    user_uuid: string
    channel: $Enums.Channel
    subject?: string | null
    content: string
    status?: $Enums.MsgStatus
    scheduled_at?: Date | string | null
    sent_at?: Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type OutreachMessageCreateOrConnectWithoutContactInput = {
    where: OutreachMessageWhereUniqueInput
    create: XOR<OutreachMessageCreateWithoutContactInput, OutreachMessageUncheckedCreateWithoutContactInput>
  }

  export type OutreachMessageCreateManyContactInputEnvelope = {
    data: OutreachMessageCreateManyContactInput | OutreachMessageCreateManyContactInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutContactsInput = {
    update: XOR<UserUpdateWithoutContactsInput, UserUncheckedUpdateWithoutContactsInput>
    create: XOR<UserCreateWithoutContactsInput, UserUncheckedCreateWithoutContactsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutContactsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutContactsInput, UserUncheckedUpdateWithoutContactsInput>
  }

  export type UserUpdateWithoutContactsInput = {
    uuid?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumAuthRoleFieldUpdateOperationsInput | $Enums.AuthRole
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    filters?: FilterUpdateManyWithoutUserNestedInput
    outreach_messages?: OutreachMessageUpdateManyWithoutUserNestedInput
    outreach_sequences?: OutreachSequenceUpdateManyWithoutUserNestedInput
    interactions?: InteractionUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutContactsInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumAuthRoleFieldUpdateOperationsInput | $Enums.AuthRole
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    filters?: FilterUncheckedUpdateManyWithoutUserNestedInput
    outreach_messages?: OutreachMessageUncheckedUpdateManyWithoutUserNestedInput
    outreach_sequences?: OutreachSequenceUncheckedUpdateManyWithoutUserNestedInput
    interactions?: InteractionUncheckedUpdateManyWithoutUserNestedInput
  }

  export type LeadUpsertWithoutContactsInput = {
    update: XOR<LeadUpdateWithoutContactsInput, LeadUncheckedUpdateWithoutContactsInput>
    create: XOR<LeadCreateWithoutContactsInput, LeadUncheckedCreateWithoutContactsInput>
    where?: LeadWhereInput
  }

  export type LeadUpdateToOneWithWhereWithoutContactsInput = {
    where?: LeadWhereInput
    data: XOR<LeadUpdateWithoutContactsInput, LeadUncheckedUpdateWithoutContactsInput>
  }

  export type LeadUpdateWithoutContactsInput = {
    uuid?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    company?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    linkedin_url?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    industry?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    source_type?: EnumSourceTypeFieldUpdateOperationsInput | $Enums.SourceType
    raw_data?: NullableJsonNullValueInput | InputJsonValue
    enrichment_data?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    raw_lead?: RawLeadUpdateOneWithoutLeadNestedInput
  }

  export type LeadUncheckedUpdateWithoutContactsInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    raw_lead_uuid?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    company?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    linkedin_url?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    industry?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    source_type?: EnumSourceTypeFieldUpdateOperationsInput | $Enums.SourceType
    raw_data?: NullableJsonNullValueInput | InputJsonValue
    enrichment_data?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FilterUpsertWithoutContactsInput = {
    update: XOR<FilterUpdateWithoutContactsInput, FilterUncheckedUpdateWithoutContactsInput>
    create: XOR<FilterCreateWithoutContactsInput, FilterUncheckedCreateWithoutContactsInput>
    where?: FilterWhereInput
  }

  export type FilterUpdateToOneWithWhereWithoutContactsInput = {
    where?: FilterWhereInput
    data: XOR<FilterUpdateWithoutContactsInput, FilterUncheckedUpdateWithoutContactsInput>
  }

  export type FilterUpdateWithoutContactsInput = {
    uuid?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    source_type?: EnumSourceTypeFieldUpdateOperationsInput | $Enums.SourceType
    query_config?: JsonNullValueInput | InputJsonValue
    enabled?: BoolFieldUpdateOperationsInput | boolean
    cron_schedule?: NullableStringFieldUpdateOperationsInput | string | null
    channels?: FilterUpdatechannelsInput | $Enums.Channel[]
    ai_instructions?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutFiltersNestedInput
    raw_leads?: RawLeadUpdateManyWithoutFilterNestedInput
    jobs?: FilterJobUpdateManyWithoutFilterNestedInput
  }

  export type FilterUncheckedUpdateWithoutContactsInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    user_uuid?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    source_type?: EnumSourceTypeFieldUpdateOperationsInput | $Enums.SourceType
    query_config?: JsonNullValueInput | InputJsonValue
    enabled?: BoolFieldUpdateOperationsInput | boolean
    cron_schedule?: NullableStringFieldUpdateOperationsInput | string | null
    channels?: FilterUpdatechannelsInput | $Enums.Channel[]
    ai_instructions?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    raw_leads?: RawLeadUncheckedUpdateManyWithoutFilterNestedInput
    jobs?: FilterJobUncheckedUpdateManyWithoutFilterNestedInput
  }

  export type ContactTagUpsertWithWhereUniqueWithoutContactInput = {
    where: ContactTagWhereUniqueInput
    update: XOR<ContactTagUpdateWithoutContactInput, ContactTagUncheckedUpdateWithoutContactInput>
    create: XOR<ContactTagCreateWithoutContactInput, ContactTagUncheckedCreateWithoutContactInput>
  }

  export type ContactTagUpdateWithWhereUniqueWithoutContactInput = {
    where: ContactTagWhereUniqueInput
    data: XOR<ContactTagUpdateWithoutContactInput, ContactTagUncheckedUpdateWithoutContactInput>
  }

  export type ContactTagUpdateManyWithWhereWithoutContactInput = {
    where: ContactTagScalarWhereInput
    data: XOR<ContactTagUpdateManyMutationInput, ContactTagUncheckedUpdateManyWithoutContactInput>
  }

  export type ContactTagScalarWhereInput = {
    AND?: ContactTagScalarWhereInput | ContactTagScalarWhereInput[]
    OR?: ContactTagScalarWhereInput[]
    NOT?: ContactTagScalarWhereInput | ContactTagScalarWhereInput[]
    id?: IntFilter<"ContactTag"> | number
    contact_uuid?: StringFilter<"ContactTag"> | string
    tag?: StringFilter<"ContactTag"> | string
    created_at?: DateTimeFilter<"ContactTag"> | Date | string
  }

  export type InteractionUpsertWithWhereUniqueWithoutContactInput = {
    where: InteractionWhereUniqueInput
    update: XOR<InteractionUpdateWithoutContactInput, InteractionUncheckedUpdateWithoutContactInput>
    create: XOR<InteractionCreateWithoutContactInput, InteractionUncheckedCreateWithoutContactInput>
  }

  export type InteractionUpdateWithWhereUniqueWithoutContactInput = {
    where: InteractionWhereUniqueInput
    data: XOR<InteractionUpdateWithoutContactInput, InteractionUncheckedUpdateWithoutContactInput>
  }

  export type InteractionUpdateManyWithWhereWithoutContactInput = {
    where: InteractionScalarWhereInput
    data: XOR<InteractionUpdateManyMutationInput, InteractionUncheckedUpdateManyWithoutContactInput>
  }

  export type OutreachMessageUpsertWithWhereUniqueWithoutContactInput = {
    where: OutreachMessageWhereUniqueInput
    update: XOR<OutreachMessageUpdateWithoutContactInput, OutreachMessageUncheckedUpdateWithoutContactInput>
    create: XOR<OutreachMessageCreateWithoutContactInput, OutreachMessageUncheckedCreateWithoutContactInput>
  }

  export type OutreachMessageUpdateWithWhereUniqueWithoutContactInput = {
    where: OutreachMessageWhereUniqueInput
    data: XOR<OutreachMessageUpdateWithoutContactInput, OutreachMessageUncheckedUpdateWithoutContactInput>
  }

  export type OutreachMessageUpdateManyWithWhereWithoutContactInput = {
    where: OutreachMessageScalarWhereInput
    data: XOR<OutreachMessageUpdateManyMutationInput, OutreachMessageUncheckedUpdateManyWithoutContactInput>
  }

  export type ContactCreateWithoutTagsInput = {
    uuid?: string
    status?: $Enums.LeadStatus
    score?: number | null
    notes?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    user: UserCreateNestedOneWithoutContactsInput
    lead: LeadCreateNestedOneWithoutContactsInput
    filter?: FilterCreateNestedOneWithoutContactsInput
    interactions?: InteractionCreateNestedManyWithoutContactInput
    outreach_messages?: OutreachMessageCreateNestedManyWithoutContactInput
  }

  export type ContactUncheckedCreateWithoutTagsInput = {
    id?: number
    uuid?: string
    user_uuid: string
    lead_uuid: string
    filter_uuid?: string | null
    status?: $Enums.LeadStatus
    score?: number | null
    notes?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    interactions?: InteractionUncheckedCreateNestedManyWithoutContactInput
    outreach_messages?: OutreachMessageUncheckedCreateNestedManyWithoutContactInput
  }

  export type ContactCreateOrConnectWithoutTagsInput = {
    where: ContactWhereUniqueInput
    create: XOR<ContactCreateWithoutTagsInput, ContactUncheckedCreateWithoutTagsInput>
  }

  export type ContactUpsertWithoutTagsInput = {
    update: XOR<ContactUpdateWithoutTagsInput, ContactUncheckedUpdateWithoutTagsInput>
    create: XOR<ContactCreateWithoutTagsInput, ContactUncheckedCreateWithoutTagsInput>
    where?: ContactWhereInput
  }

  export type ContactUpdateToOneWithWhereWithoutTagsInput = {
    where?: ContactWhereInput
    data: XOR<ContactUpdateWithoutTagsInput, ContactUncheckedUpdateWithoutTagsInput>
  }

  export type ContactUpdateWithoutTagsInput = {
    uuid?: StringFieldUpdateOperationsInput | string
    status?: EnumLeadStatusFieldUpdateOperationsInput | $Enums.LeadStatus
    score?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutContactsNestedInput
    lead?: LeadUpdateOneRequiredWithoutContactsNestedInput
    filter?: FilterUpdateOneWithoutContactsNestedInput
    interactions?: InteractionUpdateManyWithoutContactNestedInput
    outreach_messages?: OutreachMessageUpdateManyWithoutContactNestedInput
  }

  export type ContactUncheckedUpdateWithoutTagsInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    user_uuid?: StringFieldUpdateOperationsInput | string
    lead_uuid?: StringFieldUpdateOperationsInput | string
    filter_uuid?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumLeadStatusFieldUpdateOperationsInput | $Enums.LeadStatus
    score?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    interactions?: InteractionUncheckedUpdateManyWithoutContactNestedInput
    outreach_messages?: OutreachMessageUncheckedUpdateManyWithoutContactNestedInput
  }

  export type ContactCreateWithoutInteractionsInput = {
    uuid?: string
    status?: $Enums.LeadStatus
    score?: number | null
    notes?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    user: UserCreateNestedOneWithoutContactsInput
    lead: LeadCreateNestedOneWithoutContactsInput
    filter?: FilterCreateNestedOneWithoutContactsInput
    tags?: ContactTagCreateNestedManyWithoutContactInput
    outreach_messages?: OutreachMessageCreateNestedManyWithoutContactInput
  }

  export type ContactUncheckedCreateWithoutInteractionsInput = {
    id?: number
    uuid?: string
    user_uuid: string
    lead_uuid: string
    filter_uuid?: string | null
    status?: $Enums.LeadStatus
    score?: number | null
    notes?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    tags?: ContactTagUncheckedCreateNestedManyWithoutContactInput
    outreach_messages?: OutreachMessageUncheckedCreateNestedManyWithoutContactInput
  }

  export type ContactCreateOrConnectWithoutInteractionsInput = {
    where: ContactWhereUniqueInput
    create: XOR<ContactCreateWithoutInteractionsInput, ContactUncheckedCreateWithoutInteractionsInput>
  }

  export type UserCreateWithoutInteractionsInput = {
    uuid?: string
    email: string
    phone?: string | null
    password: string
    role?: $Enums.AuthRole
    created_at?: Date | string
    updated_at?: Date | string
    filters?: FilterCreateNestedManyWithoutUserInput
    contacts?: ContactCreateNestedManyWithoutUserInput
    outreach_messages?: OutreachMessageCreateNestedManyWithoutUserInput
    outreach_sequences?: OutreachSequenceCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutInteractionsInput = {
    id?: number
    uuid?: string
    email: string
    phone?: string | null
    password: string
    role?: $Enums.AuthRole
    created_at?: Date | string
    updated_at?: Date | string
    filters?: FilterUncheckedCreateNestedManyWithoutUserInput
    contacts?: ContactUncheckedCreateNestedManyWithoutUserInput
    outreach_messages?: OutreachMessageUncheckedCreateNestedManyWithoutUserInput
    outreach_sequences?: OutreachSequenceUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutInteractionsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutInteractionsInput, UserUncheckedCreateWithoutInteractionsInput>
  }

  export type ContactUpsertWithoutInteractionsInput = {
    update: XOR<ContactUpdateWithoutInteractionsInput, ContactUncheckedUpdateWithoutInteractionsInput>
    create: XOR<ContactCreateWithoutInteractionsInput, ContactUncheckedCreateWithoutInteractionsInput>
    where?: ContactWhereInput
  }

  export type ContactUpdateToOneWithWhereWithoutInteractionsInput = {
    where?: ContactWhereInput
    data: XOR<ContactUpdateWithoutInteractionsInput, ContactUncheckedUpdateWithoutInteractionsInput>
  }

  export type ContactUpdateWithoutInteractionsInput = {
    uuid?: StringFieldUpdateOperationsInput | string
    status?: EnumLeadStatusFieldUpdateOperationsInput | $Enums.LeadStatus
    score?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutContactsNestedInput
    lead?: LeadUpdateOneRequiredWithoutContactsNestedInput
    filter?: FilterUpdateOneWithoutContactsNestedInput
    tags?: ContactTagUpdateManyWithoutContactNestedInput
    outreach_messages?: OutreachMessageUpdateManyWithoutContactNestedInput
  }

  export type ContactUncheckedUpdateWithoutInteractionsInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    user_uuid?: StringFieldUpdateOperationsInput | string
    lead_uuid?: StringFieldUpdateOperationsInput | string
    filter_uuid?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumLeadStatusFieldUpdateOperationsInput | $Enums.LeadStatus
    score?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tags?: ContactTagUncheckedUpdateManyWithoutContactNestedInput
    outreach_messages?: OutreachMessageUncheckedUpdateManyWithoutContactNestedInput
  }

  export type UserUpsertWithoutInteractionsInput = {
    update: XOR<UserUpdateWithoutInteractionsInput, UserUncheckedUpdateWithoutInteractionsInput>
    create: XOR<UserCreateWithoutInteractionsInput, UserUncheckedCreateWithoutInteractionsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutInteractionsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutInteractionsInput, UserUncheckedUpdateWithoutInteractionsInput>
  }

  export type UserUpdateWithoutInteractionsInput = {
    uuid?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumAuthRoleFieldUpdateOperationsInput | $Enums.AuthRole
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    filters?: FilterUpdateManyWithoutUserNestedInput
    contacts?: ContactUpdateManyWithoutUserNestedInput
    outreach_messages?: OutreachMessageUpdateManyWithoutUserNestedInput
    outreach_sequences?: OutreachSequenceUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutInteractionsInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumAuthRoleFieldUpdateOperationsInput | $Enums.AuthRole
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    filters?: FilterUncheckedUpdateManyWithoutUserNestedInput
    contacts?: ContactUncheckedUpdateManyWithoutUserNestedInput
    outreach_messages?: OutreachMessageUncheckedUpdateManyWithoutUserNestedInput
    outreach_sequences?: OutreachSequenceUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutOutreach_messagesInput = {
    uuid?: string
    email: string
    phone?: string | null
    password: string
    role?: $Enums.AuthRole
    created_at?: Date | string
    updated_at?: Date | string
    filters?: FilterCreateNestedManyWithoutUserInput
    contacts?: ContactCreateNestedManyWithoutUserInput
    outreach_sequences?: OutreachSequenceCreateNestedManyWithoutUserInput
    interactions?: InteractionCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutOutreach_messagesInput = {
    id?: number
    uuid?: string
    email: string
    phone?: string | null
    password: string
    role?: $Enums.AuthRole
    created_at?: Date | string
    updated_at?: Date | string
    filters?: FilterUncheckedCreateNestedManyWithoutUserInput
    contacts?: ContactUncheckedCreateNestedManyWithoutUserInput
    outreach_sequences?: OutreachSequenceUncheckedCreateNestedManyWithoutUserInput
    interactions?: InteractionUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutOutreach_messagesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutOutreach_messagesInput, UserUncheckedCreateWithoutOutreach_messagesInput>
  }

  export type ContactCreateWithoutOutreach_messagesInput = {
    uuid?: string
    status?: $Enums.LeadStatus
    score?: number | null
    notes?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    user: UserCreateNestedOneWithoutContactsInput
    lead: LeadCreateNestedOneWithoutContactsInput
    filter?: FilterCreateNestedOneWithoutContactsInput
    tags?: ContactTagCreateNestedManyWithoutContactInput
    interactions?: InteractionCreateNestedManyWithoutContactInput
  }

  export type ContactUncheckedCreateWithoutOutreach_messagesInput = {
    id?: number
    uuid?: string
    user_uuid: string
    lead_uuid: string
    filter_uuid?: string | null
    status?: $Enums.LeadStatus
    score?: number | null
    notes?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    tags?: ContactTagUncheckedCreateNestedManyWithoutContactInput
    interactions?: InteractionUncheckedCreateNestedManyWithoutContactInput
  }

  export type ContactCreateOrConnectWithoutOutreach_messagesInput = {
    where: ContactWhereUniqueInput
    create: XOR<ContactCreateWithoutOutreach_messagesInput, ContactUncheckedCreateWithoutOutreach_messagesInput>
  }

  export type UserUpsertWithoutOutreach_messagesInput = {
    update: XOR<UserUpdateWithoutOutreach_messagesInput, UserUncheckedUpdateWithoutOutreach_messagesInput>
    create: XOR<UserCreateWithoutOutreach_messagesInput, UserUncheckedCreateWithoutOutreach_messagesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutOutreach_messagesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutOutreach_messagesInput, UserUncheckedUpdateWithoutOutreach_messagesInput>
  }

  export type UserUpdateWithoutOutreach_messagesInput = {
    uuid?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumAuthRoleFieldUpdateOperationsInput | $Enums.AuthRole
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    filters?: FilterUpdateManyWithoutUserNestedInput
    contacts?: ContactUpdateManyWithoutUserNestedInput
    outreach_sequences?: OutreachSequenceUpdateManyWithoutUserNestedInput
    interactions?: InteractionUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutOutreach_messagesInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumAuthRoleFieldUpdateOperationsInput | $Enums.AuthRole
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    filters?: FilterUncheckedUpdateManyWithoutUserNestedInput
    contacts?: ContactUncheckedUpdateManyWithoutUserNestedInput
    outreach_sequences?: OutreachSequenceUncheckedUpdateManyWithoutUserNestedInput
    interactions?: InteractionUncheckedUpdateManyWithoutUserNestedInput
  }

  export type ContactUpsertWithoutOutreach_messagesInput = {
    update: XOR<ContactUpdateWithoutOutreach_messagesInput, ContactUncheckedUpdateWithoutOutreach_messagesInput>
    create: XOR<ContactCreateWithoutOutreach_messagesInput, ContactUncheckedCreateWithoutOutreach_messagesInput>
    where?: ContactWhereInput
  }

  export type ContactUpdateToOneWithWhereWithoutOutreach_messagesInput = {
    where?: ContactWhereInput
    data: XOR<ContactUpdateWithoutOutreach_messagesInput, ContactUncheckedUpdateWithoutOutreach_messagesInput>
  }

  export type ContactUpdateWithoutOutreach_messagesInput = {
    uuid?: StringFieldUpdateOperationsInput | string
    status?: EnumLeadStatusFieldUpdateOperationsInput | $Enums.LeadStatus
    score?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutContactsNestedInput
    lead?: LeadUpdateOneRequiredWithoutContactsNestedInput
    filter?: FilterUpdateOneWithoutContactsNestedInput
    tags?: ContactTagUpdateManyWithoutContactNestedInput
    interactions?: InteractionUpdateManyWithoutContactNestedInput
  }

  export type ContactUncheckedUpdateWithoutOutreach_messagesInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    user_uuid?: StringFieldUpdateOperationsInput | string
    lead_uuid?: StringFieldUpdateOperationsInput | string
    filter_uuid?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumLeadStatusFieldUpdateOperationsInput | $Enums.LeadStatus
    score?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tags?: ContactTagUncheckedUpdateManyWithoutContactNestedInput
    interactions?: InteractionUncheckedUpdateManyWithoutContactNestedInput
  }

  export type UserCreateWithoutOutreach_sequencesInput = {
    uuid?: string
    email: string
    phone?: string | null
    password: string
    role?: $Enums.AuthRole
    created_at?: Date | string
    updated_at?: Date | string
    filters?: FilterCreateNestedManyWithoutUserInput
    contacts?: ContactCreateNestedManyWithoutUserInput
    outreach_messages?: OutreachMessageCreateNestedManyWithoutUserInput
    interactions?: InteractionCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutOutreach_sequencesInput = {
    id?: number
    uuid?: string
    email: string
    phone?: string | null
    password: string
    role?: $Enums.AuthRole
    created_at?: Date | string
    updated_at?: Date | string
    filters?: FilterUncheckedCreateNestedManyWithoutUserInput
    contacts?: ContactUncheckedCreateNestedManyWithoutUserInput
    outreach_messages?: OutreachMessageUncheckedCreateNestedManyWithoutUserInput
    interactions?: InteractionUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutOutreach_sequencesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutOutreach_sequencesInput, UserUncheckedCreateWithoutOutreach_sequencesInput>
  }

  export type UserUpsertWithoutOutreach_sequencesInput = {
    update: XOR<UserUpdateWithoutOutreach_sequencesInput, UserUncheckedUpdateWithoutOutreach_sequencesInput>
    create: XOR<UserCreateWithoutOutreach_sequencesInput, UserUncheckedCreateWithoutOutreach_sequencesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutOutreach_sequencesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutOutreach_sequencesInput, UserUncheckedUpdateWithoutOutreach_sequencesInput>
  }

  export type UserUpdateWithoutOutreach_sequencesInput = {
    uuid?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumAuthRoleFieldUpdateOperationsInput | $Enums.AuthRole
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    filters?: FilterUpdateManyWithoutUserNestedInput
    contacts?: ContactUpdateManyWithoutUserNestedInput
    outreach_messages?: OutreachMessageUpdateManyWithoutUserNestedInput
    interactions?: InteractionUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutOutreach_sequencesInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumAuthRoleFieldUpdateOperationsInput | $Enums.AuthRole
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    filters?: FilterUncheckedUpdateManyWithoutUserNestedInput
    contacts?: ContactUncheckedUpdateManyWithoutUserNestedInput
    outreach_messages?: OutreachMessageUncheckedUpdateManyWithoutUserNestedInput
    interactions?: InteractionUncheckedUpdateManyWithoutUserNestedInput
  }

  export type FilterCreateWithoutJobsInput = {
    uuid?: string
    name: string
    source_type: $Enums.SourceType
    query_config: JsonNullValueInput | InputJsonValue
    enabled?: boolean
    cron_schedule?: string | null
    channels?: FilterCreatechannelsInput | $Enums.Channel[]
    ai_instructions?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    user: UserCreateNestedOneWithoutFiltersInput
    raw_leads?: RawLeadCreateNestedManyWithoutFilterInput
    contacts?: ContactCreateNestedManyWithoutFilterInput
  }

  export type FilterUncheckedCreateWithoutJobsInput = {
    id?: number
    uuid?: string
    user_uuid: string
    name: string
    source_type: $Enums.SourceType
    query_config: JsonNullValueInput | InputJsonValue
    enabled?: boolean
    cron_schedule?: string | null
    channels?: FilterCreatechannelsInput | $Enums.Channel[]
    ai_instructions?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    raw_leads?: RawLeadUncheckedCreateNestedManyWithoutFilterInput
    contacts?: ContactUncheckedCreateNestedManyWithoutFilterInput
  }

  export type FilterCreateOrConnectWithoutJobsInput = {
    where: FilterWhereUniqueInput
    create: XOR<FilterCreateWithoutJobsInput, FilterUncheckedCreateWithoutJobsInput>
  }

  export type FilterUpsertWithoutJobsInput = {
    update: XOR<FilterUpdateWithoutJobsInput, FilterUncheckedUpdateWithoutJobsInput>
    create: XOR<FilterCreateWithoutJobsInput, FilterUncheckedCreateWithoutJobsInput>
    where?: FilterWhereInput
  }

  export type FilterUpdateToOneWithWhereWithoutJobsInput = {
    where?: FilterWhereInput
    data: XOR<FilterUpdateWithoutJobsInput, FilterUncheckedUpdateWithoutJobsInput>
  }

  export type FilterUpdateWithoutJobsInput = {
    uuid?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    source_type?: EnumSourceTypeFieldUpdateOperationsInput | $Enums.SourceType
    query_config?: JsonNullValueInput | InputJsonValue
    enabled?: BoolFieldUpdateOperationsInput | boolean
    cron_schedule?: NullableStringFieldUpdateOperationsInput | string | null
    channels?: FilterUpdatechannelsInput | $Enums.Channel[]
    ai_instructions?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutFiltersNestedInput
    raw_leads?: RawLeadUpdateManyWithoutFilterNestedInput
    contacts?: ContactUpdateManyWithoutFilterNestedInput
  }

  export type FilterUncheckedUpdateWithoutJobsInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    user_uuid?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    source_type?: EnumSourceTypeFieldUpdateOperationsInput | $Enums.SourceType
    query_config?: JsonNullValueInput | InputJsonValue
    enabled?: BoolFieldUpdateOperationsInput | boolean
    cron_schedule?: NullableStringFieldUpdateOperationsInput | string | null
    channels?: FilterUpdatechannelsInput | $Enums.Channel[]
    ai_instructions?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    raw_leads?: RawLeadUncheckedUpdateManyWithoutFilterNestedInput
    contacts?: ContactUncheckedUpdateManyWithoutFilterNestedInput
  }

  export type FilterCreateManyUserInput = {
    id?: number
    uuid?: string
    name: string
    source_type: $Enums.SourceType
    query_config: JsonNullValueInput | InputJsonValue
    enabled?: boolean
    cron_schedule?: string | null
    channels?: FilterCreatechannelsInput | $Enums.Channel[]
    ai_instructions?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ContactCreateManyUserInput = {
    id?: number
    uuid?: string
    lead_uuid: string
    filter_uuid?: string | null
    status?: $Enums.LeadStatus
    score?: number | null
    notes?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type OutreachMessageCreateManyUserInput = {
    id?: number
    uuid?: string
    contact_uuid: string
    channel: $Enums.Channel
    subject?: string | null
    content: string
    status?: $Enums.MsgStatus
    scheduled_at?: Date | string | null
    sent_at?: Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type OutreachSequenceCreateManyUserInput = {
    id?: number
    uuid?: string
    name: string
    steps: JsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type InteractionCreateManyUserInput = {
    id?: number
    uuid?: string
    contact_uuid: string
    type: $Enums.InteractionType
    content?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type FilterUpdateWithoutUserInput = {
    uuid?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    source_type?: EnumSourceTypeFieldUpdateOperationsInput | $Enums.SourceType
    query_config?: JsonNullValueInput | InputJsonValue
    enabled?: BoolFieldUpdateOperationsInput | boolean
    cron_schedule?: NullableStringFieldUpdateOperationsInput | string | null
    channels?: FilterUpdatechannelsInput | $Enums.Channel[]
    ai_instructions?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    raw_leads?: RawLeadUpdateManyWithoutFilterNestedInput
    contacts?: ContactUpdateManyWithoutFilterNestedInput
    jobs?: FilterJobUpdateManyWithoutFilterNestedInput
  }

  export type FilterUncheckedUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    source_type?: EnumSourceTypeFieldUpdateOperationsInput | $Enums.SourceType
    query_config?: JsonNullValueInput | InputJsonValue
    enabled?: BoolFieldUpdateOperationsInput | boolean
    cron_schedule?: NullableStringFieldUpdateOperationsInput | string | null
    channels?: FilterUpdatechannelsInput | $Enums.Channel[]
    ai_instructions?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    raw_leads?: RawLeadUncheckedUpdateManyWithoutFilterNestedInput
    contacts?: ContactUncheckedUpdateManyWithoutFilterNestedInput
    jobs?: FilterJobUncheckedUpdateManyWithoutFilterNestedInput
  }

  export type FilterUncheckedUpdateManyWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    source_type?: EnumSourceTypeFieldUpdateOperationsInput | $Enums.SourceType
    query_config?: JsonNullValueInput | InputJsonValue
    enabled?: BoolFieldUpdateOperationsInput | boolean
    cron_schedule?: NullableStringFieldUpdateOperationsInput | string | null
    channels?: FilterUpdatechannelsInput | $Enums.Channel[]
    ai_instructions?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ContactUpdateWithoutUserInput = {
    uuid?: StringFieldUpdateOperationsInput | string
    status?: EnumLeadStatusFieldUpdateOperationsInput | $Enums.LeadStatus
    score?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    lead?: LeadUpdateOneRequiredWithoutContactsNestedInput
    filter?: FilterUpdateOneWithoutContactsNestedInput
    tags?: ContactTagUpdateManyWithoutContactNestedInput
    interactions?: InteractionUpdateManyWithoutContactNestedInput
    outreach_messages?: OutreachMessageUpdateManyWithoutContactNestedInput
  }

  export type ContactUncheckedUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    lead_uuid?: StringFieldUpdateOperationsInput | string
    filter_uuid?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumLeadStatusFieldUpdateOperationsInput | $Enums.LeadStatus
    score?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tags?: ContactTagUncheckedUpdateManyWithoutContactNestedInput
    interactions?: InteractionUncheckedUpdateManyWithoutContactNestedInput
    outreach_messages?: OutreachMessageUncheckedUpdateManyWithoutContactNestedInput
  }

  export type ContactUncheckedUpdateManyWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    lead_uuid?: StringFieldUpdateOperationsInput | string
    filter_uuid?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumLeadStatusFieldUpdateOperationsInput | $Enums.LeadStatus
    score?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OutreachMessageUpdateWithoutUserInput = {
    uuid?: StringFieldUpdateOperationsInput | string
    channel?: EnumChannelFieldUpdateOperationsInput | $Enums.Channel
    subject?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    status?: EnumMsgStatusFieldUpdateOperationsInput | $Enums.MsgStatus
    scheduled_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sent_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    contact?: ContactUpdateOneRequiredWithoutOutreach_messagesNestedInput
  }

  export type OutreachMessageUncheckedUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    contact_uuid?: StringFieldUpdateOperationsInput | string
    channel?: EnumChannelFieldUpdateOperationsInput | $Enums.Channel
    subject?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    status?: EnumMsgStatusFieldUpdateOperationsInput | $Enums.MsgStatus
    scheduled_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sent_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OutreachMessageUncheckedUpdateManyWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    contact_uuid?: StringFieldUpdateOperationsInput | string
    channel?: EnumChannelFieldUpdateOperationsInput | $Enums.Channel
    subject?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    status?: EnumMsgStatusFieldUpdateOperationsInput | $Enums.MsgStatus
    scheduled_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sent_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OutreachSequenceUpdateWithoutUserInput = {
    uuid?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    steps?: JsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OutreachSequenceUncheckedUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    steps?: JsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OutreachSequenceUncheckedUpdateManyWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    steps?: JsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InteractionUpdateWithoutUserInput = {
    uuid?: StringFieldUpdateOperationsInput | string
    type?: EnumInteractionTypeFieldUpdateOperationsInput | $Enums.InteractionType
    content?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    contact?: ContactUpdateOneRequiredWithoutInteractionsNestedInput
  }

  export type InteractionUncheckedUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    contact_uuid?: StringFieldUpdateOperationsInput | string
    type?: EnumInteractionTypeFieldUpdateOperationsInput | $Enums.InteractionType
    content?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InteractionUncheckedUpdateManyWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    contact_uuid?: StringFieldUpdateOperationsInput | string
    type?: EnumInteractionTypeFieldUpdateOperationsInput | $Enums.InteractionType
    content?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RawLeadCreateManyFilterInput = {
    id?: number
    uuid?: string
    source_type: $Enums.SourceType
    raw_data: JsonNullValueInput | InputJsonValue
    processed_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ContactCreateManyFilterInput = {
    id?: number
    uuid?: string
    user_uuid: string
    lead_uuid: string
    status?: $Enums.LeadStatus
    score?: number | null
    notes?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type FilterJobCreateManyFilterInput = {
    id?: number
    uuid?: string
    status?: $Enums.JobStatus
    leads_found?: number
    duration?: number
    error?: string | null
    started_at?: Date | string
    completed_at?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type RawLeadUpdateWithoutFilterInput = {
    uuid?: StringFieldUpdateOperationsInput | string
    source_type?: EnumSourceTypeFieldUpdateOperationsInput | $Enums.SourceType
    raw_data?: JsonNullValueInput | InputJsonValue
    processed_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    lead?: LeadUpdateOneWithoutRaw_leadNestedInput
  }

  export type RawLeadUncheckedUpdateWithoutFilterInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    source_type?: EnumSourceTypeFieldUpdateOperationsInput | $Enums.SourceType
    raw_data?: JsonNullValueInput | InputJsonValue
    processed_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    lead?: LeadUncheckedUpdateOneWithoutRaw_leadNestedInput
  }

  export type RawLeadUncheckedUpdateManyWithoutFilterInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    source_type?: EnumSourceTypeFieldUpdateOperationsInput | $Enums.SourceType
    raw_data?: JsonNullValueInput | InputJsonValue
    processed_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ContactUpdateWithoutFilterInput = {
    uuid?: StringFieldUpdateOperationsInput | string
    status?: EnumLeadStatusFieldUpdateOperationsInput | $Enums.LeadStatus
    score?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutContactsNestedInput
    lead?: LeadUpdateOneRequiredWithoutContactsNestedInput
    tags?: ContactTagUpdateManyWithoutContactNestedInput
    interactions?: InteractionUpdateManyWithoutContactNestedInput
    outreach_messages?: OutreachMessageUpdateManyWithoutContactNestedInput
  }

  export type ContactUncheckedUpdateWithoutFilterInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    user_uuid?: StringFieldUpdateOperationsInput | string
    lead_uuid?: StringFieldUpdateOperationsInput | string
    status?: EnumLeadStatusFieldUpdateOperationsInput | $Enums.LeadStatus
    score?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tags?: ContactTagUncheckedUpdateManyWithoutContactNestedInput
    interactions?: InteractionUncheckedUpdateManyWithoutContactNestedInput
    outreach_messages?: OutreachMessageUncheckedUpdateManyWithoutContactNestedInput
  }

  export type ContactUncheckedUpdateManyWithoutFilterInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    user_uuid?: StringFieldUpdateOperationsInput | string
    lead_uuid?: StringFieldUpdateOperationsInput | string
    status?: EnumLeadStatusFieldUpdateOperationsInput | $Enums.LeadStatus
    score?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FilterJobUpdateWithoutFilterInput = {
    uuid?: StringFieldUpdateOperationsInput | string
    status?: EnumJobStatusFieldUpdateOperationsInput | $Enums.JobStatus
    leads_found?: IntFieldUpdateOperationsInput | number
    duration?: IntFieldUpdateOperationsInput | number
    error?: NullableStringFieldUpdateOperationsInput | string | null
    started_at?: DateTimeFieldUpdateOperationsInput | Date | string
    completed_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FilterJobUncheckedUpdateWithoutFilterInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    status?: EnumJobStatusFieldUpdateOperationsInput | $Enums.JobStatus
    leads_found?: IntFieldUpdateOperationsInput | number
    duration?: IntFieldUpdateOperationsInput | number
    error?: NullableStringFieldUpdateOperationsInput | string | null
    started_at?: DateTimeFieldUpdateOperationsInput | Date | string
    completed_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FilterJobUncheckedUpdateManyWithoutFilterInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    status?: EnumJobStatusFieldUpdateOperationsInput | $Enums.JobStatus
    leads_found?: IntFieldUpdateOperationsInput | number
    duration?: IntFieldUpdateOperationsInput | number
    error?: NullableStringFieldUpdateOperationsInput | string | null
    started_at?: DateTimeFieldUpdateOperationsInput | Date | string
    completed_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ContactCreateManyLeadInput = {
    id?: number
    uuid?: string
    user_uuid: string
    filter_uuid?: string | null
    status?: $Enums.LeadStatus
    score?: number | null
    notes?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ContactUpdateWithoutLeadInput = {
    uuid?: StringFieldUpdateOperationsInput | string
    status?: EnumLeadStatusFieldUpdateOperationsInput | $Enums.LeadStatus
    score?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutContactsNestedInput
    filter?: FilterUpdateOneWithoutContactsNestedInput
    tags?: ContactTagUpdateManyWithoutContactNestedInput
    interactions?: InteractionUpdateManyWithoutContactNestedInput
    outreach_messages?: OutreachMessageUpdateManyWithoutContactNestedInput
  }

  export type ContactUncheckedUpdateWithoutLeadInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    user_uuid?: StringFieldUpdateOperationsInput | string
    filter_uuid?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumLeadStatusFieldUpdateOperationsInput | $Enums.LeadStatus
    score?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    tags?: ContactTagUncheckedUpdateManyWithoutContactNestedInput
    interactions?: InteractionUncheckedUpdateManyWithoutContactNestedInput
    outreach_messages?: OutreachMessageUncheckedUpdateManyWithoutContactNestedInput
  }

  export type ContactUncheckedUpdateManyWithoutLeadInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    user_uuid?: StringFieldUpdateOperationsInput | string
    filter_uuid?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumLeadStatusFieldUpdateOperationsInput | $Enums.LeadStatus
    score?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ContactTagCreateManyContactInput = {
    id?: number
    tag: string
    created_at?: Date | string
  }

  export type InteractionCreateManyContactInput = {
    id?: number
    uuid?: string
    user_uuid: string
    type: $Enums.InteractionType
    content?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type OutreachMessageCreateManyContactInput = {
    id?: number
    uuid?: string
    user_uuid: string
    channel: $Enums.Channel
    subject?: string | null
    content: string
    status?: $Enums.MsgStatus
    scheduled_at?: Date | string | null
    sent_at?: Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type ContactTagUpdateWithoutContactInput = {
    tag?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ContactTagUncheckedUpdateWithoutContactInput = {
    id?: IntFieldUpdateOperationsInput | number
    tag?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ContactTagUncheckedUpdateManyWithoutContactInput = {
    id?: IntFieldUpdateOperationsInput | number
    tag?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InteractionUpdateWithoutContactInput = {
    uuid?: StringFieldUpdateOperationsInput | string
    type?: EnumInteractionTypeFieldUpdateOperationsInput | $Enums.InteractionType
    content?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutInteractionsNestedInput
  }

  export type InteractionUncheckedUpdateWithoutContactInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    user_uuid?: StringFieldUpdateOperationsInput | string
    type?: EnumInteractionTypeFieldUpdateOperationsInput | $Enums.InteractionType
    content?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InteractionUncheckedUpdateManyWithoutContactInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    user_uuid?: StringFieldUpdateOperationsInput | string
    type?: EnumInteractionTypeFieldUpdateOperationsInput | $Enums.InteractionType
    content?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OutreachMessageUpdateWithoutContactInput = {
    uuid?: StringFieldUpdateOperationsInput | string
    channel?: EnumChannelFieldUpdateOperationsInput | $Enums.Channel
    subject?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    status?: EnumMsgStatusFieldUpdateOperationsInput | $Enums.MsgStatus
    scheduled_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sent_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutOutreach_messagesNestedInput
  }

  export type OutreachMessageUncheckedUpdateWithoutContactInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    user_uuid?: StringFieldUpdateOperationsInput | string
    channel?: EnumChannelFieldUpdateOperationsInput | $Enums.Channel
    subject?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    status?: EnumMsgStatusFieldUpdateOperationsInput | $Enums.MsgStatus
    scheduled_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sent_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OutreachMessageUncheckedUpdateManyWithoutContactInput = {
    id?: IntFieldUpdateOperationsInput | number
    uuid?: StringFieldUpdateOperationsInput | string
    user_uuid?: StringFieldUpdateOperationsInput | string
    channel?: EnumChannelFieldUpdateOperationsInput | $Enums.Channel
    subject?: NullableStringFieldUpdateOperationsInput | string | null
    content?: StringFieldUpdateOperationsInput | string
    status?: EnumMsgStatusFieldUpdateOperationsInput | $Enums.MsgStatus
    scheduled_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sent_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}