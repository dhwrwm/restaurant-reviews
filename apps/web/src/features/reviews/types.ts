export interface Reviews {
  id: string;
  restaurantId: string;
  reviewerId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  reviewer: Reviewer;
}

export interface Reviewer {
  id: string;
  email: string;
  name: string;
}
