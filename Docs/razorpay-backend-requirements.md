# Razorpay Backend Integration Requirements

## Why This Is Needed

The frontend now shows a "Pay Now" button on completed trip bookings where payment is still pending. When a customer taps "Pay Now", the app needs to:

1. Get a Razorpay order from the backend
2. Open the Razorpay checkout (handled by frontend)
3. Send the payment response back to the backend for verification

The existing `/api/v1/payments/` endpoints handle payment records but don't support the Razorpay-specific order creation and signature verification flow. We need 2 new endpoints.

---

## Required Changes

### 1. Install Razorpay Python SDK

```bash
pip install razorpay
```

### 2. Add Environment Variables

```
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxx
```

### 3. New Endpoint: Create Razorpay Order

**`POST /api/v1/payments/razorpay/create-order/`**

**What it does:**
- Takes a booking ID and amount from the frontend
- Creates an order on Razorpay using `razorpay_client.order.create()`
- Creates a pending payment record in our database linked to the booking
- Returns the Razorpay order ID and key to the frontend so it can open checkout

**Request Body:**
```json
{
  "booking_id": "uuid",
  "amount": "1500.00",
  "currency": "INR"
}
```

**Backend Logic:**
```python
import razorpay

client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

# 1. Validate booking exists and belongs to the authenticated user
# 2. Validate payment_status is not already 'completed'
# 3. Convert amount to paise (multiply by 100)
# 4. Create Razorpay order
order = client.order.create({
    "amount": amount_in_paise,  # e.g. 150000 for Rs 1500
    "currency": "INR",
    "receipt": f"booking_{booking_id}",
})

# 5. Create a Payment record in DB with:
#    - booking = booking_id
#    - payment_type = "ride_payment"
#    - transaction_type = "charge"
#    - amount = amount
#    - currency = "INR"
#    - payment_status = "pending"
#    - gateway_order_id = order["id"]

# 6. Return response
```

**Response (201):**
```json
{
  "order_id": "order_xxxxxxxxx",
  "amount": 150000,
  "currency": "INR",
  "payment_id": "uuid-of-payment-record",
  "key_id": "rzp_test_xxxxxxxxxx"
}
```

### 4. New Endpoint: Verify Razorpay Payment

**`POST /api/v1/payments/razorpay/verify/`**

**What it does:**
- Takes the Razorpay payment response (order_id, payment_id, signature) from the frontend
- Verifies the signature to confirm the payment is genuine (not tampered)
- Updates the payment record and booking payment status to "completed"

**Request Body:**
```json
{
  "razorpay_order_id": "order_xxxxxxxxx",
  "razorpay_payment_id": "pay_xxxxxxxxx",
  "razorpay_signature": "xxxxxxxxx",
  "payment_id": "uuid-of-payment-record"
}
```

**Backend Logic:**
```python
# 1. Find the Payment record by payment_id
# 2. Verify signature using Razorpay utility:
client.utility.verify_payment_signature({
    "razorpay_order_id": razorpay_order_id,
    "razorpay_payment_id": razorpay_payment_id,
    "razorpay_signature": razorpay_signature,
})
# This raises SignatureVerificationError if invalid

# 3. On success, update Payment record:
#    - payment_status = "completed"
#    - gateway_transaction_id = razorpay_payment_id
#    - processed_at = now()

# 4. Update the related Booking:
#    - payment_status = "completed"

# 5. Return success response
```

**Response (200):**
```json
{
  "success": true,
  "payment_status": "completed",
  "booking_id": "uuid"
}
```

**On signature verification failure (400):**
```json
{
  "success": false,
  "error": "Payment verification failed"
}
```

### 5. Webhook (Optional but Recommended)

**`POST /api/webhooks/razorpay/`**

This handles async payment events from Razorpay as a safety net (e.g. if the user closes the app before verification completes).

**Events to handle:**
- `payment.captured` - Mark payment as completed
- `payment.failed` - Mark payment as failed

**Verification:** Validate the webhook signature using `X-Razorpay-Signature` header and your webhook secret.

---

## Database Impact

No schema changes needed. The existing Payment model already has the required fields:
- `gateway_order_id` - stores Razorpay order ID
- `gateway_transaction_id` - stores Razorpay payment ID
- `gateway_response` - can store full Razorpay response JSON
- `payment_status` - already supports pending/processing/completed/failed
- `booking` - FK to the booking

---

## Auth

Both endpoints require JWT authentication (`jwtAuth`). The authenticated user must own the booking.

---

## Testing

Use Razorpay test mode credentials (`rzp_test_*` key). Test card: `4111 1111 1111 1111`, any future expiry, any CVV. Test UPI: `success@razorpay` for successful payments.
