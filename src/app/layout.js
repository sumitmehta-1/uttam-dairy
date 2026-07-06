import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { ToastProvider } from '@/components/Toast';

export const metadata = {
  title: 'Uttam Dairy — Premium Farm Fresh Milk & Ghee',
  description: 'Order farm fresh cow milk, granular cow ghee, fresh paneer, cottage cheese, curd, and delicious dairy sweets. Delivered to your doorstep in 10 minutes.',
  keywords: 'dairy shop, fresh milk, pure cow ghee, buy paneer online, curd delivery, Uttam Dairy, local milk delivery, Dwarka dairy',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
