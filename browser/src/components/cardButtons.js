import { MANUAL_ENTROPY_MIN_LENGTH, MAX_NAME_LENGTH } from '../constants';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import { DebounceInput } from 'react-debounce-input';

export default function Buttons({
  submitted,
  isMobile,
  entropyOverride,
  setEntropyOverride,
  setEntropy,
  entropy,
  applyContrib,
  setName,
}) {
  const [isValidEntropy, setIsValidEntropy] = useState(true);
  const [isValidName, setIsValidName] = useState(true);

  function validateEntropy(e) {
    e.preventDefault();
    if (e.target.value.length < MANUAL_ENTROPY_MIN_LENGTH) {
      setTimeout(() => setIsValidEntropy(false), 1000);
      setEntropy(null);
    } else {
      setIsValidEntropy(true);
      setEntropy(e.target.value);
    }
  }

  function validateName(e) {
    e.preventDefault();

    const regex = new RegExp(/^\w+$/);
    if (e.target.value.length > MAX_NAME_LENGTH || !regex.test(e.target.value)) {
      setIsValidName(false);
      setName(null);
    } else {
      setIsValidName(true);
      setName(e.target.value);
    }
  }

  return (
    <div>
      {isMobile || entropyOverride ? (
        <div className="input">
          <DebounceInput
            element={TextField}
            className="input__text"
            type="text"
            error={!isValidEntropy}
            label="Entropy"
            helperText={!isValidEntropy ? 'At least 20 characters' : ''}
            id="entropy"
            onChange={validateEntropy}
          />
        </div>
      ) : (
        <></>
      )}
      <div className="input">
        <DebounceInput
          element={TextField}
          className="input__text"
          type="text"
          id="name"
          error={!isValidName}
          label="Name (optional)"
          disabled={!entropy}
          variant={!isValidName ? 'filled' : 'standard'}
          helperText={!isValidName ? 'Maximum 40 alphanumeric characters' : ''}
          onChange={validateName}
        />
      </div>

      <div className="buttons">
        {!entropy && !isMobile && (
          <button onClick={setEntropyOverride}>Input my own entropy</button>
        )}
        <button disabled={!entropy || submitted} onClick={applyContrib}>
          Contribute
        </button>
      </div>
    </div>
  );
}
