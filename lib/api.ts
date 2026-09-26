const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

class ApiClient {
  private token: string | null = null

  setToken(token: string) {
    this.token = token
    localStorage.setItem('auth_token', token)
  }

  getToken() {
    return this.token || localStorage.getItem('auth_token')
  }

  clearToken() {
    this.token = null
    localStorage.removeItem('auth_token')
  }

  private async request(method: string, endpoint: string, data?: any) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    const token = this.getToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const options: RequestInit = {
      method,
      headers,
    }

    if (data) {
      options.body = JSON.stringify(data)
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, options)

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }))
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error: unknown) {
      console.error(`API Error: ${endpoint}`, error)
      throw error
    }
  }

  async register(email: string, password: string, name: string) {
    const data = await this.request('POST', '/auth/register', { email, password, name })
    if (data.data?.accessToken) {
      this.setToken(data.data.accessToken)
    }
    return data
  }

  async login(email: string, password: string) {
    const data = await this.request('POST', '/auth/login', { email, password })
    if (data.data?.accessToken) {
      this.setToken(data.data.accessToken)
    }
    return data
  }

  async logout() {
    this.clearToken()
    return this.request('POST', '/auth/logout')
  }

  async getTransactions() {
    return this.request('GET', '/transactions')
  }

  async createTransaction(description: string, category: string, value: number, type: string, date: string) {
    return this.request('POST', '/transactions', { description, category, value, type, date })
  }

  async deleteTransaction(id: number) {
    return this.request('DELETE', `/transactions/${id}`)
  }

  async getAccounts() {
    return this.request('GET', '/accounts')
  }

  async createAccount(name: string, type: string, balance: number = 0) {
    return this.request('POST', '/accounts', { name, type, balance })
  }

  async deleteAccount(id: number) {
    return this.request('DELETE', `/accounts/${id}`)
  }

  async getBudgets(month?: string) {
    const query = month ? `?month=${month}` : ''
    return this.request('GET', `/budgets${query}`)
  }

  async createBudget(category: string, limit: number, month: string) {
    return this.request('POST', '/budgets', { category, limit, month })
  }

  async deleteBudget(id: number) {
    return this.request('DELETE', `/budgets/${id}`)
  }

  async getRecurring() {
    return this.request('GET', '/recurring')
  }

  async createRecurring(description: string, category: string, value: number, type: string, frequency: string, start_date: string, end_date?: string) {
    return this.request('POST', '/recurring', { description, category, value, type, frequency, start_date, end_date })
  }

  async updateRecurring(id: number, is_active: boolean) {
    return this.request('PATCH', `/recurring/${id}`, { is_active })
  }

  async deleteRecurring(id: number) {
    return this.request('DELETE', `/recurring/${id}`)
  }

  async getCategories() {
    return this.request('GET', '/categories')
  }

  async createCategory(name: string, color?: string, icon?: string) {
    return this.request('POST', '/categories', { name, color, icon })
  }

  async deleteCategory(id: number) {
    return this.request('DELETE', `/categories/${id}`)
  }

  async getTags() {
    return this.request('GET', '/tags')
  }

  async createTag(name: string, color?: string) {
    return this.request('POST', '/tags', { name, color })
  }

  async addTagToTransaction(tagId: number, transactionId: number) {
    return this.request('POST', `/tags/${tagId}/transactions/${transactionId}`)
  }

  async removeTagFromTransaction(tagId: number, transactionId: number) {
    return this.request('DELETE', `/tags/${tagId}/transactions/${transactionId}`)
  }

  async deleteTag(id: number) {
    return this.request('DELETE', `/tags/${id}`)
  }

  async connectPluggy(encryptedCredentials: string) {
    return this.request('POST', '/pluggy/connect', { encryptedCredentials })
  }

  async getPluggyAccounts() {
    return this.request('GET', '/pluggy/accounts')
  }

  async syncPluggyTransactions() {
    return this.request('POST', '/pluggy/sync')
  }
}

export const apiClient = new ApiClient()
