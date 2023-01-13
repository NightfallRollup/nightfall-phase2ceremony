import * as React from 'react';
import Haikunator from 'haikunator';
import EntropyProgress from './entropyProgress';
import Buttons from './cardButtons';
import SubmissionProgress from './submissionProgress';
import ThankYou from './thankYou';

export function ContributeCard({ setEntropy, entropy, entropyArr, circuits, isMobile }) {
  let [name, setName] = React.useState();
  const [submitted, setSubmitted] = React.useState(false);
  const [circuitsSubmitted, setCircuitsSubmitted] = React.useState([]);
  const [entropyOverride, setEntropyOverride] = React.useState(false);

  const [verifications, setVerifications] = React.useState();

  const haikunator = new Haikunator({
    defaults: {
      delimiter: '',
      tokenLength: 2,
    },
  });

  async function applyContrib() {
    setSubmitted(true);
    console.log('START: ', new Date());

    // shuffling the array using Durstenfeld shuffle
    for (let i = circuits.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [circuits[i], circuits[j]] = [circuits[j], circuits[i]];
    }

    if (!name) name = haikunator.haikunate();

    const vers = {};
    for (const circuit of circuits) {
      const verification = await window.generateContrib({
        circuit,
        type: 'contribution',
        name,
        contribData: entropy,
        branch: process.env.REACT_APP_BRANCH || 'main',
        NODE_ENV: process.env.NODE_ENV,
      });
      vers[circuit] = verification;
      setCircuitsSubmitted(circuitsSubmitted => [...circuitsSubmitted, circuit]);
    }
    setVerifications(vers);
    console.log('END: ', new Date());
  }

  return (
    <div>
      <EntropyProgress
        entropy={entropy}
        entropyArr={entropyArr}
        isMobile={isMobile}
        entropyOverride={entropyOverride}
      />
      {!submitted ? (
        <Buttons
          submitted={submitted}
          isMobile={isMobile}
          entropyOverride={entropyOverride}
          setEntropyOverride={setEntropyOverride}
          setEntropy={setEntropy}
          entropy={entropy}
          applyContrib={applyContrib}
          setName={setName}
        />
      ) : (
        <SubmissionProgress circuits={circuits} circuitsSubmitted={circuitsSubmitted} />
      )}
      <ThankYou
        circuits={circuits}
        circuitsSubmitted={circuitsSubmitted}
        verifications={verifications}
      />
    </div>
  );
}
