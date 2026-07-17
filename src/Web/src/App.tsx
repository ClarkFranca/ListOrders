import { OrdersPage } from './views/orders/OrdersPage';

function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <main style={{ flex: 1, padding: '1rem 0' }}>
        <OrdersPage />
      </main>
      
      <footer style={{ 
        textAlign: 'center', 
        padding: '1.5rem', 
        fontSize: '0.85rem', 
        color: 'var(--text-muted)',
        borderTop: '1px solid var(--bg-card-border)',
        marginTop: 'auto'
      }}>
        ListOrders &copy; {new Date().getFullYear()} &mdash; Desafio Técnico Full Stack Pleno
      </footer>
    </div>
  );
}

export default App;
