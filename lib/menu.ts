export type Tag = "NOVO" | "MAIS PEDIDO" | "QUASE ACABOU";

export type Lanche = {
  id: string;
  nome: string;
  preco: number;
  descricao: string;
  tag?: Tag;
  imagem: string;
};

export type Adicional = {
  id: string;
  nome: string;
  preco: number;
  imagem: string;
};

export type ItemSimples = {
  id: string;
  nome: string;
  preco: number;
  imagem: string;
};

export type MenuData = {
  lanches: Lanche[];
  adicionais: Adicional[];
  molhos: ItemSimples[];
  bebidas: ItemSimples[];
  acompanhamentos: ItemSimples[];
};

export type CartItemAddon = {
  item: Adicional;
  quantidade: number;
};

export type CartItemMolho = {
  item: ItemSimples;
  quantidade: number;
};

export type CartItem = {
  cartItemId: string; // Unique ID for cart entry (combines item id + addons + etc)
  item: Lanche | ItemSimples;
  adicionais: CartItemAddon[];
  molhos: CartItemMolho[];
  quantidade: number;
  observacao: string;
  isLanche: boolean;
};

export const WHATSAPP_NUMBER = "5544984570105";

// Constants for open hours (Tue-Sun, 18-23h)
export const OPEN_DAYS = [0, 2, 3, 4, 5, 6]; // 0=Sun, 2=Tue...
export const OPEN_HOUR = 18;
export const CLOSE_HOUR = 23;
