import {
  DetailedHTMLProps,
  forwardRef,
  ForwardRefRenderFunction,
  InputHTMLAttributes
} from 'react'
import { FieldError } from 'react-hook-form'

type InputProps = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  id: string
  label: string
  error: FieldError
}

export const InputBase: ForwardRefRenderFunction<HTMLInputElement, InputProps> =
  ({ id, label, error, ...rest }, ref) => {
    return (
      <div className="w-full">
        <label htmlFor={id} className=" text-gray-600">
          {label}
        </label>
        <input
          type="text"
          {...rest}
          id={id}
          placeholder={label}
          className="mp-input"
          aria-describedby="inputGroupPrepend3"
          ref={ref}
        />
        {error?.message && (
          <div className="mt-1 text-sm text-red-600">{error.message}</div>
        )}
      </div>
    )
  }

export const Input = forwardRef(InputBase)
