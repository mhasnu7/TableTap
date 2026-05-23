export type SubscriptionStatus = 'active' | 'inactive' | 'trial';

export interface Restaurant {
  id: string;
  name: string;
  logo: string;
  banner: string;
  themeColor: string;
  ownerId: string;
  subscriptionStatus: SubscriptionStatus;
  createdAt: Date;
}
