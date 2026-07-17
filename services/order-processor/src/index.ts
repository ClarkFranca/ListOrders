import express from 'express';
import { processOrder } from './orderProcessor';

const app = express();
const port = 3000;

app.use(express.json());

app.post('/orders/process', async (req, res) => {
  const { orderId } = req.body;

  if (typeof orderId !== 'number') {
    return res.status(400).json({ error: 'orderId deve ser um número válido.' });
  }

  res.status(202).json({ status: 'processando', orderId });

  try {
    await processOrder(orderId);
  } catch (error) {
    console.error(`[OrderProcessor] Erro ao processar o Pedido #${orderId}:`, error);
  }
});

app.listen(port, () => {
  console.log(`[OrderProcessor] Microsserviço ativo na porta ${port}`);
});
