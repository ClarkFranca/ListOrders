const apiUrl = process.env.API_URL || 'http://localhost:5000/api';

export async function processOrder(orderId: number): Promise<void> {
  console.log(`[OrderProcessor] Iniciando processamento para o Pedido #${orderId}...`);
  
  // Simula alguma regra de enriquecimento ou verificacao assincrona
  // (ex: validacao com parceiro externo, calculo de frete, enriquecimento de dados)
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Atualiza para 'Processado' via callback na API .NET
  // Nota: O status 'Processando' ja foi definido pela API antes de chamar este processador
  try {
    const res = await fetch(`${apiUrl}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Processado' })
    });
    if (!res.ok) {
      console.error(`[OrderProcessor] Falha ao atualizar status para 'Processado'. Status: ${res.status}`);
    }
  } catch (err) {
    console.error(`[OrderProcessor] Erro de conexao com API para 'Processado':`, err);
  }

  console.log(`[OrderProcessor] Pedido #${orderId} processado e enriquecido com sucesso!`);
}

