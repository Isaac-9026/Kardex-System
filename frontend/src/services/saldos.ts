import api from './api'
import type { SaldoInicial } from '../types'

export const getSaldo = async (codigo: string): Promise<SaldoInicial | null> => {
  const response = await api.get(`/saldos/${codigo}`)
  return response.data
}

export const getAllSaldos = async (): Promise<SaldoInicial[]> => {
  const response = await api.get('/saldos')
  return response.data
}

export const createSaldo = async (saldo: Omit<SaldoInicial, 'id'>): Promise<SaldoInicial> => {
  const response = await api.post('/saldos', saldo)
  return response.data
}

export const updateSaldo = async (codigo: string, saldo: Partial<SaldoInicial>): Promise<SaldoInicial> => {
  const response = await api.put(`/saldos/${codigo}`, saldo)
  return response.data
}