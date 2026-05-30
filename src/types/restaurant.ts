export type SubscriptionStatus = 'active' | 'inactive' | 'trial';

export type ThemeStyle = 'elegant-dark' | 'luxury-gold' | 'modern-cafe' | 'minimal-white' | 'fast-food-neon';

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  cuisine: string;
  logo: string;
  banner: string;
  backgroundImage?: string;
  themeColor: string;
  themeStyle: ThemeStyle;
  ownerId: string;
  subscriptionStatus: SubscriptionStatus;
  createdAt: Date;
  paymentSettings: {
    allowPrepaid: boolean;
    allowPostpaid: boolean;
    defaultPaymentMode: 'prepaid' | 'postpaid';
    upiId?: string;
    paymentQr?: string;
    paymentMode?: 'prepaid' | 'postpaid' | 'both'; // Deprecated
  };
}
