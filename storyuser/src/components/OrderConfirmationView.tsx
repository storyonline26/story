import React from 'react';
import { CheckCircle, Truck, Calendar, CreditCard, ChevronRight, ShoppingCart } from 'lucide-react';
import { motion } from 'motion/react';
import { Order, ActiveScreen } from '../types';
import { formatINR } from '../utils/currency';

interface OrderConfirmationViewProps {
  order: Order | null;
  onBackToShopping: () => void;
  onViewOrders: () => void;
}

export const OrderConfirmationView: React.FC<OrderConfirmationViewProps> = ({
  order,
  onBackToShopping,
  onViewOrders
}) => {
  // Static mockup order details if no active checkout exists
  const displayId = order ? order.id : "ST-99281";
  const displayItems = order ? order.items : [
    {
      id: "mock1",
      product: {
        id: "structured-tote",
        name: "Structured Tote",
        price: 8490,
        category: "ACCESSORY",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBUdOifQXXFjAP-2voxiR3TdPsiaK1REIADzggwFb0A6flPZEe6OrH_SQB-pnQD67nqLUFqSnm3j7qLgirrDPU5NsdviVp_BoNOKLe_JVjFfqV_SLQSz66qUl6RzBnle2mD7UXyTw70htKkC-GvdH8gkwhT3VzmFFIxwG02wBjzRClCp9mpigPu2186bf_BhX6SK7ilJ941r_Z2V-hKwQ-PkvlQzNdxP-omEVDw6tOP5_jX9dEy_ZzDZUHf9FyonkqCXAt22IFRx08",
      },
      selectedSize: "ONE SIZE",
      selectedColor: { name: "NOIR", hex: "#121212" },
      quantity: 1
    },
    {
      id: "mock2",
      product: {
        id: "architectural-cuff",
        name: "Architectural Cuff",
        price: 2990,
        category: "ACCESSORY",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCRYxclZCvmRvj-pGhU7iifl6QHNI5wBjOpNy4_m3hmoY36_nX-W6B7mKTXGAxcfT61kAhsCmq8qDNmv7aM2yfM8MNEYvFQDzUsJlu-pF-2gdaD_muNiT8u2qQlsmZIytW_Ez_TTYPimRvZ8VEidQK8I8ww1vWn5wx-C29Nwe5gL9l4q_z9YcCEoWCHwkXZvV9qpMJKSjW7sQPBdrmJt59NMmdb0P-NHOoDu7c6cjqmhZSOHuXn59ulNsvpTREXPROkCr3yvpUowkk",
      },
      selectedSize: "M",
      selectedColor: { name: "SILVER", hex: "#E5E5E5" },
      quantity: 1
    }
  ];

  const subtotal = order ? order.subtotal : 11480;
  const shipping = order ? order.shipping : 0;
  const tax = order ? order.tax : 2066.40;
  const total = order ? order.total : 0;

  const address = order ? order.address : {
    fullName: "",
    street: "",
    city: "",
    country: "India"
  };

  const payment = order ? order.paymentMethod : "UPI / RuPay verified";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      id="order-confirmation-view-container"
      className="max-w-4xl mx-auto px-4 py-12 md:py-16 space-y-12"
    >
      
      {/* Huge Header success signal */}
      <div className="text-center flex flex-col items-center space-y-4" id="success-header-section">
        {/* Rounded-none sharp border check container from Mobile Draft */}
        <div className="w-16 h-16 border border-[#121212] flex items-center justify-center rounded-none mb-2 text-[#121212] bg-white">
          <CheckCircle size={32} strokeWidth={1} />
        </div>
        
        <div className="space-y-1.5">
          <span className="font-mono text-[8px] tracking-[0.25em] text-[#767676] bg-[#FAFAFA] py-1.5 px-4 border border-[#E5E5E5] font-semibold uppercase">
            TRANSACTION COMMITTED SECURELY
          </span>
          <h1 className="font-display font-light text-5xl sm:text-6xl text-[#121212] tracking-wider uppercase pt-2">
            THANK YOU
          </h1>
          <p className="font-mono text-[9px] text-[#767676] tracking-[0.2em] uppercase">
            YOUR ORDER HAS BEEN ENROLLED BY STORY DISPATCH
          </p>
        </div>
      </div>

      {/* Main Breakdown Layout - Double Panels */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-left border-t border-[#121212] pt-8 bg-white p-6 md:p-8" id="confirmation-receipt-shell">
        
        {/* Left Side: Summary and item sheets */}
        <div className="md:col-span-7 space-y-8">
          
          <div className="border-b border-[#FAFAFA] pb-4 space-y-1.5">
            <h3 className="font-mono text-xs font-semibold text-[#121212] uppercase">
              ORDER BATCH DETAILS
            </h3>
            <div className="flex justify-between font-mono text-[9px] text-[#767676] uppercase tracking-wider">
              <span>BATCH IDENTITY: <span className="text-[#121212] font-semibold">{displayId}</span></span>
              <span>LOGISTICS PIPELINE: <span className="text-[#121212] font-semibold">2-3 DAYS DISPATCH</span></span>
            </div>
          </div>

          {/* Purchased Items List */}
          <div className="space-y-4" id="receipt-items-list">
            {displayItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center space-x-4 border-b border-[#FAFAFA] pb-4"
                id={`receipt-item-card-${item.id}`}
              >
                {/* Image Cropper */}
                <div className="w-14 h-18 bg-[#FAFAFA] border border-[#E5E5E5] overflow-hidden shrink-0">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover grayscale"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Specs */}
                <div className="space-y-0.5 text-left select-none truncate">
                  <h4 className="font-sans font-medium text-xs text-[#121212] uppercase truncate">{item.product.name}</h4>
                  <p className="font-mono text-[9px] text-[#767676] uppercase">
                    SIZE: {item.selectedSize} - COLOUR: {item.selectedColor.name}
                  </p>
                  <p className="font-mono text-[9px] text-[#767676]">QUANTITY: {item.quantity}</p>
                </div>

                {/* Price tag */}
                <div className="ml-auto font-mono text-xs font-semibold text-[#121212]">
                  {formatINR(item.product.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Totals Calculator */}
          <div className="space-y-2 border-t border-[#FAFAFA] pt-4 font-mono text-xs text-[#767676]" id="receipt-totals-box">
            <div className="flex justify-between">
              <span>SUBTOTAL DIARY</span>
              <span className="text-[#121212] font-medium">{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>ESTIMATED INSURED SHIPPING</span>
              <span className="text-[#121212] font-medium">{formatINR(shipping)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%)</span>
              <span className="text-[#121212] font-medium">{formatINR(tax)}</span>
            </div>
            
            <div className="flex justify-between border-t border-[#121212] pt-4 text-sm text-[#121212] font-semibold">
              <span>TOTAL VALUE DEPOSITED</span>
              <span>{formatINR(total)}</span>
            </div>
          </div>

        </div>

        {/* Right Side: Shipping and delivery cards info */}
        <div className="md:col-span-5 bg-[#FAFAFA] border border-[#E5E5E5] p-6 space-y-6">
          
          {/* Shipping Address Cards */}
          <div className="space-y-3">
            <h4 className="font-mono text-[10px] tracking-widest text-[#767676] font-semibold uppercase flex items-center gap-1.5 border-b border-[#E5E5E5] pb-2">
              <Truck size={12} />
              <span>DELIVERY COORDINATES</span>
            </h4>
            
            <div className="space-y-0.5 font-sans text-xs text-[#5C5C60] leading-relaxed">
              <p className="font-semibold text-[#121212] uppercase">{address.fullName}</p>
              <p>{address.street}</p>
              <p>{address.city}</p>
              <p className="uppercase font-semibold text-[9px] text-[#121212] mt-1">{address.country}</p>
            </div>
          </div>

          {/* Payment receipt confirmation details */}
          <div className="space-y-3">
            <h4 className="font-mono text-[10px] tracking-widest text-[#767676] font-semibold uppercase flex items-center gap-1.5 border-b border-[#E5E5E5] pb-2">
              <CreditCard size={12} />
              <span>DEPOSITION METHOD</span>
            </h4>
            
            <div className="space-y-1 font-mono text-[10px] text-[#5C5C60]">
              <p className="font-semibold text-[#121212]">{payment}</p>
              <p className="text-[9px]">SECURITY VERIFIED: UPI / RUPAY CHECKOUT</p>
            </div>
          </div>

          {/* Timeline details */}
          <div className="space-y-3">
            <h4 className="font-mono text-[10px] tracking-widest text-[#767676] font-semibold uppercase flex items-center gap-1.5 border-b border-[#E5E5E5] pb-2">
              <Calendar size={12} />
              <span>LOGISTICS TIMELINE</span>
            </h4>
            
            <div className="space-y-1 text-xs font-sans text-[#5C5C60] font-light leading-relaxed">
              <p>A shipping notification containing your active tracking link will be sent to your verified inbox as soon as Blue Dart or Delhivery secures the package.</p>
            </div>
          </div>

        </div>

      </div>

      {/* Redirect back navigation buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4" id="confirmation-redirects">
        <button
          onClick={onBackToShopping}
          className="bg-[#121212] hover:bg-black text-white py-4 px-8 font-mono text-xs tracking-widest font-semibold transition-all cursor-pointer inline-flex items-center justify-center space-x-2"
          id="confirm-continue-shopping-btn"
        >
          <span>CONTINUE SHOPPING</span>
        </button>

        <button
          onClick={onViewOrders}
          className="border border-[#121212] bg-white text-[#121212] hover:bg-neutral-50 py-4 px-8 font-mono text-xs tracking-widest font-semibold transition-all cursor-pointer inline-flex items-center justify-center space-x-2"
          id="confirm-view-orders-btn"
        >
          <span>VIEW ORDERS</span>
        </button>
      </div>

    </motion.div>
  );
};
