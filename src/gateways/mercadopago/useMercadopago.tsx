import { useEffect, useState } from 'react'
import { UseFormSetError } from 'react-hook-form'
import { CreateCardToken, MercadoPago } from './protocols'

type Option = {
  label: string
  value: string
}

export type CardFlag = {
  id: string
  image: string
  name: string
}

export type CheckoutFormValues = {
  cardNumber: string
  cardExpirationMonth: string
  cardExpirationYear: string
  securityCode: string
  cardholderName: string
  cardholderEmail: string
  identificationNumber: string
  installments: string
  identificationType: string
}

type UseMercadoPagoProps = {
  setError: UseFormSetError<CheckoutFormValues>
}

type UseMercadoPago = {
  identificationTypeOptions: Option[]
  installmentOptions: Option[]
  cardFlag: CardFlag | null
  checkCardDigits: (cardNumber: string) => void
  setAmountValue: (amountValue: string) => void
  createToken: (cardInfo: CreateCardToken) => Promise<string>
}

export function useMercadoPago({
  setError
}: UseMercadoPagoProps): UseMercadoPago {
  const [mercadopago, setMercadopago] = useState<MercadoPago | null>(null)

  const [identificationTypeOptions, setIdentificationTypeOptions] = useState<
    Option[]
  >([])
  const [installmentOptions, setInstallmentOptions] = useState<Option[]>([])
  const [cardFlag, setCardFlag] = useState<CardFlag | null>(null)
  const [amount, setAmount] = useState<string | null>(null)
  const [errors, setErrors] = useState<string[] | null>([])

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://sdk.mercadopago.com/js/v2'

    script.addEventListener('load', () => {
      setMercadopago(
        new window.MercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_TOKEN, {
          locale: 'pt-BR',
          advancedFraudPrevention: true
        })
      )
    })

    document.body.appendChild(script)
    return () => {
      let iframe = document.body.querySelector('iframe[src*="mercadolibre"]')
      if (iframe) {
        document.body.removeChild(iframe)
      }
      document.body.removeChild(script)
    }
  }, [])

  useEffect(() => {
    if (mercadopago) {
      getIdentificationTypes()
    }
  }, [mercadopago])

  function setAmountValue(amountValue: string) {
    setAmount(amountValue)
  }

  async function getIdentificationTypes() {
    const identificationTypes = await mercadopago.getIdentificationTypes()
    const identificationType = identificationTypes.map(item => ({
      label: item.name,
      value: item.id
    }))
    setIdentificationTypeOptions(identificationType)
  }

  function checkCardDigits(cardNumber: string) {
    if (mercadopago) {
      const cardDigits = cardNumber.replace(/\s/g, '')
      if (cardDigits.length >= 6) {
        const bin = cardDigits.substring(0, 6)
        getCardFlag(bin)
        getInstallments(bin, amount)
      }
    }
  }

  async function getCardFlag(cardFirstSixDigit: string) {
    try {
      const paymentMethods = await mercadopago.getPaymentMethods({
        bin: cardFirstSixDigit
      })
      setCardFlag({
        id: paymentMethods.results[0].id,
        name: paymentMethods.results[0].name,
        image: `https://http2.mlstatic.com/frontend-assets/landing-op-internal-products/paymentMethods/checkout/credito/_${paymentMethods.results[0].id}.svg`
      })
      await getInstallments(cardFirstSixDigit, amount)
    } catch (err) {
      setError('cardNumber', { message: 'Invalid card number' })
    }
  }

  async function getInstallments(bin: string, price: string) {
    if (amount !== null) {
      const result = await mercadopago.getInstallments({
        amount: price,
        bin
      })
      if (result.length > 0) {
        const installments = result[0].payer_costs.map(item => ({
          label: item.recommended_message,
          value: String(item.installments)
        }))
        setInstallmentOptions(installments)
      }
    } else {
      throw new Error('Amount value is requires, use setAmountValue')
    }
  }

  async function createToken(cardInfo: CreateCardToken) {
    const cardNumber = cardInfo.cardNumber.replace(/\s/g, '')
    const cardToken = await mercadopago.createCardToken({
      cardNumber,
      cardholderName: cardInfo.cardholderName,
      cardExpirationMonth: cardInfo.cardExpirationMonth,
      cardExpirationYear: cardInfo.cardExpirationYear,
      securityCode: cardInfo.securityCode,
      identificationType: cardInfo.identificationType,
      identificationNumber: cardInfo.identificationNumber
    })

    return cardToken.id
  }

  return {
    identificationTypeOptions,
    installmentOptions,
    cardFlag,
    setAmountValue,
    checkCardDigits,
    createToken
  }
}
