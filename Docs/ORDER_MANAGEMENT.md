# Order Management System

## Overview
The YieldShop now includes a complete order management system that allows users to:
- Place orders with full shipping details
- Store customer information securely in the database
- Track order history
- View order status and details

## Features

### 1. Order Placement
When a user clicks "Buy Now" on a product:
- A checkout modal appears
- User fills in:
  - **Personal Information**: Name, Email, Phone
  - **Shipping Address**: Address lines, City, State, ZIP, Country
  - **Quantity**: Number of items to order

### 2. Data Collection
All order information is stored in Supabase:
- Order ID (unique identifier)
- Wallet address
- Customer details (name, email, phone)
- Complete shipping address
- Product information
- Payment details
- Cashback and SHOP token rewards
- Order status

### 3. Order Tracking
Users can view their order history in the "My Orders" tab:
- All past orders displayed with details
- Order status badges (Pending, Confirmed, Processing, Shipped, Delivered, Cancelled)
- Shipping address display
- Rewards earned per order
- Order dates and timestamps

## Database Schema

### Orders Table
```sql
- id: UUID (primary key)
- order_id: TEXT (unique)
- wallet_address: TEXT
- customer_name: TEXT
- customer_email: TEXT
- customer_phone: TEXT
- address_line1: TEXT
- address_line2: TEXT (optional)
- city: TEXT
- state: TEXT
- postal_code: TEXT
- country: TEXT
- product_id: TEXT
- product_name: TEXT
- product_image: TEXT
- product_price: NUMERIC
- quantity: INTEGER
- retailer: TEXT
- category: TEXT
- payment_method: TEXT
- transaction_hash: TEXT
- total_amount: NUMERIC
- cashback_earned: NUMERIC
- shop_tokens_earned: NUMERIC
- status: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- shipped_at: TIMESTAMP
- delivered_at: TIMESTAMP
```

## Usage

### Setup Database
1. Run the SQL schema in your Supabase project:
```bash
supabase/migrations/orders_schema.sql
```

2. Ensure environment variables are set:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Customer Flow
1. Browse products on the Shop page
2. Click "Buy Now" on desired product
3. Fill in checkout form with personal and shipping details
4. Confirm order
5. Order is recorded on blockchain and in database
6. View order in "My Orders" tab

### Order Status Flow
- **Pending**: Order placed, awaiting confirmation
- **Confirmed**: Order confirmed by system
- **Processing**: Order being prepared
- **Shipped**: Order dispatched
- **Delivered**: Order received
- **Cancelled**: Order cancelled

## API Functions

### Create Order
```typescript
await createOrder(orderData: OrderData)
```

### Get User Orders
```typescript
await getUserOrders(walletAddress: string)
```

### Update Order Status
```typescript
await updateOrderStatus(orderId: string, status: string, additionalUpdates?: Partial<OrderData>)
```

### Get Order by ID
```typescript
await getOrderById(orderId: string)
```

## Rewards Calculation
- **Cashback**: 1% of order total
- **SHOP Tokens**: 1% of order total
- **Yield**: Cashback earns 5% APY during 30-day return period

## Security Features
- Row Level Security (RLS) enabled
- Users can only view their own orders
- All personal data encrypted at rest
- Wallet address verification required

## Future Enhancements
- Order cancellation by user
- Order notes/comments
- Email notifications
- Order tracking numbers
- Integration with shipping APIs
- Admin dashboard for order management
