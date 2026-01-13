export const PRODUCT_CONSTANTS = {
  MIN_STOCK: 0,
  MAX_STOCK: 1000,
  MIN_PRICE: 0.01,
  MAX_PRICE: 10000,
  CATEGORIES: [
    'Bebidas',
    'Comida Rápida',
    'Comida Mexicana',
    'Postres',
    'Vegetariano',
    'Mariscos',
    'Asados',
    'Antojos',
    'Saludable'
  ]
};

export const MESSAGE_PATTERNS = {
  PRODUCTS: {
    CREATE: 'create_product',
    GET_ALL: 'get_all_products',
    GET_BY_ID: 'get_product_by_id',
    UPDATE: 'update_product',
    DELETE: 'delete_product',
    UPDATE_STOCK: 'update_stock',
    CHECK_STOCK: 'check_stock',
    GET_BY_STALL: 'get_products_by_stall',
    GET_BY_CATEGORY: 'get_products_by_category'
  },
  CATALOG: {
    GET_PUBLIC: 'get_public_catalog',
    GET_DETAILS: 'get_product_details',
    SEARCH: 'search_products',
    GET_BY_STALL: 'get_active_products_by_stall'
  }
};