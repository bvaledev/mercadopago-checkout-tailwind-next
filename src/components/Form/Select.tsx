import {
  DetailedHTMLProps,
  forwardRef,
  ForwardRefRenderFunction,
  SelectHTMLAttributes
} from 'react'
import { FieldError } from 'react-hook-form'

type SelectOptions = {
  label: string
  value: string
}

type InputProps = DetailedHTMLProps<
  SelectHTMLAttributes<HTMLSelectElement>,
  HTMLSelectElement
> & {
  id: string
  label: string
  error: FieldError
  options: SelectOptions[]
}

export const SelectBase: ForwardRefRenderFunction<
  HTMLSelectElement,
  InputProps
> = ({ id, label, error, options = [], ...rest }, ref) => {
  return (
    <div className="w-full">
      <label htmlFor={id} className=" text-gray-600">
        {label}
      </label>
      <select
        id={id}
        className={`mp-input ${error?.message && 'border-red-600'}`}
        {...rest}
        placeholder={label}
        ref={ref}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error?.message && (
        <div className="mt-1 text-sm text-red-600">{error.message}</div>
      )}
    </div>
  )
}

export const Select = forwardRef(SelectBase)
