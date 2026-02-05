/**
 * @file apollo-client.ts
 * @description إعدادات عميل Apollo للعمليات GraphQL
 * @module graphql
 */

import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { logger } from '@/lib/logger';

/**
 * نقطة النهاية لـ GraphQL
 * @constant {string} GRAPHQL_ENDPOINT
 * @description يُحمل من متغيرات البيئة أو يستخدم القيمة الافتراضية
 */
const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql';

/**
 * ربط معالجة الأخطاء لـ GraphQL
 * @constant {ApolloLink} errorLink
 * @description يتعامل مع أخطاء GraphQL وأخطاء الشبكة ويسجلها في وحدة التحكم
 * @example
 * // عند حدوث خطأ GraphQL:
 * // [GraphQL error]: Message: Error message, Location: [...], Path: [...], Operation: queryName
 * 
 * // عند حدوث خطأ شبكة:
 * // [Network error]: Failed to fetch
 */
const errorLink = onError((errorData) => {
  const graphQLErrors = (errorData as unknown as { graphQLErrors?: Array<{ message: string; locations?: unknown; path?: unknown }> }).graphQLErrors;
  const networkError = (errorData as unknown as { networkError?: Error }).networkError;
  const operation = (errorData as unknown as { operation?: { operationName?: string } }).operation;
  
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      logger.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}, Operation: ${operation?.operationName}`
      );
    });
  }

  if (networkError) {
    logger.error(`[Network error]: ${networkError.message}`);
    
    if (networkError.name === 'TypeError' && networkError.message.includes('fetch')) {
      logger.error('Failed to connect to GraphQL server. Please check if the server is running.');
    }
  }
});

/**
 * ربط HTTP للتواصل مع خادم GraphQL
 * @constant {HttpLink} httpLink
 * @description يُنشئ اتصال HTTP بخادم GraphQL مع الإعدادات المناسبة
 */
const httpLink = new HttpLink({
  uri: GRAPHQL_ENDPOINT,
  credentials: 'same-origin',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * عميل Apollo الرئيسي
 * @constant {ApolloClient} apolloClient
 * @description عميل GraphQL مُعد مسبقاً مع التخزين المؤقت والسياسات
 * @property {ApolloLink} link - سلسلة الروابط (معالجة الأخطاء → HTTP)
 * @property {InMemoryCache} cache - نظام التخزين المؤقت
 * @property {Object} defaultOptions - الخيارات الافتراضية للعمليات
 * @example
 * // الاستخدام في مكون:
 * import { useQuery } from '@apollo/client';
 * import { apolloClient } from '@/graphql/apollo-client';
 * 
 * function StudentsList() {
 *   const { data, loading, error } = useQuery(GET_STUDENTS, { client: apolloClient });
 *   // ...
 * }
 * 
 * // الاستخدام مباشرة:
 * const result = await apolloClient.query({
 *   query: GET_STUDENTS,
 *   variables: { limit: 10 }
 * });
 */
export const apolloClient = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          /**
           * سياسة تخزين الطلاب مع دعم الترقيم الصفحي
           * @property {string[]} keyArgs - المفاتيح المؤثرة في التخزين
           * @property {Function} merge - دمج البيانات الجديدة مع الموجودة
           */
          students: {
            keyArgs: ['search', 'department'],
            merge(existing, incoming) {
              if (!existing) return incoming;
              return {
                ...incoming,
                items: [...existing.items, ...incoming.items],
              };
            },
          },
          /**
           * سياسة تخزين المواد الدراسية
           * @property {string[]} keyArgs - المفاتيح المؤثرة في التخزين
           * @property {Function} merge - دمج البيانات الجديدة مع الموجودة
           */
          courses: {
            keyArgs: ['search', 'department'],
            merge(existing, incoming) {
              if (!existing) return incoming;
              return {
                ...incoming,
                items: [...existing.items, ...incoming.items],
              };
            },
          },
        },
      },
    },
  }),
  /**
   * الخيارات الافتراضية للعمليات المختلفة
   */
  defaultOptions: {
    /** خيارات استعلامات المراقبة */
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    /** خيارات الاستعلامات العادية */
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
    /** خيارات التعديلات */
    mutate: {
      errorPolicy: 'all',
    },
  },
});

export default apolloClient;
