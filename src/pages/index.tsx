import { useEffect, useState } from "react";
import { MercadoPago } from "../gateways/mercadopago/protocols";
import { useForm } from 'react-hook-form';

type Option = {
  label: string;
  value: string;
};

type FormValues = {
  cardNumber: string
  cardExpirationMonth: number
  cardExpirationYear: number
  securityCode: number
  cardholderName: string
  cardholderEmail: string
  identificationNumber: number
  installments: string;
  identificationType: string;
};

export default function Home() {
  const [mercadopago, setMercadopago] = useState<MercadoPago>();
  const [installmentOptions, setInstallmentOptions] = useState<Option[]>([]);
  const [cardFlag, setCardFlag] = useState<{ image: string, name: string } | null>(null);
  const [amount, setAmount] = useState<string>('1000');
  const [identificationTypeOptions, setIdentificationTypeOptions] = useState<Option[]>([]);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: {},
  });

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.addEventListener("load", () => {
      setMercadopago(
        new window.MercadoPago("TEST-8807ea39-dcbd-490a-9995-03243db129be", {
          locale: "pt-BR",
        })
      );
    });
    document.body.appendChild(script);
    return () => {
      let iframe = document.body.querySelector('iframe[src*="mercadolibre"]');
      if (iframe) {
        document.body.removeChild(iframe);
      }
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (mercadopago) {
      getIdentificationTypes()
    }
  }, [mercadopago]);

  async function getIdentificationTypes() {
    const identificationTypes = await mercadopago.getIdentificationTypes()
    const identificationType = identificationTypes.map((item) => ({
      label: item.name,
      value: item.id
    }))
    setIdentificationTypeOptions(identificationType)
    setValue('identificationType', identificationType[0].value)
  }

  function checkCardDigits(cardNumber: string) {
    if (mercadopago) {
      const cardDigits = cardNumber.replace(/\s/g, '');
      if (cardDigits.length >= 6) {
        const bin = cardDigits.substr(0, 6)
        getCardFlag(bin)
        getInstallments(bin, amount)
      }
    }
  }

  async function getCardFlag(cardFirstSixDigit: string) {
    try {
      const paymentMethods = await mercadopago.getPaymentMethods({ bin: cardFirstSixDigit })
      setCardFlag({
        name: paymentMethods.results[0].name,
        image: paymentMethods.results[0].secure_thumbnail,
      })
      await getInstallments(cardFirstSixDigit, amount)
    } catch (err) {
      setInstallmentOptions([])
    }
  }

  async function getInstallments(bin: string, price: string) {
    const installments = await mercadopago.getInstallments({
      amount: price,
      bin,
    })
    const installment = installments[0].payer_costs.map((item) => ({
      label: item.recommended_message,
      value: item.installments
    }))
    setInstallmentOptions(installment)
    setValue('installments', installment[0].value)
  }

  async function createToken() {
    const cardToken = await mercadopago.createCardToken({
      cardNumber: '5031433215406351',
      cardholderName: 'APRO',
      cardExpirationMonth: '11',
      cardExpirationYear: '2025',
      securityCode: '123',
      identificationType: 'CPF',
      identificationNumber: '12345678912',
    })
  }

  const onSubmit = handleSubmit((data) => console.log(data));

  return (
    <div className="flex w-100 h-screen items-center justify-center justify-items-center bg-gray-100">
      <main className="max-w-xl bg-gray-50 shadow-lg rounded-lg p-8">
        <h1 className="text-blue-900 font-bold text-xl text-center py-4">Mercadopago Checkout Transparente</h1>

        <form id="form-checkout" className="p-8 flex flex-col gap-2" onSubmit={onSubmit}>
          {cardFlag && (<img src={cardFlag.image} alt={cardFlag.name} width="31px" height="24px" />)}

          <div className="flex flex-row gap-2">
            <div className="flex-4">
              <input
                type="text"
                {...register("cardNumber")}
                id="form-checkout__cardNumber"
                placeholder="Número do cartão"
                className="mp-input"
                onChange={(e) => checkCardDigits(e.target.value)}
              />
            </div>

            <div className="flex flex-row flex-1 gap-2">
              <input
                type="text"
                {...register("cardExpirationMonth")}
                id="form-checkout__cardExpirationMonth"
                placeholder="Mês"
                className="mp-input"
              />

              <input
                type="text"
                {...register("cardExpirationYear")}
                id="form-checkout__cardExpirationYear"
                placeholder="Ano"
                className="mp-input"
              />
            </div>

            <div className="flex w-20">
              <input
                type="text"
                {...register("securityCode")}
                id="form-checkout__securityCode"
                placeholder="CVV"
                className="mp-input"
              />
            </div>
          </div>

          <select
            id="form-checkout__installments"
            className="mp-input"
            {...register("installments")}
          >
            {installmentOptions?.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <div>
            <input
              type="text"
              {...register("cardholderName")}
              id="form-checkout__cardholderName"
              placeholder="Nome do portador"
              className="mp-input"
            />
          </div>

          <div>
            <input
              type="email"
              {...register("cardholderEmail")}
              id="form-checkout__cardholderEmail"
              placeholder="E-mail do portador"
              className="mp-input"
            />
          </div>

          <div className="flex flex-row gap-2">
            <div className="flex w-24">
              <select
                {...register("identificationType")}
                id="form-checkout__identificationType"
                className="mp-input"
              >
                {identificationTypeOptions?.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="flex w-full">
              <input
                type="text"
                {...register("identificationNumber")}
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

export function getServerSideProps(){

  return {
    props: {}
  }
}
