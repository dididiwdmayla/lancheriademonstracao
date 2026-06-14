import menuData from '../public/assets/menu.json';
import { CartItem } from './menu';

export function calcularTotal(itens: any[]): { subtotal: number, total: number } {
  let subtotal = 0;
  
  for (const clienteItem of itens) {
    // Achar o item de menu correspondente
    let precoBase = 0;
    const lancheEncontrado = menuData.lanches.find((l: any) => l.id === clienteItem.id);
    if (lancheEncontrado) {
       precoBase = lancheEncontrado.preco;
    } else {
       const acompanhamentoEncontrado = menuData.acompanhamentos.find((o: any) => o.id === clienteItem.id);
       if (acompanhamentoEncontrado) {
           precoBase = acompanhamentoEncontrado.preco;
       } else {
           const bebidaEncontrada = menuData.bebidas.find((b: any) => b.id === clienteItem.id);
           if (bebidaEncontrada) {
               precoBase = bebidaEncontrada.preco;
           } else {
               throw new Error(`Item ${clienteItem.id} não encontrado no cardápio.`);
           }
       }
    }
    
    // Calcular adicionais com preços oficiais do servidor (para lanches)
    let precoAdicionais = 0;
    if (clienteItem.adicionais && clienteItem.adicionais.length > 0) {
      for (const clienteAddon of clienteItem.adicionais) {
        // procurar o preco desse adicional no menu de adicionais
        const addonData = menuData.adicionais.find((a: any) => a.id === clienteAddon.id);
        if (addonData) {
           precoAdicionais += (addonData.preco * clienteAddon.qtd);
        } else {
           throw new Error(`Adicional ${clienteAddon.id} não encontrado no cardápio.`);
        }
      }
    }
    
    // Molhos são grátis, ignoramos no cálculo do preço final
    
    subtotal += (precoBase + precoAdicionais) * clienteItem.quantidade;
  }
  
  return {
    subtotal,
    total: subtotal // + frete no futuro, mas hoje o total = subtotal
  };
}
