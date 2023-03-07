import axios from 'axios';
import React, { useEffect, useState } from 'react';
import styles from './App.module.css';
import { ContributeCard } from './components/contributeCard';
import { ENTROPY_ARRAY_MAX_SIZE } from './constants';
import { buf2hex } from './utils';

const entropyArr = [];

const CIRCUITS = process.env.REACT_APP_CIRCUITS.split(',').map(e => e.trim());
const BACKEND_HOST = process.env.REACT_APP_BACKEND_HOST;

function App() {
  const [mousePos, setMousePos] = useState({});
  const [doneCapturing, setDoneCapturing] = useState(false);
  const [entropy, setEntropy] = useState(0);
  const isMobile = window.innerWidth < 1024;
  const [token, setToken] = useState('');
  const [isButtonEnabled, enableButton] = useState(true);

  async function getToken() {
    try {
      const res = await axios.get(`${BACKEND_HOST}/token`);
      if(res.data.token) 
        setToken(res.data.token);
      else
        alert('Sorry, someone is contributing at the moment. Please, try some minutes later. Thank you!');
    } catch (err) {
      if(err.response) {
        enableButton(false);
        alert(err.response.data);
      } else
        alert(err.message);
    }
  }

  // captures mouse events to generate the entropy
  useEffect(() => {
    if (! token) return;

    const handleMouseMove = event => {
      setMousePos({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [token]);
 
  // sets the entropy once the generation is done
  useEffect(() => {
    if (!mousePos.x || entropy || isMobile) return;

    if (!doneCapturing) {
      entropyArr.push(Math.round(mousePos.x * mousePos.y));

      if (entropyArr.length >= ENTROPY_ARRAY_MAX_SIZE) setDoneCapturing(true);

    } else if (!entropy) {
      const stream = new TextEncoder().encode(entropyArr.reduce((acc, current) => acc + current));
      crypto.subtle.digest('SHA-256', stream).then(hash => {
        setEntropy(buf2hex(hash));
      });
    }
  }, [mousePos, doneCapturing, entropy, isMobile]);

  return (
    <div className={styles.app}>
      <div className={styles.app__logo}>
        <svg
          fill="none"
          height="56"
          viewBox="0 0 512 512"
          width="56"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="m214.337 11.1146c25.668-14.81947 57.292-14.81947 82.96 0l149.857 86.5198c25.668 14.8196 41.48 42.2066 41.48 71.8456v173.04c0 29.639-15.812 57.026-41.48 71.846l-149.857 86.519c-25.668 14.82-57.292 14.82-82.96 0l-149.8567-86.519c-25.6681-14.82-41.4803-42.207-41.4803-71.846v-173.04c0-29.639 15.8122-57.026 41.4803-71.8456z"
            fill="#fff"
          />
          <path
            d="m415.431 128.72-129.214-74.6332c-9.257-5.3162-19.745-8.1134-30.419-8.1134-10.675 0-21.163 2.7972-30.419 8.1134l-45.457 26.2632c11.313 3.7018 21.792 9.5821 30.846 17.3085l29.821-17.2226c4.625-2.6665 9.87-4.0702 15.209-4.0702s10.583 1.4037 15.209 4.0702l44.514 25.7061-61.652 55.825 15.596 26.948 73.734-66.793 57.024 32.947c4.618 2.666 8.457 6.5 11.125 11.117 2.669 4.617 4.079 9.855 4.083 15.189v57.495l-97.253 34.488 15.465 26.778 81.788-29.006v59.51c-.008 5.318-1.411 10.54-4.064 15.147s-6.465 8.442-11.057 11.118c-.046 0-.046.042-.087.042 0 0-26.091 15.083-26.349 15.208-6.937 3.718-15.045 4.596-22.617 2.444-7.572-2.151-14.011-7.157-17.956-13.969l-129.344-224.07c-8.088-13.907-21.348-24.052-36.888-28.217-15.54-4.166-32.097-2.016-46.056 5.982l-24.7648 14.31-.1277.085c-9.2222 5.358-16.8791 13.039-22.209 22.277-5.3298 9.239-8.146 19.712-8.1685 30.378v149.265c.0225 10.666 2.8387 21.141 8.1685 30.378 5.3295 9.24 12.9868 16.919 22.209 22.278l129.2585 74.634c9.26 5.307 19.746 8.097 30.419 8.097 10.672 0 21.159-2.79 30.419-8.097l44.986-26.007c-11.322-3.683-21.804-9.567-30.848-17.31l-29.348 16.968c-4.63 2.653-9.873 4.048-15.209 4.048s-10.579-1.395-15.208-4.048l-105.567-60.965 111.221-39.459-15.466-26.779-113.922 40.444c-1.484.517-3.1.505-4.576-.035-1.477-.539-2.721-1.569-3.522-2.923-.802-1.349-1.112-2.938-.877-4.492.234-1.551.999-2.977 2.164-4.033l90.228-81.744-15.552-26.949-88.6005 80.245v-123.516c.0057-5.334 1.4136-10.572 4.0835-15.189 2.669-4.617 6.506-8.451 11.125-11.117l.13-.086s25.147-14.524 25.319-14.609c6.946-3.81 15.107-4.751 22.737-2.621 7.631 2.129 14.125 7.161 18.094 14.017l129.388 224.072c8.091 13.889 21.347 24.019 36.878 28.178 15.528 4.158 32.074 2.007 46.024-5.987l25.532-14.737c.045 0 .045-.042.087-.042 9.21-5.355 16.858-13.034 22.179-22.263 5.322-9.232 8.135-19.693 8.154-30.351v-149.265c-.023-10.671-2.843-21.149-8.18-30.389-5.337-9.239-13.007-16.917-22.24-22.266z"
            fill="#7b3fe4"
          />
        </svg>
        Nightfall Phase2 Ceremony
      </div>
      <p>
          Zero-knowledge proofs require a trusted setup. Since Nightfall uses the Groth16 proving
          scheme, a second phase of the MPC is needed, for each circuit. We want to invite you to
          contribute to this Second Phase. To start, just move your {isMobile ? 'device' : 'cursor'}{' '}
          to generate some entropy. If you want, you can also enter your name for later verification.
        </p>
      <div style={{display: token == '' ? 'none' : 'inline'}}>
        <p>The process might take 10-20mins. Go grab a coffee!</p>
        <div style={{display: entropy == 0 ? 'none' : 'inline'}}>
          Entropy: {entropy}
        </div>
        <ContributeCard
          setEntropy={setEntropy}
          entropy={entropy}
          entropyArr={entropyArr}
          circuits={CIRCUITS}
          isMobile={isMobile}
          token={token}
          backendServer={BACKEND_HOST}
        />
      </div>
      <div className="buttons" style={{display: !token ? 'inline' : 'none'}}>
        <button onClick={getToken} style={{display: isButtonEnabled ? 'inline' : 'none'}}>
          Let's do it!
        </button>
      </div>
    </div>
  );
}

export default App;
