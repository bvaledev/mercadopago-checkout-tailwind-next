import { useEffect, useState } from 'react'
import { MercadoPago } from '../gateways/mercadopago/protocols'
import { useForm } from 'react-hook-form'
import { useMercadoPago } from '../gateways/mercadopago/useMercadopago'

type FormValues = {
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

type HomeProps = {
  amount: string
}
export default function Home({amount}:HomeProps) {
  const {
    setAmountValue,
    checkCardDigits,
    cardFlag,
    identificationTypeOptions,
    installmentOptions,
    createToken
  } = useMercadoPago({})

  const [asyncDefaultInstallment, setAsyncDefaultInstallment] = useState<number>(0)
  const [asyncDefaultIdentificationType, setAsyncDefaultIdentificationType] = useState<number>(0)


  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors }
  } = useForm<FormValues>({
    defaultValues: {}
  })

  useEffect(() => {
    setAmountValue(amount)
  }, [])

  useEffect(() => {
    if(identificationTypeOptions.length > 1 && !asyncDefaultIdentificationType){
      setValue('identificationType', identificationTypeOptions[0].value)
      setAsyncDefaultIdentificationType(1)
    }
  }, [identificationTypeOptions])

  useEffect(() => {
    if(installmentOptions.length > 1 && !asyncDefaultInstallment){
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

  return (
    <div className="flex w-100 h-screen items-center justify-center justify-items-center bg-gray-100">
      <main className="max-w-xl bg-gray-50 shadow-lg rounded-lg p-8">
        <h1 className="text-blue-900 font-bold text-xl text-center py-4">
          Mercadopago Checkout Transparente
        </h1>

        <form
          id="form-checkout"
          className="p-8 flex flex-col gap-2"
          onSubmit={onSubmit}
        >
          {cardFlag && (
            <img
              src={cardFlag.image}
              alt={cardFlag.name}
              width="31px"
              height="24px"
            />
          )}

          <div className="flex flex-row gap-2">
            <div className="flex-4">
              <input
                type="text"
                {...register('cardNumber')}
                id="form-checkout__cardNumber"
                placeholder="Número do cartão"
                className="mp-input"
                onChange={e => handleCreditCardNumber(e.target.value)}
              />
            </div>

            <div className="flex flex-row flex-1 gap-2">
              <input
                type="text"
                {...register('cardExpirationMonth')}
                id="form-checkout__cardExpirationMonth"
                placeholder="Mês"
                className="mp-input"
              />

              <input
                type="text"
                {...register('cardExpirationYear')}
                id="form-checkout__cardExpirationYear"
                placeholder="Ano"
                className="mp-input"
              />
            </div>

            <div className="flex w-20">
              <input
                type="text"
                {...register('securityCode')}
                id="form-checkout__securityCode"
                placeholder="CVV"
                className="mp-input"
              />
            </div>
          </div>

          <select
            id="form-checkout__installments"
            className="mp-input"
            {...register('installments')}
          >
            {installmentOptions?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div>
            <input
              type="text"
              {...register('cardholderName')}
              id="form-checkout__cardholderName"
              placeholder="Nome do portador"
              className="mp-input"
            />
          </div>

          <div>
            <input
              type="email"
              {...register('cardholderEmail')}
              id="form-checkout__cardholderEmail"
              placeholder="E-mail do portador"
              className="mp-input"
            />
          </div>

          <div className="flex flex-row gap-2">
            <div className="flex w-24">
              <select
                {...register('identificationType')}
                id="form-checkout__identificationType"
                className="mp-input"
              >
                {identificationTypeOptions?.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex w-full">
              <input
                type="text"
                {...register('identificationNumber')}
                id="form-checkout__identificationNumber"
                className="mp-input"
              />
            </div>
          </div>

          <button type="submit" id="form-checkout__submit">
            Pagar
          </button>
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
