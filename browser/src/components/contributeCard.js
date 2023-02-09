import * as React from 'react';
import Haikunator from 'haikunator';
import EntropyProgress from './entropyProgress';
import Buttons from './cardButtons';
import SubmissionProgress from './submissionProgress';
import ThankYou from './thankYou';

export function ContributeCard({ setEntropy, entropy, entropyArr, circuits, isMobile, token, backendServer }) {
  let [name, setName] = React.useState();
  const [submitted, setSubmitted] = React.useState(false);
  const [circuitsSubmitted, setCircuitsSubmitted] = React.useState([]);
  const [entropyOverride, setEntropyOverride] = React.useState(false);
  const [circuitsFailed, setCircuitsFailed] = React.useState([]);
  const [circuitContributionHash, setCircuitContributionHash] = React.useState([]);

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

    for (const circuit of circuits) {
      try {
        const contributionHash = await window.generateContrib({
          circuit,
          type: 'contribution',
          name,
          contribData: entropy,
          token: token,
          backendServer: backendServer
        });

        if (contributionHash) {
          setCircuitsSubmitted(circuitsSubmitted => [...circuitsSubmitted, circuit]);
          setCircuitContributionHash(circuitContributionHash => [...circuitContributionHash, { circuit: circuit, contributionHash: contributionHash}]);
        } else {
          setCircuitsFailed(circuitsFailed => [...circuitsFailed, circuit]);
        }
      } catch (err) {
        setCircuitsFailed(circuitsFailed => [...circuitsFailed, circuit]);
      }
    }
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
        <SubmissionProgress circuits={circuits} circuitsSubmitted={circuitsSubmitted} circuitsFailed={circuitsFailed} circuitContributionHash={circuitContributionHash} />
      )}
      <ThankYou
        circuits={circuits}
        circuitsSubmitted={circuitsSubmitted}
        circuitsFailed={circuitsFailed}
      />
    </div>
  );
}
