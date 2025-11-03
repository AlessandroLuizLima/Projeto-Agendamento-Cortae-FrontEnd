import api from './api';

export const productService = {
  // Listar todos os produtos
  async getAll(params = {}) {
    const response = await api.get('/products', { params });
    return response.data;
  },

  // Buscar produto por ID
  async getById(productId) {
    const response = await api.get(`/products/${productId}`);
    return response.data.product;
  },

  // Criar novo produto
  async create(productData) {
    const response = await api.post('/products', productData);
    return response.data.product;
  },

  // Atualizar produto
  async update(productId, productData) {
    const response = await api.put(`/products/${productId}`, productData);
    return response.data.product;
  },

  // Deletar produto
  async delete(productId) {
    const response = await api.delete(`/products/${productId}`);
    return response.data;
  },

  // Alternar status do produto
  async toggleStatus(productId) {
    const response = await api.patch(`/products/${productId}/toggle`);
    return response.data.product;
  },

  // Atualizar estoque
  async updateStock(productId, quantity, operation) {
    const response = await api.patch(`/products/${productId}/stock`, {
      quantity,
      operation // 'add', 'subtract', 'set'
    });
    return response.data.product;
  },

  // Buscar estatísticas de produtos
  async getStats() {
    const response = await api.get('/products/stats');
    return response.data;
  }
};