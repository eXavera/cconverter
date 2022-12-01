import { SelectNative, SelectNativeProps, SelectOption } from "@purple/phoenix-components"
import { Currency } from "../Common/types"

interface SelectCurrencyProps extends Omit<SelectNativeProps, "onChange"> {
    currency: Currency,
    currencies: Currency[]
    onChange: (value: Currency | null) => void
}

export const SelectCurrency: React.FC<SelectCurrencyProps> = ({
    currency,
    currencies,
    onChange: onChange,
    ...props
}) => {
    const toSelectOption = (currency: Currency): SelectOption => {
        return {
            value: currency,
            label: currency
        }
    }

    return (
        <SelectNative
            value={toSelectOption(currency)}
            options={currencies.map(toSelectOption)}
            onChange={selectedValue => onChange(selectedValue?.value as Currency)}
            {...props}
        />
    )
}