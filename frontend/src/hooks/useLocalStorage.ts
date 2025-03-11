import { useState, useEffect } from 'react';

// Hook para persistência de dados no localStorage
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Estado para armazenar o valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Recuperar do localStorage pelo key
      const item = window.localStorage.getItem(key);
      // Analisar JSON armazenado ou retornar initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Se ocorrer erro, retornar initialValue
      console.error(`Erro ao recuperar do localStorage: ${key}`, error);
      return initialValue;
    }
  });

  // Função para atualizar valor no estado e localStorage
  const setValue = (value: T) => {
    try {
      // Permitir valor como função
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Salvar no estado
      setStoredValue(valueToStore);
      // Salvar no localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Erro ao salvar no localStorage: ${key}`, error);
    }
  };

  // Atualizar localStorage se a chave mudar
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Erro ao atualizar localStorage: ${key}`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
} 