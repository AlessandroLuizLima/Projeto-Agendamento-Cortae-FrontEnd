import React, { useState, useEffect } from "react";
import { 
  FiEdit, 
  FiTrash2, 
  FiX, 
  FiAlertTriangle,
  FiSearch,
  FiPlus,
  FiPackage,
  FiTrendingUp,
  FiEye,
  FiEyeOff,
  FiBarChart,
  FiShoppingCart,
  FiBox
} from "react-icons/fi";
import "./Products.css";

// ✅ URL CORRETA DA API
const API_URL = 'http://localhost:3000/api/products';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("todos");
  const [sortBy, setSortBy] = useState("name");
  const [editingProduct, setEditingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [formProduct, setFormProduct] = useState({
    name: "",
    price: "",
    quantity: "",
    category: "cuidados",
    description: "",
    cost: ""
  });

  const categories = [
    { key: "todos", label: "Todos", icon: FiBarChart },
    { key: "cuidados", label: "Cuidados", icon: FiPackage },
    { key: "styling", label: "Styling", icon: FiBox },
    { key: "barba", label: "Barba", icon: FiPackage },
    { key: "acessorios", label: "Acessórios", icon: FiBox }
  ];

  // ===== CARREGAR PRODUTOS =====
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Buscando produtos em:', API_URL);
      const response = await fetch(API_URL);
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ Resposta da API:', result);
      
      // A API retorna { success: true, data: [...] }
      const productsData = result.data || result;
      setProducts(productsData);
      console.log('✅ Produtos carregados:', productsData.length);
    } catch (err) {
      console.error('❌ Erro ao buscar produtos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== ESTATÍSTICAS =====
  const totalProducts = products.length;
  const mostSold = products.length > 0 
    ? products.reduce((prev, current) => 
        ((prev.totalSold || 0) > (current.totalSold || 0)) ? prev : current, products[0]
      ) 
    : null;

  // ===== FILTROS E ORDENAÇÃO =====
  const getFilteredAndSortedProducts = () => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (product.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === "todos" || product.category === filterCategory;
      return matchesSearch && matchesCategory;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price":
          return b.price - a.price;
        case "quantity":
          return b.quantity - a.quantity;
        case "sales":
          return (b.totalSold || 0) - (a.totalSold || 0);
        default:
          return 0;
      }
    });
  };

  const filteredProducts = getFilteredAndSortedProducts();

  const formatName = (name) =>
    name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

  const openAddModal = () => {
    setEditingProduct(null);
    setFormProduct({ 
      name: "", 
      price: "", 
      quantity: "", 
      category: "cuidados",
      description: "",
      cost: ""
    });
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormProduct({
      name: product.name,
      price: product.price.toString(),
      quantity: product.quantity.toString(),
      category: product.category,
      description: product.description || "",
      cost: (product.cost || 0).toString()
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormProduct({ 
      name: "", 
      price: "", 
      quantity: "", 
      category: "cuidados",
      description: "",
      cost: ""
    });
  };

  const openDeleteConfirm = (product) => {
    setProductToDelete(product);
    setShowDeleteConfirm(true);
  };

  const closeDeleteConfirm = () => {
    setProductToDelete(null);
    setShowDeleteConfirm(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormProduct((prev) => ({ ...prev, [name]: value }));
  };

  // ===== SALVAR PRODUTO (CREATE/UPDATE) =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formProduct.name || !formProduct.price || !formProduct.quantity) {
      alert('Preencha todos os campos obrigatórios!');
      return;
    }

    const formattedName = formatName(formProduct.name);

    const productData = {
      name: formattedName,
      price: parseFloat(formProduct.price),
      quantity: parseInt(formProduct.quantity, 10),
      category: formProduct.category,
      description: formProduct.description || "",
      cost: parseFloat(formProduct.cost) || 0,
      active: editingProduct ? editingProduct.active : true
    };

    try {
      const url = editingProduct ? `${API_URL}/${editingProduct.id}` : API_URL;
      const method = editingProduct ? 'PUT' : 'POST';

      console.log(`${method} ${url}`, productData);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao salvar produto');
      }

      console.log('✅ Produto salvo com sucesso');
      await fetchProducts();
      closeModal();
      
    } catch (err) {
      console.error('❌ Erro ao salvar produto:', err);
      alert('Erro ao salvar produto: ' + err.message);
    }
  };

  // ===== DELETAR PRODUTO =====
  const confirmRemove = async () => {
    if (!productToDelete) return;

    try {
      console.log(`DELETE ${API_URL}/${productToDelete.id}`);
      
      const response = await fetch(`${API_URL}/${productToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao deletar produto');
      }

      console.log('✅ Produto deletado com sucesso');
      await fetchProducts();
      closeDeleteConfirm();
      
    } catch (err) {
      console.error('❌ Erro ao deletar produto:', err);
      alert('Erro ao deletar produto: ' + err.message);
    }
  };

  // ===== ATIVAR/DESATIVAR PRODUTO =====
  const toggleProductStatus = async (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    try {
      console.log(`PUT ${API_URL}/${productId} - Toggle active`);
      
      const response = await fetch(`${API_URL}/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...product,
          active: !product.active
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao atualizar status');
      }

      console.log('✅ Status atualizado com sucesso');
      await fetchProducts();
      
    } catch (err) {
      console.error('❌ Erro ao atualizar status:', err);
      alert('Erro ao atualizar status: ' + err.message);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const getCategoryIcon = (category) => {
    const categoryData = categories.find(cat => cat.key === category);
    const IconComponent = categoryData ? categoryData.icon : FiPackage;
    return <IconComponent size={16} />;
  };

  const getStockStatus = (quantity, active) => {
    if (!active) return 'Inativo';
    if (quantity === 0) return 'Fora de Estoque';
    if (quantity <= 5) return 'Estoque Baixo';
    return 'Em Estoque';
  };

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <div className="products-page">
        <div className="container">
          <div className="loading-state">
            <FiPackage size={48} />
            <p>Carregando produtos...</p>
          </div>
        </div>
      </div>
    );
  }

  // ===== ERROR STATE =====
  if (error) {
    return (
      <div className="products-page">
        <div className="container">
          <div className="error-state">
            <FiAlertTriangle size={48} />
            <h3>Erro ao carregar produtos</h3>
            <p>{error}</p>
            <button className="button-primary" onClick={fetchProducts}>
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="container">
        {/* Header */}
        <div className="header">
          <div>
            <h1>Gestão de Produtos</h1>
            <p>Configure e gerencie todos os produtos da barbearia</p>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="stats-grid-simple">
          <div className="stat-card" tabIndex={0}>
            <div className="stat-card-content">
              <div>
                <p>Total de Produtos</p>
                <p className="stat-number total">{totalProducts}</p>
                <div className="stat-change neutral">
                  <FiPackage size={16} />
                  <span>Produtos cadastrados</span>
                </div>
              </div>
              <div className="stat-icon blue">
                <FiPackage size={24} />
              </div>
            </div>
          </div>

          <div className="stat-card" tabIndex={0}>
            <div className="stat-card-content">
              <div>
                <p>Mais Vendido</p>
                <p className="stat-number period">{mostSold?.name || 'N/A'}</p>
                <div className="stat-change neutral">
                  <FiTrendingUp size={16} />
                  <span>{mostSold?.totalSold || 0} vendas</span>
                </div>
              </div>
              <div className="stat-icon red">
                <FiTrendingUp size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Controles de Busca e Filtros */}
        <div className="search-section">
          <div className="search-controls">
            <div className="search-container">
              <FiSearch className="search-icon" size={20} />
              <input
                type="text"
                className="search-input"
                placeholder="Buscar produtos por nome ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filters-container">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="filter-select"
              >
                {categories.map(category => (
                  <option key={category.key} value={category.key}>
                    {category.label}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="name">Ordenar por Nome</option>
                <option value="price">Maior Preço</option>
                <option value="quantity">Maior Estoque</option>
                <option value="sales">Mais Vendido</option>
              </select>
            </div>

            <button className="add-button" onClick={openAddModal}>
              <FiPlus size={20} />
              Novo Produto
            </button>
          </div>
        </div>

        {/* Lista de Produtos */}
        <div className="products-list">
          <div className="products-list-header">
            <h2>Lista de Produtos ({filteredProducts.length})</h2>
          </div>
          
          <div className="products-list-content">
            {filteredProducts.length === 0 ? (
              <div className="no-products">
                <FiPackage size={48} />
                <h3>Nenhum produto encontrado</h3>
                <p>
                  {searchTerm || filterCategory !== "todos"
                    ? 'Tente alterar os filtros ou termos de busca'
                    : 'Cadastre seu primeiro produto para começar'}
                </p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div key={product.id} className="product-item">
                  <div className="product-content">
                    <div className="product-left">
                      <div className="product-icon">
                        {getCategoryIcon(product.category)}
                      </div>
                      <div className="product-info">
                        <div className="product-name-row">
                          <h3>{product.name}</h3>
                          <span className={`status-badge ${product.active ? 'status-active' : 'status-inactive'}`}>
                            {getStockStatus(product.quantity, product.active)}
                          </span>
                        </div>
                        <div className="product-meta">
                          <span className="category">
                            {categories.find(cat => cat.key === product.category)?.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="product-right">
                      <div className="product-stats-simple">
                        <div className="stat-item">
                          <span className="stat-label">Preço</span>
                          <span className="stat-value primary">{formatPrice(product.price)}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Estoque</span>
                          <span className="stat-value">
                            <FiBox size={14} />
                            {product.quantity} un.
                          </span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Vendas</span>
                          <span className="stat-value">
                            <FiShoppingCart size={14} />
                            {product.totalSold || 0}
                          </span>
                        </div>
                      </div>
                      
                      <div className="product-actions">
                        <button
                          onClick={() => toggleProductStatus(product.id)}
                          className={`action-button toggle ${product.active ? 'active' : 'inactive'}`}
                          title={product.active ? 'Desativar produto' : 'Ativar produto'}
                        >
                          {product.active ? <FiEye size={16} /> : <FiEyeOff size={16} />}
                        </button>
                        <button
                          onClick={() => openEditModal(product)}
                          className="action-button edit"
                          title="Editar produto"
                        >
                          <FiEdit size={16} />
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(product)}
                          className="action-button delete"
                          title="Excluir produto"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal de Cadastro/Edição */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>{editingProduct ? "Editar Produto" : "Cadastrar Novo Produto"}</h2>
                <button className="modal-close" onClick={closeModal}>
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-content">
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Nome do Produto *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Ex: Shampoo Masculino"
                        name="name"
                        value={formProduct.name}
                        onChange={handleInputChange}
                        required
                        autoFocus
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Categoria *</label>
                      <select
                        className="form-input"
                        name="category"
                        value={formProduct.category}
                        onChange={handleInputChange}
                        required
                      >
                        {categories.slice(1).map(category => (
                          <option key={category.key} value={category.key}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Preço (R$) *</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="Ex: 45.00"
                        step="0.01"
                        min="0"
                        name="price"
                        value={formProduct.price}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Custo (R$)</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="Ex: 25.00"
                        step="0.01"
                        min="0"
                        name="cost"
                        value={formProduct.cost}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Quantidade *</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="Ex: 15"
                        min="0"
                        name="quantity"
                        value={formProduct.quantity}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group form-group-full">
                      <label className="form-label">Descrição</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Breve descrição do produto"
                        name="description"
                        value={formProduct.description}
                        onChange={handleInputChange}
                        maxLength={200}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="button-secondary" onClick={closeModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="button-primary">
                    {editingProduct ? "Salvar Alterações" : "Cadastrar Produto"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Exclusão */}
        {showDeleteConfirm && (
          <div className="modal-overlay">
            <div className="modal modal-delete">
              <div className="modal-header">
                <h2>
                  <FiAlertTriangle className="alert-icon" />
                  Confirmar Exclusão
                </h2>
                <button className="modal-close" onClick={closeDeleteConfirm}>
                  <FiX size={20} />
                </button>
              </div>

              <div className="modal-content">
                <p>
                  Deseja realmente excluir o produto <strong>{productToDelete?.name}</strong>?
                </p>
                <div className="delete-warning">
                  <FiAlertTriangle size={16} />
                  <span>Esta ação não pode ser desfeita</span>
                </div>
              </div>

              <div className="modal-footer">
                <button className="button-secondary" onClick={closeDeleteConfirm}>
                  Cancelar
                </button>
                <button className="button-primary danger" onClick={confirmRemove}>
                  Confirmar Exclusão
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;