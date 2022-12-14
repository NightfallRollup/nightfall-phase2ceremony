import { MANUAL_ENTROPY_MIN_LENGTH } from '../constants';

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
  return (
    <div>
      {isMobile || entropyOverride ? (
        <div className="input">
          <label className="input__label" htmlFor="entropy">
            Entropy
          </label>
          <input
            className="input__text"
            type="text"
            id="entropy"
            onChange={e => {
              e.target.value.length > MANUAL_ENTROPY_MIN_LENGTH
                ? setEntropy(e.target.value)
                : setEntropy(null);
            }}
          />
        </div>
      ) : (
        <></>
      )}
      <div className="input">
        <label className="input__label" htmlFor="name">
          Name (optional)
        </label>
        <input
          className="input__text"
          type="text"
          id="name"
          disabled={!entropy}
          onChange={e => setName(e.target.value)}
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
