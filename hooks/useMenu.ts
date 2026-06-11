import { useState, useEffect } from 'react';
import { MenuData } from '../lib/menu';

export function useMenu() {
  const [data, setData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/assets/menu.json');
      if (!res.ok) throw new Error('Não foi possível carregar o cardápio');
      const json: MenuData = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  return { data, loading, error, refetch: fetchMenu };
}
