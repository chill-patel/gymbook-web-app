import 'react-international-phone/style.css';

import { InputAdornment, MenuItem, Select, TextField, Typography } from '@mui/material';
import {
  defaultCountries,
  FlagImage,
  parseCountry,
  usePhoneInput,
} from 'react-international-phone';
import type { CountryIso2 } from 'react-international-phone';

interface MuiPhoneInputProps {
  defaultCountry?: CountryIso2;
  label?: string;
  /** E.164 phone string to pre-populate, e.g. "+919876543210" */
  initialPhone?: string;
  onPhoneChange: (data: { callingCode: string; countryCode: string; nationalNumber: string }) => void;
}

export default function MuiPhoneInput({
  onPhoneChange,
  defaultCountry = 'in',
  label = 'Mobile',
  initialPhone,
}: MuiPhoneInputProps) {
  const { inputValue, handlePhoneValueChange, inputRef, country, setCountry } =
    usePhoneInput({
      defaultCountry,
      value: initialPhone,
      countries: defaultCountries,
      onChange: (data) => {
        const dialCode = data.country.dialCode;
        const national = data.phone.replace(`+${dialCode}`, '');
        onPhoneChange({
          callingCode: dialCode,
          countryCode: data.country.iso2.toUpperCase(),
          nationalNumber: national,
        });
      },
    });

  return (
    <TextField
      variant="outlined"
      label={label}
      fullWidth
      value={inputValue}
      onChange={handlePhoneValueChange}
      type="tel"
      inputRef={inputRef}
      InputProps={{
        startAdornment: (
          <InputAdornment
            position="start"
            style={{ marginRight: '2px', marginLeft: '-8px' }}
          >
            <Select
              MenuProps={{
                style: {
                  height: '300px',
                  width: '360px',
                  top: '10px',
                  left: '-34px',
                },
                transformOrigin: {
                  vertical: 'top',
                  horizontal: 'left',
                },
              }}
              sx={{
                width: 'max-content',
                fieldset: {
                  display: 'none',
                },
                '&.Mui-focused:has(div[aria-expanded="false"])': {
                  fieldset: {
                    display: 'block',
                  },
                },
                '.MuiSelect-select': {
                  padding: '8px',
                  paddingRight: '24px !important',
                },
                svg: {
                  right: 0,
                },
              }}
              value={country.iso2}
              onChange={(e) => setCountry(e.target.value as CountryIso2)}
              renderValue={(value) => (
                <FlagImage iso2={value as CountryIso2} style={{ display: 'flex' }} />
              )}
            >
              {defaultCountries.map((c) => {
                const parsed = parseCountry(c);
                return (
                  <MenuItem key={parsed.iso2} value={parsed.iso2}>
                    <FlagImage iso2={parsed.iso2} style={{ marginRight: '8px' }} />
                    <Typography marginRight="8px">{parsed.name}</Typography>
                    <Typography color="gray">+{parsed.dialCode}</Typography>
                  </MenuItem>
                );
              })}
            </Select>
          </InputAdornment>
        ),
      }}
    />
  );
}
