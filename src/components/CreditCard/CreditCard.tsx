import { CardFlag } from '../../gateways/mercadopago/useMercadopago'

type CreditCardProps = {
  cardFlag: CardFlag
  expirationMonth: string
  expirationYear: string
  holderName: string
  cardNumber: string
  cvv: string
}

export function CreditCard({
  cardFlag,
  cardNumber,
  holderName,
  expirationMonth,
  expirationYear,
  cvv
}: CreditCardProps) {
  return (
    <div className="col-span-6 flex justify-center py-3">
      <div className="h-44 sm:h-60 md:h-72 w-full text-shadow max-w-xs sm:max-w-md md:max-w-lg flex flex-col justify-between items-stretch p-5 text-xl rounded-xl shadow-lg bg-gradient-to-r from-gray-200  to-gray-400 text-gray-50">
        <div className="w-12 sm:w-16">
          {cardFlag && (
            <img src={cardFlag.image} alt={cardFlag.name} className="w-full  p-1 sm:p-2 " />
          )}
        </div>
        <div className="w-36 sm:w-64">
          <div className="tracking-wide text-sm sm:text-2xl mb-1">
            {cardNumber || '0000 0000 0000 0000'}
          </div>
          <div className="flex flex-row justify-between text-sm sm:text-lg pr-3 mb-4">
            <span>
              {expirationMonth?.padStart(2, '0')}/{expirationYear}
            </span>
            <span>{cvv || '000'}</span>
          </div>
          <div className=" tracking-wider text-sm sm:text-lg">
            {holderName || 'UMA PESSOA BONITA'}
          </div>
        </div>
      </div>
    </div>
  )
}
