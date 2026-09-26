export const mockUser = {
  name: 'Wagner',
  email: 'queiroz.wagner@gmail.com',
}

export const mockStats = {
  gastoSetembro: 2850.50,
  comparacaoAnterior: -12.5,
  maiorGasto: 'Supermercado',
}

export const mockTransactions = [
  { id: 1, description: 'Pagamento recebido', category: 'Salário', value: 5000, type: 'income', date: '2026-09-26' },
  { id: 2, description: 'Supermercado', category: 'Alimentação', value: -450, type: 'expense', date: '2026-09-25' },
  { id: 3, description: 'Netflix', category: 'Streaming', value: -50, type: 'expense', date: '2026-09-24' },
  { id: 4, description: 'Freelance', category: 'Renda Extra', value: 1200, type: 'income', date: '2026-09-23' },
  { id: 5, description: 'Gasolina', category: 'Transporte', value: -250, type: 'expense', date: '2026-09-22' },
]

export const mockCategories = [
  { name: 'Alimentação', value: 850, percentage: 30 },
  { name: 'Streaming', value: 150, percentage: 5 },
  { name: 'Transporte', value: 500, percentage: 18 },
  { name: 'Outros', value: 900, percentage: 32 },
]
