export enum ChatStatus {
  UNREAD = 'UNREAD',
  READ = 'READ',
  REPLIED = 'REPLIED',
}

export interface Chat {
  id: string;
  userId: string;
  storeId: string;
  buyerName: string;
  buyerAvatar?: string;
  productName?: string;
  message: string;
  status: ChatStatus;
  isReplied: boolean;
  reply?: string;
  createdAt: Date;
  updatedAt: Date;
  repliedAt?: Date;
}

export interface CreateChatReplyRequest {
  reply: string;
}
