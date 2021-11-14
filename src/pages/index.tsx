import { useEffect, useState } from 'react'
import { MercadoPago } from '../gateways/mercadopago/protocols'
import { useForm } from 'react-hook-form'
import {
  CheckoutFormValues,
  useMercadoPago
} from '../gateways/mercadopago/useMercadopago'
import { Input } from '../components/Form/Input'
import { yupResolver } from '@hookform/resolvers/yup/dist/yup'
import * as yup from 'yup'
import { validateCard } from '../gateways/mercadopago/protocols/validateCard'
import { Select } from '../components/Form/Select'
import { CreditCard } from '../components/CreditCard/CreditCard'

const schema = yup.object({
  cardNumber: yup
    .string()
    .test('len', 'Invalid card', value => {
      const cardNumber = value.replace(/[^0-9]+/g, '')
      return (
        cardNumber.length >= 15 &&
        cardNumber.length <= 16 &&
        validateCard(cardNumber)
      )
    })
    .required('O número do cartão é obrigatório'),
  cardExpirationMonth: yup.string(),
  cardExpirationYear: yup.string(),
  securityCode: yup.string(),
  cardholderName: yup.string(),
  cardholderEmail: yup.string(),
  identificationNumber: yup.string(),
  installments: yup.string(),
  identificationType: yup.string()
})

type HomeProps = {
  amount: string
}

export default function Home({ amount }: HomeProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    getValues,
    formState: { errors }
  } = useForm<CheckoutFormValues>({
    mode: 'all',
    resolver: yupResolver(schema)
  })

  const {
    setAmountValue,
    checkCardDigits,
    cardFlag,
    identificationTypeOptions,
    installmentOptions,
    createToken
  } = useMercadoPago({ setError })

  const [asyncDefaultInstallment, setAsyncDefaultInstallment] =
    useState<number>(0)
  const [asyncDefaultIdentificationType, setAsyncDefaultIdentificationType] =
    useState<number>(0)

  useEffect(() => {
    setAmountValue(amount)
  }, [])

  useEffect(() => {
    if (
      identificationTypeOptions.length > 1 &&
      !asyncDefaultIdentificationType
    ) {
      setValue('identificationType', identificationTypeOptions[0].value)
      setAsyncDefaultIdentificationType(1)
    }
  }, [identificationTypeOptions])

  useEffect(() => {
    if (installmentOptions.length > 1 && !asyncDefaultInstallment) {
      setValue('installments', installmentOptions[0].value)
      setAsyncDefaultInstallment(1)
    }
  }, [installmentOptions])

  function handleCreditCardNumber(value: string) {
    checkCardDigits(value)
  }

  const onSubmit = handleSubmit(async data => {
    const cardToken = await createToken(data)
    console.log(data)
    console.info(cardToken)
  })

  function expirationMonth() {
    let months = []
    for (let i = 1; i <= 12; i++) {
      months.push({
        label: i.toString(),
        value: i.toString()
      })
    }
    return months
  }

  function expirationYear() {
    let years = []
    const currentYear = new Date().getFullYear()
    for (let i = currentYear; i <= currentYear + 15; i++) {
      years.push({
        label: i.toString(),
        value: i.toString()
      })
    }
    return years
  }

  return (
    <div className="flex w-100 h-screen items-center justify-center justify-items-center bg-gray-100">
      <main className="max-w-2xl w-full bg-gray-50 shadow-lg rounded-lg p-2 sm:p-6 m-2">
        <h1 className="text-blue-900 font-bold text-2xl text-center py-1">
          Mercadopago Checkout Transparente
        </h1>
        <p className='text-center text-gray-700'>
        Esta é uma aplicação de exemplo, não utilize um cartao de credito real. <br/>
        <a href='https://www.mercadopago.com.br/developers/pt/guides/online-payments/checkout-pro/test-integration#bookmark_teste_o_fluxo_de_pagamento' className='text-blue-700'>
          acesse os cartões disponíveis para teste aqui.
        </a>
        </p>
        <form
          id="form-checkout"
          className="p-2 sm:p-8 flex flex-col gap-2"
          onSubmit={onSubmit}
        >
          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-6">
              <Input
                type="email"
                {...register('cardholderEmail')}
                id="form-checkout__cardholderEmail"
                label="E-mail do portador"
                placeholder="E-mail do portador"
                error={errors.cardholderEmail}
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Select
                label="CPF/CNPJ"
                error={errors.identificationType}
                {...register('identificationType')}
                id="form-checkout__identificationTypeOptions"
                placeholder="Identificação"
                options={identificationTypeOptions}
              />
            </div>
            <div className="col-span-4 sm:col-span-5">
              <Input
                type="text"
                {...register('identificationNumber')}
                id="form-checkout__identificationNumber"
                label="Número do documento"
                error={errors.identificationNumber}
              />
            </div>
            <div className="col-span-6">
              <Select
                label="Parcelas"
                error={errors.installments}
                {...register('installments')}
                id="form-checkout__installments"
                placeholder="Parcelas"
                options={installmentOptions}
              />
            </div>
            <CreditCard
              cardFlag={cardFlag}
              cardNumber={watch('cardNumber')}
              cvv={watch('securityCode')}
              expirationMonth={watch('cardExpirationMonth')}
              expirationYear={watch('cardExpirationYear')}
              holderName={watch('cardholderName')}
            />
            <div className="col-span-6 sm:col-span-4">
              <Input
                label="Nome do portador"
                id="form-checkout__cardholderEmail"
                type="text"
                placeholder="Nome do portador"
                {...register('cardholderName')}
                error={errors.cardholderName}
              />
            </div>
            <div className="col-span-3 sm:col-span-1">
              <Select
                label="Mês"
                error={errors.cardExpirationMonth}
                {...register('cardExpirationMonth')}
                id="form-checkout__cardExpirationMonth"
                placeholder="Mês"
                options={expirationMonth()}
              />
            </div>
            <div className="col-span-3 sm:col-span-1">
              <Select
                label="Ano"
                error={errors.cardExpirationYear}
                {...register('cardExpirationYear')}
                id="form-checkout__cardExpirationYear"
                placeholder="Mês"
                options={expirationYear()}
              />
            </div>
            <div className="col-span-4">
              <Input
                label="Número do cartão"
                id="cardNumber_"
                type="text"
                {...register('cardNumber')}
                error={errors.cardNumber}
                onChange={e => handleCreditCardNumber(e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <Input
                label="CVV"
                id="form-checkout__securityCode"
                type="number"
                {...register('securityCode')}
                error={errors.securityCode}
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              id="form-checkout__submit"
              className="mp-button"
            >
              Concluir pagamento
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

export function getServerSideProps() {
  return {
    props: {
      amount: '29800'
    }
  }
}
