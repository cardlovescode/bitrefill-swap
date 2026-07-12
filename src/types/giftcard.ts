export interface GiftCardDenomination {
  value: number
  label: string
}

export interface GiftCardProduct {
  id: string
  name: string
  currency: string
  denominations: GiftCardDenomination[]
}

export interface GiftCardOrder {
  id: string
  status: string
  product: {
    id: string
    name: string
  }
  value: number
  redemptionInfo?: {
    code: string
    pin?: string
    instructions?: string
  }
}
